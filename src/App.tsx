import React, { useState, useEffect } from 'react';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { DemoModeBanner } from './components/common/DemoModeBanner';
import { LandingPage } from './components/public/LandingPage';
import { TrackDetailPage } from './components/public/TrackDetailPage';
import { LegalPages } from './components/public/LegalPages';
import { LearnerDashboard } from './components/learner/LearnerDashboard';
import { DailyMissionView } from './components/learner/DailyMissionView';
import { AssignmentCenter } from './components/learner/AssignmentCenter';
import { ProgressTimeline } from './components/learner/ProgressTimeline';
import { CredentialsWallet } from './components/learner/CredentialsWallet';
import { VerificationView } from './components/verification/VerificationView';
import { AdminPortal } from './components/admin/AdminPortal';
import { LoginModal } from './components/auth/LoginModal';
import { OnboardingModal } from './components/auth/OnboardingModal';
import { PaymentModal } from './components/learner/PaymentModal';
import { storage } from './lib/storage';
import { auth } from './lib/auth';
import { User, Track } from './types';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => auth.getCurrentUser());
  const [currentPath, setCurrentPath] = useState<string>(() => window.location.pathname || '/');
  
  // Modals state
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [loginModalIsAdmin, setLoginModalIsAdmin] = useState(false);
  const [onboardingModalOpen, setOnboardingModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentSelectedTrack, setPaymentSelectedTrack] = useState<Track | null>(null);

  // Sync route on popstate (browser back/forward)
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenLogin = (isAdmin = false) => {
    setLoginModalIsAdmin(isAdmin);
    setLoginModalOpen(true);
  };

  const handleLoginSuccess = (user: User, isNewUser: boolean) => {
    setCurrentUser(user);
    if (user.role === 'admin') {
      navigate('/admin');
    } else {
      const profile = storage.getProfileByUserId(user.id);
      if (isNewUser || !profile?.onboarding_completed) {
        setOnboardingModalOpen(true);
      }
      navigate('/dashboard');
    }
  };

  const handleLogout = () => {
    auth.logout();
    setCurrentUser(null);
    navigate('/');
  };

  const handleOpenPayment = (track: Track) => {
    if (!currentUser) {
      handleOpenLogin(false);
      return;
    }
    setPaymentSelectedTrack(track);
    setPaymentModalOpen(true);
  };

  const handleEnrollFromTrack = (trackId: string) => {
    const track = storage.getTrack(trackId);
    if (track) {
      handleOpenPayment(track);
    }
  };

  // Route parser
  const renderContent = () => {
    const path = currentPath || '/';

    // 1. Verification Routes
    if (path.startsWith('/verify/certificate/')) {
      const certNum = decodeURIComponent(path.replace('/verify/certificate/', ''));
      return (
        <VerificationView
          type="certificate"
          identifier={certNum}
          onNavigate={navigate}
        />
      );
    }
    if (path.startsWith('/verify/badge/')) {
      const badgeId = decodeURIComponent(path.replace('/verify/badge/', ''));
      return (
        <VerificationView
          type="badge"
          identifier={badgeId}
          onNavigate={navigate}
        />
      );
    }
    if (path === '/verify') {
      return (
        <VerificationView
          type="certificate"
          onNavigate={navigate}
        />
      );
    }

    // 2. Admin Portal Route
    if (path === '/admin') {
      if (!currentUser || currentUser.role !== 'admin') {
        return (
          <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 space-y-4">
            <h2 className="text-2xl font-bold">Admin Authority Required</h2>
            <p className="text-sm text-slate-400">Please authenticate with Kapil admin credentials to access mission management.</p>
            <button
              onClick={() => handleOpenLogin(true)}
              className="py-2.5 px-6 rounded-xl font-bold text-xs bg-cyan-500 hover:bg-cyan-400 text-slate-950"
            >
              Open Admin Sign-In
            </button>
          </div>
        );
      }
      return <AdminPortal currentUser={currentUser} onNavigate={navigate} />;
    }

    // 3. Learner Routes (Protected)
    if (path === '/dashboard') {
      if (!currentUser) {
        return (
          <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 space-y-4">
            <h2 className="text-2xl font-bold">Sign In to Enter Dashboard</h2>
            <p className="text-sm text-slate-400">Log in with your verified Google account to track your daily hands-on mission progress.</p>
            <button
              onClick={() => handleOpenLogin(false)}
              className="py-2.5 px-6 rounded-xl font-bold text-xs bg-cyan-500 hover:bg-cyan-400 text-slate-950"
            >
              Learner Google Sign-In
            </button>
          </div>
        );
      }
      return (
        <LearnerDashboard
          user={currentUser}
          onNavigate={navigate}
          onOpenPayment={handleOpenPayment}
        />
      );
    }

    // 4. Daily Mission View (`/learn/:trackSlug/day/:dayNumber`)
    if (path.startsWith('/learn/')) {
      const parts = path.split('/');
      // /learn/generative-ai/day/1 -> parts: ['', 'learn', 'generative-ai', 'day', '1']
      const trackSlug = parts[2] || 'generative-ai';
      const dayNum = parseInt(parts[4] || '1', 10);

      if (!currentUser) {
        return (
          <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 space-y-4">
            <h2 className="text-2xl font-bold">Sign In to Access Day {dayNum}</h2>
            <p className="text-sm text-slate-400">Please log in to submit your practical deliverables.</p>
            <button
              onClick={() => handleOpenLogin(false)}
              className="py-2.5 px-6 rounded-xl font-bold text-xs bg-cyan-500 hover:bg-cyan-400 text-slate-950"
            >
              Sign In to Continue
            </button>
          </div>
        );
      }

      return (
        <DailyMissionView
          user={currentUser}
          trackSlug={trackSlug}
          dayNumber={dayNum}
          onNavigate={navigate}
          onOpenPayment={handleOpenPayment}
        />
      );
    }

    // 5. Assignment Center
    if (path === '/assignments') {
      if (!currentUser) {
        return (
          <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 space-y-4">
            <h2 className="text-2xl font-bold">Sign In Required</h2>
            <button onClick={() => handleOpenLogin(false)} className="py-2 px-4 rounded-xl text-xs bg-cyan-500 text-slate-950 font-bold">
              Sign In
            </button>
          </div>
        );
      }
      return <AssignmentCenter user={currentUser} onNavigate={navigate} />;
    }

    // 6. Progress Timeline
    if (path === '/progress') {
      if (!currentUser) {
        return (
          <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 space-y-4">
            <h2 className="text-2xl font-bold">Sign In Required</h2>
            <button onClick={() => handleOpenLogin(false)} className="py-2 px-4 rounded-xl text-xs bg-cyan-500 text-slate-950 font-bold">
              Sign In
            </button>
          </div>
        );
      }
      return <ProgressTimeline user={currentUser} onNavigate={navigate} />;
    }

    // 7. Credentials Wallet
    if (path === '/credentials') {
      if (!currentUser) {
        return (
          <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 space-y-4">
            <h2 className="text-2xl font-bold">Sign In Required</h2>
            <button onClick={() => handleOpenLogin(false)} className="py-2 px-4 rounded-xl text-xs bg-cyan-500 text-slate-950 font-bold">
              Sign In
            </button>
          </div>
        );
      }
      return <CredentialsWallet user={currentUser} onNavigate={navigate} />;
    }

    // 8. Track Details
    if (path === '/tracks/generative-ai') {
      return (
        <TrackDetailPage
          trackSlug="generative-ai"
          currentUser={currentUser}
          onNavigate={navigate}
          onEnroll={handleEnrollFromTrack}
        />
      );
    }
    if (path === '/tracks/agentic-ai') {
      return (
        <TrackDetailPage
          trackSlug="agentic-ai"
          currentUser={currentUser}
          onNavigate={navigate}
          onEnroll={handleEnrollFromTrack}
        />
      );
    }
    if (path === '/tracks') {
      return (
        <TrackDetailPage
          trackSlug="generative-ai"
          currentUser={currentUser}
          onNavigate={navigate}
          onEnroll={handleEnrollFromTrack}
        />
      );
    }

    // 9. Legal and Information Pages
    if (['/about', '/terms', '/privacy', '/refund', '/conduct'].includes(path)) {
      return <LegalPages page={path as any} onNavigate={navigate} />;
    }

    if (path === '/notifications') {
      if (currentUser) {
        return (
          <LearnerDashboard
            user={currentUser}
            onNavigate={navigate}
            onOpenPayment={handleOpenPayment}
          />
        );
      }
    }

    // Default: Landing Page
    return (
      <LandingPage
        currentUser={currentUser}
        onNavigate={navigate}
        onOpenLogin={handleOpenLogin}
        onEnrollTrack={handleEnrollFromTrack}
      />
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Demo Mode & Operational Banner */}
      <DemoModeBanner onNavigate={navigate} />

      {/* Persistent Navigation */}
      <Navbar
        currentUser={currentUser}
        currentRoute={currentPath}
        unreadNotificationsCount={currentUser ? storage.getNotifications(currentUser.id).filter(n => n.status !== 'read').length : 0}
        onNavigate={navigate}
        onOpenLogin={handleOpenLogin}
        onLogout={handleLogout}
      />

      {/* Main Viewport */}
      <main className="flex-1">
        {renderContent()}
      </main>

      {/* Persistent Mission Footer */}
      <Footer onNavigate={navigate} onOpenLogin={handleOpenLogin} />

      {/* Modals */}
      <LoginModal
        isOpen={loginModalOpen}
        initialIsAdmin={loginModalIsAdmin}
        onClose={() => setLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {currentUser && (
        <OnboardingModal
          user={currentUser}
          onComplete={() => setOnboardingModalOpen(false)}
        />
      )}

      {currentUser && paymentSelectedTrack && (
        <PaymentModal
          isOpen={paymentModalOpen}
          user={currentUser}
          track={paymentSelectedTrack}
          onClose={() => {
            setPaymentModalOpen(false);
            setPaymentSelectedTrack(null);
          }}
          onPaymentSubmitted={() => {
            navigate('/dashboard');
          }}
        />
      )}
    </div>
  );
}
