import React, { useState } from 'react';
import { 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Lock, 
  ArrowRight, 
  Sparkles, 
  Bot, 
  Flame, 
  FileCheck,
  ChevronRight
} from 'lucide-react';
import { User, Track } from '../../types';
import { storage } from '../../lib/storage';
import { StatusBadge } from '../common/StatusBadge';

interface ProgressTimelineProps {
  user: User;
  onNavigate: (route: string) => void;
}

export const ProgressTimeline: React.FC<ProgressTimelineProps> = ({ user, onNavigate }) => {
  const tracks = storage.getTracks();
  const [selectedTrackId, setSelectedTrackId] = useState<string>(tracks[0]?.id || 'track-genai');

  const selectedTrack = tracks.find(t => t.id === selectedTrackId) || tracks[0];
  const trackDays = storage.getTrackDays(selectedTrack.id);
  const enrollment = storage.getEnrollment(user.id, selectedTrack.id);
  const progressRecords = storage.getProgressByUser(user.id, enrollment?.id);
  const submissions = storage.getSubmissionsByUser(user.id);
  const assignments = storage.getAssignments(selectedTrack.id);

  const stats = storage.calculateLearnerProgress(user.id, selectedTrack.id);

  // Map progress by day
  const progressMap = new Map(progressRecords.map(p => [p.day_number, p]));
  const assignmentMap = new Map(assignments.map(a => [a.day_number, a]));
  const submissionMap = new Map(submissions.map(s => [s.assignment_id, s]));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <span className="text-xs font-mono font-semibold text-cyan-400 uppercase tracking-wider">
              Real Activity Timeline
            </span>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-white mt-1">
              30-Day Mission Progression
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Calculated strictly from verified submissions and completion records in the database.
            </p>
          </div>

          {/* Track selector */}
          <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
            {tracks.map(t => (
              <button
                key={t.id}
                onClick={() => setSelectedTrackId(t.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  selectedTrackId === t.id 
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t.slug === 'generative-ai' ? <Sparkles className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                {t.name.split(' ')[0]} {t.name.split(' ')[1]}
              </button>
            ))}
          </div>
        </div>

        {/* Overview Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-center">
            <span className="text-[10px] font-mono uppercase text-slate-500 block">Verified Progress</span>
            <p className="text-2xl font-bold font-mono text-cyan-400 mt-1">{stats.percentage}%</p>
            <span className="text-xs text-slate-400 mt-0.5 block">{stats.completedDays} / 30 Days</span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-center">
            <span className="text-[10px] font-mono uppercase text-slate-500 block">Current Streak</span>
            <p className="text-2xl font-bold font-mono text-amber-400 mt-1 flex items-center justify-center gap-1">
              <Flame className="w-5 h-5" />
              {stats.streakDays}d
            </p>
            <span className="text-xs text-slate-400 mt-0.5 block">Consecutive Active</span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-center">
            <span className="text-[10px] font-mono uppercase text-slate-500 block">Submissions</span>
            <p className="text-2xl font-bold font-mono text-white mt-1">{stats.submittedAssignments}</p>
            <span className="text-xs text-slate-400 mt-0.5 block">{stats.pendingAssignments} Pending</span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-center">
            <span className="text-[10px] font-mono uppercase text-slate-500 block">Active Day</span>
            <p className="text-2xl font-bold font-mono text-emerald-400 mt-1">Day {stats.currentDay}</p>
            <span className="text-xs text-slate-400 mt-0.5 block">Next Milestones</span>
          </div>
        </div>

        {/* 30 Days Grid */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
          <h3 className="font-display font-bold text-base text-white mb-6 flex items-center justify-between">
            <span>30-Day Step-by-Step Trajectory</span>
            <span className="text-xs font-mono text-slate-400">10% Theory / 90% Hands-On</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trackDays.map(day => {
              const prog = progressMap.get(day.day_number);
              const assign = assignmentMap.get(day.day_number);
              const sub = assign ? submissionMap.get(assign.id) : undefined;
              const isCompleted = prog?.status === 'completed';
              const isSubmitted = prog?.status === 'submitted' || sub?.status === 'submitted';
              const isStarted = prog?.status === 'started';

              return (
                <div
                  key={day.id}
                  onClick={() => onNavigate(`/learn/${selectedTrack.slug}/day/${day.day_number}`)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isCompleted
                      ? 'bg-emerald-950/20 border-emerald-500/40 hover:border-emerald-400'
                      : isSubmitted
                      ? 'bg-amber-950/20 border-amber-500/40 hover:border-amber-400'
                      : isStarted
                      ? 'bg-cyan-950/20 border-cyan-500/40 hover:border-cyan-400'
                      : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="w-7 h-7 rounded-lg bg-slate-800 font-mono text-xs font-bold text-white flex items-center justify-center">
                        {day.day_number}
                      </span>
                      {isCompleted ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Completed
                        </span>
                      ) : isSubmitted ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400">
                          <Clock className="w-3.5 h-3.5" />
                          Submitted
                        </span>
                      ) : isStarted ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-400">
                          Started
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-500">Unstarted</span>
                      )}
                    </div>

                    <h4 className="font-semibold text-xs sm:text-sm text-white line-clamp-2">
                      {day.title}
                    </h4>

                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      {day.hands_on_objective}
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Est. {day.estimated_minutes} min</span>
                    <span className="text-cyan-400 flex items-center gap-1">
                      Open <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
