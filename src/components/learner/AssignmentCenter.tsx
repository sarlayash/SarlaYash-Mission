import React, { useState } from 'react';
import { 
  FileText, 
  Filter, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  Bot
} from 'lucide-react';
import { User, Assignment, AssignmentSubmission, Track } from '../../types';
import { storage } from '../../lib/storage';
import { StatusBadge } from '../common/StatusBadge';

interface AssignmentCenterProps {
  user: User;
  onNavigate: (route: string) => void;
}

export const AssignmentCenter: React.FC<AssignmentCenterProps> = ({ user, onNavigate }) => {
  const tracks = storage.getTracks();
  const enrollments = storage.getEnrollmentsByUser(user.id);
  const enrolledTrackIds = new Set(enrollments.map(e => e.track_id));

  const [selectedTrack, setSelectedTrack] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const allAssignments = storage.getAssignments();
  const allSubmissions = storage.getSubmissionsByUser(user.id);

  const submissionMap = new Map<string, AssignmentSubmission>();
  allSubmissions.forEach(sub => submissionMap.set(sub.assignment_id, sub));

  const filtered = allAssignments.filter(assignment => {
    // If not all tracks, filter by track
    if (selectedTrack !== 'all' && assignment.track_id !== selectedTrack) {
      return false;
    }
    
    // Check status
    const sub = submissionMap.get(assignment.id);
    const status = sub ? sub.status : 'not_submitted';
    if (selectedStatus !== 'all' && status !== selectedStatus) {
      return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        assignment.title.toLowerCase().includes(q) ||
        assignment.day_number.toString().includes(q) ||
        assignment.instructions.toLowerCase().includes(q)
      );
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <span className="text-xs font-mono font-semibold text-cyan-400 uppercase tracking-wider">
              Academic Submissions
            </span>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-white mt-1">
              Assignment Center
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Manage hands-on deliverables across your 30-day mission, track review feedback, and submit revisions.
            </p>
          </div>

          <button
            onClick={() => onNavigate('/dashboard')}
            className="self-start sm:self-auto px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200"
          >
            Back to Dashboard
          </button>
        </div>

        {/* Filter Bar */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search assignments by topic or day number..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <select
              value={selectedTrack}
              onChange={(e) => setSelectedTrack(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All Tracks</option>
              {tracks.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All Statuses</option>
              <option value="submitted">Submitted</option>
              <option value="reviewed">Reviewed</option>
              <option value="needs_revision">Needs Revision</option>
              <option value="not_submitted">Not Submitted</option>
            </select>
          </div>

          <div className="text-xs text-slate-400 font-mono">
            Showing {filtered.length} of {allAssignments.length} Assignments
          </div>
        </div>

        {/* Assignments List */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
              <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-white">No assignments match your filters</h3>
              <p className="text-xs text-slate-500 mt-1">Try resetting the track or status filter.</p>
            </div>
          ) : (
            filtered.map((assignment) => {
              const sub = submissionMap.get(assignment.id);
              const track = tracks.find(t => t.id === assignment.track_id);
              const isEnrolled = enrolledTrackIds.has(assignment.track_id);

              return (
                <div
                  key={assignment.id}
                  className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="w-6 h-6 rounded-md bg-cyan-500/10 text-cyan-400 font-mono text-xs font-bold flex items-center justify-center">
                        {assignment.day_number}
                      </span>
                      <span className="text-xs font-semibold text-slate-400">
                        {track?.name}
                      </span>
                      <span className="text-slate-600">•</span>
                      <span className="text-xs text-slate-500 font-mono">Day {assignment.day_number}</span>
                      
                      {sub ? (
                        <StatusBadge status={sub.status} />
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-400">
                          Not Submitted
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-semibold text-white hover:text-cyan-400 cursor-pointer transition-colors"
                        onClick={() => onNavigate(`/learn/${track?.slug || 'generative-ai'}/day/${assignment.day_number}`)}>
                      {assignment.title}
                    </h3>

                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {assignment.instructions}
                    </p>

                    {sub && (
                      <div className="pt-2 text-[11px] text-slate-400 flex flex-wrap items-center gap-4">
                        <span>Submitted: {new Date(sub.submitted_at).toLocaleDateString()}</span>
                        <span>Version: v{sub.version_number}</span>
                        {sub.grade_score !== undefined && (
                          <span className="text-cyan-400 font-mono">Grade: {sub.grade_score}/100</span>
                        )}
                        {sub.feedback && (
                          <span className="text-slate-300 italic">"Feedback: {sub.feedback}"</span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    <button
                      onClick={() => onNavigate(`/learn/${track?.slug || 'generative-ai'}/day/${assignment.day_number}`)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center gap-1.5 transition-colors"
                    >
                      {sub ? 'Review / Edit Submission' : 'Start Assignment'}
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
};
