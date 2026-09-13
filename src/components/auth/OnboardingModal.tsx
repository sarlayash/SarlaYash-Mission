import React, { useState } from 'react';
import { Sparkles, Globe, Clock, UserCheck, Accessibility } from 'lucide-react';
import { User, LearnerProfile } from '../../types';
import { storage } from '../../lib/storage';

interface OnboardingModalProps {
  user: User;
  onComplete: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ user, onComplete }) => {
  const existingProfile = storage.getProfileByUserId(user.id);

  const [country, setCountry] = useState(existingProfile?.country || 'India');
  const [preferredLanguage, setPreferredLanguage] = useState(existingProfile?.preferred_language || 'English');
  const [timezone, setTimezone] = useState(existingProfile?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata');
  const [accessibility, setAccessibility] = useState(existingProfile?.accessibility_preferences || 'Standard high-contrast dark theme');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const profile: LearnerProfile = {
      id: existingProfile?.id || `prof-${user.id}`,
      user_id: user.id,
      country,
      preferred_language: preferredLanguage,
      timezone,
      onboarding_completed: true,
      accessibility_preferences: accessibility,
      created_at: existingProfile?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    storage.saveProfile(profile);
    storage.logAudit(user.id, 'ONBOARDING_COMPLETED', 'LearnerProfile', profile.id, { country, preferredLanguage });
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 sm:p-8 space-y-6">
        
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
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

          <button
            type="submit"
            className="w-full py-3 rounded-xl font-bold text-xs bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors shadow-lg shadow-cyan-500/20"
          >
            Complete Onboarding & Enter Portal
          </button>
        </form>

      </div>
    </div>
  );
};
