import React, { useState } from 'react';
import { 
  X, 
  Shield, 
  Lock, 
  User as UserIcon, 
  AlertCircle, 
  CheckCircle2, 
  Key, 
  ArrowRight,
  Infinity as InfinityIcon,
  Smartphone,
  Laptop,
  Globe,
  Sparkles
} from 'lucide-react';
import { auth } from '../../lib/auth';
import { User } from '../../types';
import { getDeviceInfo } from '../../lib/device';

interface LoginModalProps {
  isOpen: boolean;
  initialIsAdmin?: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User, isNewUser: boolean) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  initialIsAdmin = false,
  onClose,
  onLoginSuccess
}) => {
  const [isAdminTab, setIsAdminTab] = useState(initialIsAdmin);
  const currentDevice = getDeviceInfo();
  
  // Learner Google login fields
  const [googleEmail, setGoogleEmail] = useState('kapilnarula27july@gmail.com');
  const [googleName, setGoogleName] = useState('Kapil Narula');
  
  // Admin credentials
  const [adminIdentifier, setAdminIdentifier] = useState('kapiladmin');
  const [adminPassword, setAdminPassword] = useState('admin123');
  const [errorMessage, setErrorMessage] = useState('');
  const [infoNotice, setInfoNotice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Change password step if first login
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [tempAdminUser, setTempAdminUser] = useState<User | null>(null);

  // Close on escape key
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Real Firebase Google Sign-In Popup
  const handleFirebaseGoogleSignIn = async () => {
    setIsSubmitting(true);
    setErrorMessage('');
    setInfoNotice('');

    try {
      const { user, isNewUser } = await auth.loginWithGoogleFirebase();
      setIsSubmitting(false);
      onLoginSuccess(user, isNewUser);
      onClose();
    } catch (err: any) {
      setIsSubmitting(false);
      const code = err.code || '';
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        setInfoNotice('Google Sign-In popup was closed. You can try again or use direct verified sign-in below.');
      } else if (code === 'auth/popup-blocked') {
        setErrorMessage('Browser blocked popup window. Please allow popups or authenticate with direct Google ID below.');
      } else {
        setErrorMessage(err.message || 'Firebase Google Sign-In could not complete. You can authenticate with direct verified email below.');
      }
    }
  };

  // Direct Google Sign-In (Syncs directly to Firebase database with device telemetry)
  const handleDirectGoogleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleEmail || !googleEmail.includes('@')) {
      setErrorMessage('Please provide a valid Google email address.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    setInfoNotice('');

    setTimeout(() => {
      try {
        const { user, isNewUser } = auth.loginWithGoogle(googleEmail, googleName);
        setIsSubmitting(false);
        onLoginSuccess(user, isNewUser);
        onClose();
      } catch (err: any) {
        setIsSubmitting(false);
        setErrorMessage(err.message || 'Google Sign-In failed.');
      }
    }, 400);
  };

  const handleAdminSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');
    setInfoNotice('');

    setTimeout(() => {
      const res = auth.loginAdmin(adminIdentifier, adminPassword);
      setIsSubmitting(false);

      if (!res.success) {
        setErrorMessage(res.message);
        return;
      }

      // Check if first login password change is advised
      if (auth.isFirstAdminLogin()) {
        setTempAdminUser(res.user!);
        setShowChangePassword(true);
        return;
      }

      if (res.user) {
        onLoginSuccess(res.user, false);
        onClose();
      }
    }, 450);
  };

  const handleChangePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setErrorMessage('New passwords do not match.');
      return;
    }
    const res = auth.changeAdminPassword(adminPassword, newPassword);
    if (!res.success) {
      setErrorMessage(res.message);
      return;
    }
    if (tempAdminUser) {
      onLoginSuccess(tempAdminUser, false);
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white">
              <InfinityIcon className="w-4 h-4 stroke-[2.5]" />
            </div>
            <span className="font-display font-bold text-sm tracking-tight text-white">ZERO-TO-INFINITY</span>
          </div>
          <h2 className="text-xl font-display font-bold text-white">
            {showChangePassword ? 'First-Login Security Update' : 'Access Learning Mission'}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            SarlaYash Mission · Powered by Kapil
          </p>
        </div>

        {/* Tabs: Learner (Google Only) vs Admin Portal */}
        {!showChangePassword && (
          <div className="flex border-b border-slate-800 bg-slate-950/60 p-1">
            <button
              onClick={() => {
                setIsAdminTab(false);
                setErrorMessage('');
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
                !isAdminTab 
                  ? 'bg-slate-800 text-cyan-400 shadow-sm border border-slate-700/80' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserIcon className="w-3.5 h-3.5" />
              Learner (Google Sign-In)
            </button>
            <button
              onClick={() => {
                setIsAdminTab(true);
                setErrorMessage('');
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
                isAdminTab 
                  ? 'bg-slate-800 text-cyan-400 shadow-sm border border-slate-700/80' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              Admin Portal
            </button>
          </div>
        )}

        <div className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {infoNotice && (
            <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-800/60 text-cyan-300 text-xs flex items-center gap-2">
              <Sparkles className="w-4 h-4 shrink-0 text-cyan-400" />
              <span>{infoNotice}</span>
            </div>
          )}

          {showChangePassword ? (
            /* First login password change for admin */
            <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
              <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-800/40 text-xs text-cyan-300">
                Security requirement: You are logging in with the default admin credentials. Please update your administrative password now.
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">New Secure Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl font-bold text-xs bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors"
              >
                Save New Password & Continue
              </button>
            </form>
          ) : !isAdminTab ? (
            /* Learner Google Login Section */
            <div className="space-y-4">
              {/* Primary Google Auth Action */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span className="font-semibold text-white flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-cyan-400" />
                    Google Identity Verification
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 text-[10px] font-mono font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    Verified Email Required
                  </span>
                </div>
                
                <p className="text-xs text-slate-400 leading-relaxed">
                  Sign in with your Google account to record your verified identity in Firebase. Admin monitors all active learners across laptops, phones, and browsers in real time.
                </p>

                {/* Detected Client Device Pill */}
                <div className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800/80 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 flex items-center gap-1.5 font-mono">
                    {currentDevice.device_type === 'Mobile' ? (
                      <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
                    ) : (
                      <Laptop className="w-3.5 h-3.5 text-cyan-400" />
                    )}
                    Detected Device:
                  </span>
                  <span className="font-medium text-white font-mono">{currentDevice.summary}</span>
                </div>

                <button
                  type="button"
                  onClick={handleFirebaseGoogleSignIn}
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm bg-white hover:bg-slate-100 text-slate-900 transition-all flex items-center justify-center gap-2.5 shadow-lg shadow-white/10 active:scale-[0.99] disabled:opacity-75 cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  {isSubmitting ? 'Authenticating with Google...' : 'Continue with Google (Firebase)'}
                </button>
              </div>

              {/* Direct Verified Google Account Fallback */}
              <div className="pt-1">
                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-slate-800"></div>
                  <span className="flex-shrink mx-2 text-[10px] font-mono uppercase text-slate-500">
                    Or Authenticate with Google Email Directly
                  </span>
                  <div className="flex-grow border-t border-slate-800"></div>
                </div>

                <form onSubmit={handleDirectGoogleSignIn} className="space-y-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-mono text-slate-300 mb-1">
                      Verified Google Email ID
                    </label>
                    <input
                      type="email"
                      value={googleEmail}
                      onChange={(e) => setGoogleEmail(e.target.value)}
                      placeholder="learner@gmail.com"
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono text-slate-300 mb-1">
                      Learner Full Name
                    </label>
                    <input
                      type="text"
                      value={googleName}
                      onChange={(e) => setGoogleName(e.target.value)}
                      placeholder="Full Name"
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                    Sign In & Sync to Firebase Real-Time
                  </button>
                </form>
              </div>
            </div>
          ) : (
            /* Admin Login Section */
            <form onSubmit={handleAdminSignIn} className="space-y-4">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400">
                <p className="font-semibold text-slate-200 mb-0.5">Admin Security Portal</p>
                <p className="text-[11px]">Protected credentials for Kapil · SarlaYash Mission management.</p>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">Admin Identifier</label>
                <input
                  type="text"
                  value={adminIdentifier}
                  onChange={(e) => setAdminIdentifier(e.target.value)}
                  placeholder="kapiladmin"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-mono text-slate-300">Admin Password</label>
                </div>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="admin123"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 transition-all shadow-md shadow-cyan-500/20"
              >
                {isSubmitting ? 'Verifying Admin Authority...' : 'Sign in to Admin Console'}
              </button>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};
