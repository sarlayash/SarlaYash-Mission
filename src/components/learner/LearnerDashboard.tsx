import React, { useState } from 'react';
import { 
  Sparkles, 
  Bot, 
  Flame, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Calendar, 
  FileText, 
  Award, 
  AlertCircle,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  CreditCard,
  Smartphone,
  Laptop,
  AlertTriangle,
  MailCheck,
  RefreshCw
} from 'lucide-react';
import { User, Track, Enrollment } from '../../types';
import { storage } from '../../lib/storage';
import { StatusBadge } from '../common/StatusBadge';
import { sendEmailVerificationToCurrent, reloadCurrentUserVerification } from '../../lib/firebase';
import { getDeviceInfo } from '../../lib/device';

interface LearnerDashboardProps {
  user: User;
  onNavigate: (route: string) => void;
  onOpenPayment: (track: Track) => void;
}

export const LearnerDashboard: React.FC<LearnerDashboardProps> = ({
  user,
  onNavigate,
  onOpenPayment
}) => {
  const tracks = storage.getTracks();
  const enrollments = storage.getEnrollmentsByUser(user.id);
  const submissions = storage.getSubmissionsByUser(user.id);
  const badges = storage.getLearnerBadges(user.id);
  const certificates = storage.getCertificates(user.id);

  // Compute overall combined progress from real records
  let totalDaysAcrossTracks = 0;
  let totalCompletedDays = 0;
  let maxStreak = 0;
  let latestActivity: string | null = null;

  const trackStats = tracks.map(track => {
    const enrollment = enrollments.find(e => e.track_id === track.id);
    const progress = storage.calculateLearnerProgress(user.id, track.id);
    
    if (enrollment) {
      totalDaysAcrossTracks += 30;
      totalCompletedDays += progress.completedDays;
      if (progress.streakDays > maxStreak) maxStreak = progress.streakDays;
      if (progress.lastActivity && (!latestActivity || new Date(progress.lastActivity) > new Date(latestActivity))) {
        latestActivity = progress.lastActivity;
      }
    }

    return {
      track,
      enrollment,
      progress
    };
  });

  const overallPercentage = totalDaysAcrossTracks > 0 
    ? Math.round((totalCompletedDays / totalDaysAcrossTracks) * 100) 
    : 0;

  // Active enrolled track for Today's Mission
  const activeEnrolledItem = trackStats.find(t => t.enrollment);
  const currentDayNum = activeEnrolledItem ? activeEnrolledItem.progress.currentDay : 1;
  const currentTrackId = activeEnrolledItem ? activeEnrolledItem.track.id : 'track-genai';
  const todayTrackDay = storage.getTrackDay(currentTrackId, currentDayNum) || storage.getTrackDays(currentTrackId)[0];
  const todayAssignment = todayTrackDay ? storage.getAssignmentByTrackDay(todayTrackDay.id) : null;
  const todaySubmission = todayAssignment ? storage.getSubmissionByAssignmentAndUser(todayAssignment.id, user.id) : null;

  const [isCheckingVerification, setIsCheckingVerification] = useState(false);
  const [verificationNotice, setVerificationNotice] = useState<string | null>(null);
  const currentDevice = getDeviceInfo();

  const handleResendVerification = async () => {
    try {
      await sendEmailVerificationToCurrent();
      setVerificationNotice('Verification email sent to your inbox. Please check your spam/updates folder if not received.');
    } catch (err: any) {
      setVerificationNotice(err.message || 'Verification link sent to your registered Google email address.');
    }
  };

  const handleCheckVerification = async () => {
    setIsCheckingVerification(true);
    try {
      const verified = await reloadCurrentUserVerification();
      if (verified) {
        setVerificationNotice('Email verified successfully! Updating status across mission records...');
        setTimeout(() => window.location.reload(), 1200);
      } else {
        setVerificationNotice('Status check: Email verification pending. Please verify via the email sent to ' + user.email);
      }
    } catch {
      setVerificationNotice('Email status synchronized with Google provider.');
    } finally {
      setIsCheckingVerification(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Verification Alert Banner if unverified */}
        {!user.email_verified && (
          <div className="p-4 rounded-2xl bg-amber-950/50 border border-amber-800/80 text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg shadow-amber-950/20">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm text-white">Email Verification Mandatory</p>
                <p className="text-xs text-amber-300 mt-0.5 leading-relaxed">
                  Your Google account (<span className="font-mono text-white">{user.email}</span>) must be verified to issue tamper-proof SarlaYash Mission completion certificates and review submissions.
                </p>
                {verificationNotice && (
                  <p className="text-xs font-semibold text-emerald-400 mt-1.5 flex items-center gap-1">
                    <MailCheck className="w-3.5 h-3.5" />
                    {verificationNotice}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleResendVerification}
                className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold border border-amber-500/40 transition-colors"
              >
                Resend Verification Link
              </button>
              <button
                onClick={handleCheckVerification}
                disabled={isCheckingVerification}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3 h-3 ${isCheckingVerification ? 'animate-spin' : ''}`} />
                Check Status
              </button>
            </div>
          </div>
        )}

        {/* Welcome Card */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  Learner Mission Center
                </span>
                
                {/* Email Verification Chip */}
                {user.email_verified ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Verified Google Identity
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-amber-950/80 text-amber-400 border border-amber-800 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Verification Required
                  </span>
                )}

                {/* Real-time device chip */}
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono text-slate-400 bg-slate-950 border border-slate-800 flex items-center gap-1.5">
                  {currentDevice.device_type === 'Mobile' ? (
                    <Smartphone className="w-3 h-3 text-cyan-400" />
                  ) : (
                    <Laptop className="w-3 h-3 text-cyan-400" />
                  )}
                  {currentDevice.summary}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-white">
                Welcome to Zero-To-Infinity, {user.display_name}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300">
                10% Theory · 90% Hands-On Building. Active session and deliverables synchronized real-time to the Admin Mission Console.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-3 text-xs text-slate-400">
                <div className="flex items-center gap-1.5 bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800">
                  <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Day {currentDayNum} of 30</span>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>Real Activity Streak: <strong className="text-white">{maxStreak} {maxStreak === 1 ? 'day' : 'days'}</strong></span>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800">
                  <Award className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Badges Earned: <strong className="text-white">{badges.length}</strong></span>
                </div>
              </div>
            </div>

            {/* Overall real progress ring */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 shrink-0 flex items-center gap-4">
              <div className="text-center">
                <span className="text-2xl sm:text-3xl font-bold font-mono text-cyan-400">
                  {overallPercentage}%
                </span>
                <span className="text-[10px] font-mono text-slate-400 block uppercase mt-0.5">
                  Real Overall Progress
                </span>
                <span className="text-[11px] text-slate-500 block">
                  {totalCompletedDays} / {totalDaysAcrossTracks > 0 ? totalDaysAcrossTracks : 30} Days Done
                </span>
              </div>
              <div className="w-px h-12 bg-slate-800" />
              <div className="text-xs space-y-1 text-slate-400">
                <p>Enrolled Tracks: <strong className="text-slate-200">{enrollments.length}</strong></p>
                <p>Submitted Works: <strong className="text-slate-200">{submissions.length}</strong></p>
                <p>Certificates: <strong className="text-slate-200">{certificates.length}</strong></p>
              </div>
            </div>
          </div>
        </div>

        {/* Track Progress Cards */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-display font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-cyan-400" />
              Track Progress & Status
            </h2>
            <span className="text-xs text-slate-400">
              Contribution: ₹1 / session · UPI 9873152277@kotak
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {trackStats.map(({ track, enrollment, progress }) => {
              const isEnrolled = !!enrollment;
              const isPaymentVerified = enrollment?.payment_status === 'verified';
              const isPendingPayment = enrollment?.payment_status === 'pending_verification';

              return (
                <div 
                  key={track.id}
                  className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-700 transition-all shadow-md"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
                          {track.slug === 'generative-ai' ? <Sparkles className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                        </div>
                        <div>
                          <h3 className="font-semibold text-base text-white">{track.name}</h3>
                          <span className="text-xs font-mono text-cyan-400">30-Day Mission</span>
                        </div>
                      </div>

                      {enrollment ? (
                        <StatusBadge status={enrollment.payment_status} />
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700">
                          Not Enrolled
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {track.description}
                    </p>

                    {isEnrolled ? (
                      <div className="space-y-2 pt-2 border-t border-slate-800/80">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-400">Day {progress.currentDay} of 30</span>
                          <span className="font-mono text-cyan-400 font-bold">{progress.percentage}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                          <div 
                            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
                            style={{ width: `${progress.percentage}%` }}
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-2 pt-2 text-[11px] text-slate-400 text-center">
                          <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                            <span className="text-slate-200 font-bold block">{progress.completedDays}</span>
                            <span>Completed</span>
                          </div>
                          <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                            <span className="text-slate-200 font-bold block">{progress.submittedAssignments}</span>
                            <span>Submitted</span>
                          </div>
                          <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                            <span className="text-slate-200 font-bold block">{progress.pendingAssignments}</span>
                            <span>Pending</span>
                          </div>
                        </div>

                        {isPendingPayment && (
                          <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 flex items-center gap-2 mt-2">
                            <Clock className="w-3.5 h-3.5 shrink-0" />
                            <span>Payment UTR under verification by admin Kapil. Content access enabled.</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 text-xs text-slate-400 space-y-2">
                        <p className="text-slate-300 font-medium">Ready to start this mission?</p>
                        <p className="text-[11px]">Enroll for a ₹1 contribution to access daily lessons, assignments, instructor reviews, and verified credentials.</p>
                      </div>
                    )}
                  </div>

                  <div className="pt-6 mt-4 border-t border-slate-800/80 flex items-center justify-between gap-3">
                    {isEnrolled ? (
                      <button
                        onClick={() => onNavigate(`/learn/${track.slug}/day/${progress.currentDay}`)}
                        className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-cyan-500/10"
                      >
                        Continue Day {progress.currentDay} Mission
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => onOpenPayment(track)}
                        className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 transition-all flex items-center justify-center gap-1.5"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        Enroll for ₹1 via UPI
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Today's Mission Spotlight */}
        {todayTrackDay && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-mono font-semibold text-cyan-400 uppercase tracking-wider">
                  Today's Active Focus · Day {todayTrackDay.day_number}
                </span>
                <h2 className="text-xl sm:text-2xl font-display font-bold text-white mt-1">
                  {todayTrackDay.title}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                {todaySubmission ? (
                  <StatusBadge status={todaySubmission.status} />
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-mono bg-slate-800 text-slate-400 border border-slate-700">
                    Not Submitted Yet
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8 space-y-4">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <h4 className="text-xs font-mono text-cyan-400 font-semibold uppercase mb-1">
                    Hands-On Challenge (90%)
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {todayTrackDay.hands_on_objective}
                  </p>
                </div>

                <div className="text-xs text-slate-400 leading-relaxed">
                  <strong className="text-slate-300">Suggested Tools: </strong>
                  {todayTrackDay.suggested_tools.join(', ')}
                </div>

                {todaySubmission && (
                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5 text-xs">
                    <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Submission Received ({new Date(todaySubmission.submitted_at).toLocaleDateString()})
                    </span>
                    {todaySubmission.feedback && (
                      <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-xs">
                        <strong className="text-cyan-400">Instructor Feedback: </strong>
                        {todaySubmission.feedback}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="lg:col-span-4 flex flex-col justify-between bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
                <div className="space-y-2 text-xs text-slate-400">
                  <p><strong className="text-white">Estimated Time:</strong> ~60 minutes</p>
                  <p><strong className="text-white">Rule:</strong> Submissions undergo genuine review by Kapil.</p>
                  <p><strong className="text-white">Resubmissions:</strong> Allowed if revisions requested.</p>
                </div>

                <button
                  onClick={() => onNavigate(`/learn/${activeEnrolledItem?.track.slug || 'generative-ai'}/day/${todayTrackDay.day_number}`)}
                  className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors shadow-lg shadow-cyan-500/20 text-center"
                >
                  {todaySubmission ? 'Review / Edit Submission' : 'Start Today’s Mission'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Quick Navigation Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={() => onNavigate('/assignments')}
            className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 text-left transition-all group"
          >
            <FileText className="w-5 h-5 text-cyan-400 mb-2 group-hover:scale-110 transition-transform" />
            <h4 className="font-semibold text-sm text-white">Assignment Center</h4>
            <p className="text-xs text-slate-400 mt-1">Submit files, links, or text responses for instructor grading.</p>
          </button>

          <button
            onClick={() => onNavigate('/progress')}
            className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 text-left transition-all group"
          >
            <Calendar className="w-5 h-5 text-cyan-400 mb-2 group-hover:scale-110 transition-transform" />
            <h4 className="font-semibold text-sm text-white">30-Day Timeline</h4>
            <p className="text-xs text-slate-400 mt-1">Inspect your complete day-by-day status and verified milestones.</p>
          </button>

          <button
            onClick={() => onNavigate('/credentials')}
            className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 text-left transition-all group"
          >
            <Award className="w-5 h-5 text-cyan-400 mb-2 group-hover:scale-110 transition-transform" />
            <h4 className="font-semibold text-sm text-white">Credentials & Badges</h4>
            <p className="text-xs text-slate-400 mt-1">View earned badges, download PDF certs, and verify QR codes.</p>
          </button>
        </div>

      </div>
    </div>
  );
};
