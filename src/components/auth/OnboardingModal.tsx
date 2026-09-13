import React, { useState, useEffect } from 'react';
import { Sparkles, Globe, Clock, UserCheck, Accessibility, X, Check, Loader2 } from 'lucide-react';
import { User, LearnerProfile } from '../../types';
import { storage } from '../../lib/storage';

interface OnboardingModalProps {
  user: User;
  onComplete: () => void;
  onClose?: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ user, onComplete, onClose }) => {
  const existingProfile = storage.getProfileByUserId(user.id);

  const [country, setCountry] = useState(existingProfile?.country || 'India');
  const [preferredLanguage, setPreferredLanguage] = useState(existingProfile?.preferred_language || 'English');
  const [timezone, setTimezone] = useState(
    existingProfile?.timezone || 
    (typeof Intl !== 'undefined' && Intl.DateTimeFormat ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'Asia/Kolkata')
  );
  const [accessibility, setAccessibility] = useState(existingProfile?.accessibility_preferences || 'Standard high-contrast dark theme');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleDismiss(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleDismiss = (skip = false) => {
    setIsSubmitting(true);
    try {
      const profile: LearnerProfile = {
        id: existingProfile?.id || `prof-${user.id}`,
        user_id: user.id,
        country: skip ? (existingProfile?.country || country || 'India') : (country || 'India'),
        preferred_language: preferredLanguage || 'English',
        timezone: timezone || 'Asia/Kolkata',
        onboarding_completed: true,
        accessibility_preferences: accessibility || 'Standard',
        created_at: existingProfile?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      storage.saveProfile(profile);
      storage.logAudit(user.id, 'ONBOARDING_COMPLETED', 'LearnerProfile', profile.id, {
        country: profile.country,
        preferredLanguage: profile.preferred_language,
        skipped: skip
      });
    } catch (err) {
      console.warn('Profile save warning during onboarding:', err);
    } finally {
      setIsSubmitting(false);
      if (onClose) {
        onClose();
      }
      onComplete();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleDismiss(false);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleDismiss(true);
        }
      }}
    >
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 sm:p-8 space-y-6 relative">
        
        {/* Dismiss / Close X button */}
        <button
          type="button"
          onClick={() => handleDismiss(true)}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Dismiss and enter portal"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              First-Time Onboarding
            </span>
          </div>
          <h2 className="text-2xl font-display font-bold text-white">
            Welcome, {user.display_name}!
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Let's configure your 30-day mission preferences. You can update these anytime in your profile settings.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              Country / Region (Consent-Aware)
            </label>
            <input
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="e.g. India, United States, Germany..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">
                Preferred Language
              </label>
              <select
                value={preferredLanguage}
                onChange={(e) => setPreferredLanguage(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="English">English</option>
                <option value="Hindi">Hindi (हिन्दी)</option>
                <option value="Spanish">Spanish (Español)</option>
                <option value="French">French (Français)</option>
                <option value="German">German (Deutsch)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                Timezone
              </label>
              <input
                type="text"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1 flex items-center gap-1.5">
              <Accessibility className="w-3.5 h-3.5 text-cyan-400" />
              Accessibility / Learning Preferences
            </label>
            <input
              type="text"
              value={accessibility}
              onChange={(e) => setAccessibility(e.target.value)}
              placeholder="e.g. High contrast, large text, screen reader support..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
            By proceeding, you acknowledge that progress and assignment evaluations are governed by the SarlaYash Mission guidelines.
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => handleDismiss(true)}
              className="w-full sm:w-auto px-4 py-3 rounded-xl font-medium text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-center order-2 sm:order-1"
            >
              Skip for Now
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:flex-1 py-3 rounded-xl font-bold text-xs bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 order-1 sm:order-2 disabled:opacity-75"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  Saving & Entering Portal...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 text-slate-950" />
                  Complete Onboarding & Enter Portal
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
