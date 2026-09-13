import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Sparkles, 
  Bot, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  Terminal, 
  ShieldCheck, 
  BookOpen, 
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { Track, TrackDay, User } from '../../types';
import { storage } from '../../lib/storage';

interface TrackDetailPageProps {
  trackSlug: 'generative-ai' | 'agentic-ai';
  currentUser: User | null;
  onNavigate: (route: string) => void;
  onEnroll: (trackId: string) => void;
}

export const TrackDetailPage: React.FC<TrackDetailPageProps> = ({
  trackSlug,
  currentUser,
  onNavigate,
  onEnroll
}) => {
  const track = storage.getTrackBySlug(trackSlug);
  const trackDays = track ? storage.getTrackDays(track.id) : [];
  const [selectedDayNum, setSelectedDayNum] = useState<number>(1);

  if (!track) {
    return (
      <div className="min-h-screen bg-slate-950 text-white p-8">
        <p>Track not found.</p>
        <button onClick={() => onNavigate('/tracks')} className="text-cyan-400 mt-4">
          Back to Tracks
        </button>
      </div>
    );
  }

  const activeDay = trackDays.find(d => d.day_number === selectedDayNum) || trackDays[0];
  const isEnrolled = currentUser ? !!storage.getEnrollment(currentUser.id, track.id) : false;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Navigation & Header */}
        <div>
          <button
            onClick={() => onNavigate('/tracks')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-cyan-400 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            All Tracks
          </button>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 relative overflow-hidden">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
              <div className="space-y-3 max-w-3xl">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                    Track Overview · 30 Days
                  </span>
                  <span className="text-xs text-slate-400">
                    SarlaYash Mission · Kapil
                  </span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-display font-bold text-white flex items-center gap-3">
                  {trackSlug === 'generative-ai' ? (
                    <Sparkles className="w-8 h-8 text-cyan-400" />
                  ) : (
                    <Bot className="w-8 h-8 text-blue-400" />
                  )}
                  {track.name}
                </h1>
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                  {track.description}
                </p>

                <div className="flex flex-wrap items-center gap-6 pt-2 text-xs text-slate-400 font-mono">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-cyan-400" />
                    <span>30 Days · ~60 min / day</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>10% Theory / 90% Hands-On</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-cyan-400" />
                    <span>Contribution: ₹1 / session</span>
                  </div>
                </div>
              </div>

              <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col gap-3">
                {isEnrolled ? (
                  <button
                    onClick={() => onNavigate(`/learn/${track.slug}/day/1`)}
                    className="py-3 px-6 rounded-xl font-bold text-sm bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 text-center"
                  >
                    Continue Daily Mission
                  </button>
                ) : (
                  <button
                    onClick={() => onEnroll(track.id)}
                    className="py-3 px-6 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 shadow-lg shadow-cyan-500/20 text-center"
                  >
                    Enroll for ₹1 Contribution
                  </button>
                )}
                <button
                  onClick={() => onNavigate('/dashboard')}
                  className="py-3 px-6 rounded-xl font-medium text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 text-center"
                >
                  View My Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 30-Day Syllabus Explorer */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Day list sidebar */}
          <div className="lg:col-span-4 space-y-2 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 px-2 mb-3">
              30-Day Roadmap (Select to Inspect)
            </h3>
            {trackDays.map((day) => {
              const isSelected = day.day_number === selectedDayNum;
              return (
                <button
                  key={day.id}
                  onClick={() => setSelectedDayNum(day.day_number)}
                  className={`w-full text-left p-3 rounded-xl text-xs transition-all flex items-center justify-between border ${
                    isSelected 
                      ? 'bg-slate-800 border-cyan-500/60 text-white shadow-md' 
                      : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className={`w-6 h-6 rounded-md flex items-center justify-center font-mono text-[11px] font-bold ${
                      isSelected ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                    }`}>
                      {day.day_number}
                    </span>
                    <span className="font-medium truncate">{day.title}</span>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 shrink-0 ml-2 ${isSelected ? 'text-cyan-400' : 'text-slate-600'}`} />
                </button>
              );
            })}
          </div>

          {/* Day Detail Inspector */}
          {activeDay && (
            <div className="lg:col-span-8 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <span className="text-xs font-mono font-semibold text-cyan-400 uppercase tracking-wider">
                    Day {activeDay.day_number} of 30
                  </span>
                  <h2 className="text-2xl font-display font-bold text-white mt-1">
                    {activeDay.title}
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md text-xs font-mono bg-slate-800 text-slate-300 border border-slate-700">
                    Est. {activeDay.estimated_minutes} mins
                  </span>
                </div>
              </div>

              {/* Learning Objective */}
              <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-800/30">
                <h4 className="text-xs font-mono text-cyan-400 font-semibold uppercase mb-1">
                  Practical Learning Objective
                </h4>
                <p className="text-xs sm:text-sm text-cyan-100/90 leading-relaxed">
                  {activeDay.hands_on_objective}
                </p>
              </div>

              {/* 10% Theory Briefing */}
              <div className="space-y-2">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                  10% Foundational Theory Briefing
                </h4>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line font-sans">
                  {activeDay.theory_content}
                </div>
              </div>

              {/* 90% Hands-On Practical Mission */}
              <div className="space-y-2">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
                  90% Hands-On Practical Mission
                </h4>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line font-sans">
                  {activeDay.hands_on_activity}
                </div>
              </div>

              {/* Suggested Tools & Completion Criteria */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="text-[11px] font-mono text-slate-400 uppercase font-semibold block">
                    Suggested Tools
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {activeDay.suggested_tools.map((t, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[11px] font-mono text-slate-400 uppercase font-semibold block">
                    Completion Criteria
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {activeDay.completion_criteria}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Ready to practice this mission?
                </span>
                {currentUser ? (
                  <button
                    onClick={() => onNavigate(`/learn/${track.slug}/day/${activeDay.day_number}`)}
                    className="py-2.5 px-5 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors"
                  >
                    Open Day {activeDay.day_number} Workspace
                  </button>
                ) : (
                  <button
                    onClick={() => onEnroll(track.id)}
                    className="py-2.5 px-5 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors"
                  >
                    Enroll to Access
                  </button>
                )}
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
