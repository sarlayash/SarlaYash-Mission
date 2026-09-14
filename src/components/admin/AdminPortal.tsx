import React, { useState, useEffect, useMemo } from 'react';
import { 
  Shield, 
  ShieldCheck,
  Users, 
  CreditCard, 
  FileCheck, 
  BookOpen, 
  Award, 
  Bell, 
  History, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  AlertTriangle,
  Search, 
  Download, 
  Plus, 
  Edit3, 
  Trash2, 
  Save, 
  ExternalLink,
  Lock,
  RefreshCw,
  Clock,
  Smartphone,
  Laptop,
  Globe,
  Radio,
  Wifi,
  Sparkles,
  CheckCheck,
  Mail
} from 'lucide-react';
import { User, Track, TrackDay, AssignmentSubmission, Payment, Certificate, LearnerBadge } from '../../types';
import { storage } from '../../lib/storage';
import { auth } from '../../lib/auth';
import { StatusBadge } from '../common/StatusBadge';
import { subscribeToLearnersRealtime, FIREBASE_METADATA } from '../../lib/firebase';
import { AdminCommunications } from './AdminCommunications';

interface AdminPortalProps {
  currentUser: User;
  onNavigate: (route: string) => void;
}

type AdminTab = 
  | 'overview' 
  | 'payments' 
  | 'assignments' 
  | 'learners' 
  | 'communications'
  | 'curriculum' 
  | 'credentials' 
  | 'announcements' 
  | 'audit';

export const AdminPortal: React.FC<AdminPortalProps> = ({ currentUser, onNavigate }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const metrics = storage.getAdminMetrics();
  const tracks = storage.getTracks();

  // State for data refresh
  const [refreshKey, setRefreshKey] = useState(0);
  const triggerRefresh = () => setRefreshKey(prev => prev + 1);

  // ----------------------------------------------------
  // Payments Tab State
  // ----------------------------------------------------
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'pending_verification' | 'verified' | 'rejected'>('pending_verification');
  const [rejectReasonModal, setRejectReasonModal] = useState<{ isOpen: boolean; paymentId: string; reason: string }>({
    isOpen: false,
    paymentId: '',
    reason: ''
  });

  // ----------------------------------------------------
  // Assignment Review Desk State
  // ----------------------------------------------------
  const [submissionFilter, setSubmissionFilter] = useState<'all' | 'submitted' | 'reviewed' | 'needs_revision'>('submitted');
  const [submissionLearnerFilter, setSubmissionLearnerFilter] = useState<string>('');
  const [activeReviewSub, setActiveReviewSub] = useState<AssignmentSubmission | null>(null);
  const [reviewGrade, setReviewGrade] = useState<number>(90);
  const [reviewFeedback, setReviewFeedback] = useState<string>('');
  const [reviewStatus, setReviewStatus] = useState<'reviewed' | 'needs_revision'>('reviewed');

  // ----------------------------------------------------
  // Curriculum Editor State
  // ----------------------------------------------------
  const [selectedCurriculumTrack, setSelectedCurriculumTrack] = useState<string>(tracks[0]?.id || 'track-genai');
  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(1);
  const [curriculumSavedNotice, setCurriculumSavedNotice] = useState(false);

  // ----------------------------------------------------
  // Broadcast State
  // ----------------------------------------------------
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastBody, setBroadcastBody] = useState('');
  const [broadcastTarget, setBroadcastTarget] = useState<'all' | 'generative-ai' | 'agentic-ai'>('all');
  const [broadcastSentNotice, setBroadcastSentNotice] = useState(false);

  // ----------------------------------------------------
  // Communications State (Email & Text Hub)
  // ----------------------------------------------------
  const [commPreselectedLearnerId, setCommPreselectedLearnerId] = useState<string | undefined>(undefined);
  const [commPreselectedLearnerIds, setCommPreselectedLearnerIds] = useState<string[]>([]);
  const [selectedLearnerCheckboxIds, setSelectedLearnerCheckboxIds] = useState<string[]>([]);

  // ----------------------------------------------------
  // Manual Certificate Generator State
  // ----------------------------------------------------
  const [certLearnerId, setCertLearnerId] = useState('');
  const [certTrackId, setCertTrackId] = useState(tracks[0]?.id || 'track-genai');
  const [certSuccessNotice, setCertSuccessNotice] = useState('');
  const [certErrorNotice, setCertErrorNotice] = useState('');

  // ----------------------------------------------------
  // Review-Gated Badge Issuer State
  // ----------------------------------------------------
  const [awardBadgeLearnerId, setAwardBadgeLearnerId] = useState('');
  const [awardBadgeId, setAwardBadgeId] = useState('');
  const [awardBadgeSubmissionId, setAwardBadgeSubmissionId] = useState('');
  const [badgeSuccessNotice, setBadgeSuccessNotice] = useState('');
  const [badgeErrorNotice, setBadgeErrorNotice] = useState('');

  // Inline grading desk badge selection
  const [inlineBadgeId, setInlineBadgeId] = useState('');
  const [inlineBadgeNotice, setInlineBadgeNotice] = useState<{ success: boolean; msg: string } | null>(null);

  // ----------------------------------------------------
  // Admin Password Management State
  // ----------------------------------------------------
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordNotice, setPasswordNotice] = useState<{ success: boolean; msg: string } | null>(null);

  // ----------------------------------------------------
  // Firebase Real-Time Telemetry & Learner Sync State
  // ----------------------------------------------------
  const [realtimeLearners, setRealtimeLearners] = useState<User[]>([]);
  const [isFirebaseLive, setIsFirebaseLive] = useState(true);
  const [lastLiveSync, setLastLiveSync] = useState<Date>(new Date());
  const [liveToast, setLiveToast] = useState<string | null>(null);
  const [learnerFilter, setLearnerFilter] = useState<'all' | 'verified' | 'mobile' | 'desktop'>('all');
  const [learnerSearchQuery, setLearnerSearchQuery] = useState('');

  // Subscribe to real-time updates from Firebase Firestore
  useEffect(() => {
    let initialLoadDone = false;
    const unsubscribe = subscribeToLearnersRealtime(
      (learners) => {
        setRealtimeLearners(learners);
        setLastLiveSync(new Date());
        setIsFirebaseLive(true);
        
        // Notify admin when new learner joins or logs in after initial mount
        if (initialLoadDone && learners.length > 0) {
          const latest = learners[0];
          setLiveToast(`⚡ Real-Time: ${latest.display_name} active on ${latest.last_device || 'Device'}`);
          setTimeout(() => setLiveToast(null), 5000);
        }
        initialLoadDone = true;

        // Cache learners locally
        learners.forEach(u => storage.saveUser(u));
      },
      (error) => {
        console.warn('Real-time sync alert:', error);
        setIsFirebaseLive(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Merge Firestore real-time learners with cached storage users
  const allUsers = useMemo(() => {
    const localUsers = storage.getUsers();
    if (realtimeLearners.length === 0) return localUsers;

    const userMap = new Map<string, User>();
    localUsers.forEach(u => userMap.set(u.id, u));
    realtimeLearners.forEach(u => userMap.set(u.id, { ...userMap.get(u.id), ...u }));

    return Array.from(userMap.values()).sort((a, b) => {
      const tA = new Date(a.last_login_at || a.created_at || 0).getTime();
      const tB = new Date(b.last_login_at || b.created_at || 0).getTime();
      return tB - tA;
    });
  }, [realtimeLearners, refreshKey]);

  const allPayments = storage.getPayments();
  const allSubmissions = storage.getSubmissions();
  const allCertificates = storage.getCertificates();
  const allBadges = storage.getBadges();
  const allLearnerBadges = storage.getLearnerBadges();
  const allAuditLogs = storage.getAuditLogs();

  // Curated lists
  const filteredPayments = allPayments.filter(p => {
    if (paymentFilter === 'all') return true;
    return p.verification_status === paymentFilter;
  });

  const filteredSubmissions = allSubmissions.filter(s => {
    if (submissionLearnerFilter && s.user_id !== submissionLearnerFilter) return false;
    if (submissionFilter === 'all') return true;
    return s.status === submissionFilter;
  });

  // Current track day for editor
  const trackDays = storage.getTrackDays(selectedCurriculumTrack);
  const activeTrackDay = trackDays.find(d => d.day_number === selectedDayNumber) || trackDays[0];

  const [editDayTitle, setEditDayTitle] = useState(activeTrackDay?.title || '');
  const [editDayTheory, setEditDayTheory] = useState(activeTrackDay?.theory_content || '');
  const [editDayActivity, setEditDayActivity] = useState(activeTrackDay?.hands_on_activity || '');
  const [editDayObjective, setEditDayObjective] = useState(activeTrackDay?.hands_on_objective || '');
  const [editDayTools, setEditDayTools] = useState(activeTrackDay?.suggested_tools.join(', ') || '');
  const [editDayMinutes, setEditDayMinutes] = useState(activeTrackDay?.estimated_minutes || 60);

  // Sync state when day selection changes
  const handleSelectDay = (dayNum: number) => {
    setSelectedDayNumber(dayNum);
    const day = trackDays.find(d => d.day_number === dayNum);
    if (day) {
      setEditDayTitle(day.title);
      setEditDayTheory(day.theory_content);
      setEditDayActivity(day.hands_on_activity);
      setEditDayObjective(day.hands_on_objective);
      setEditDayTools(day.suggested_tools.join(', '));
      setEditDayMinutes(day.estimated_minutes);
    }
  };

  // Payment Verification Handler
  const handleVerifyPayment = (paymentId: string) => {
    storage.verifyPayment(paymentId, currentUser.id);
    triggerRefresh();
  };

  const handleRejectPayment = () => {
    if (!rejectReasonModal.reason.trim()) return;
    storage.rejectPayment(rejectReasonModal.paymentId, currentUser.id, rejectReasonModal.reason.trim());
    setRejectReasonModal({ isOpen: false, paymentId: '', reason: '' });
    triggerRefresh();
  };

  // Submission Review Handler
  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReviewSub) return;

    storage.reviewSubmission(
      activeReviewSub.id,
      currentUser.id,
      reviewStatus,
      reviewFeedback,
      reviewGrade
    );

    // If review approved and inline badge selected, assign badge after review
    if (reviewStatus === 'reviewed' && inlineBadgeId) {
      storage.assignBadgeAfterReview(
        activeReviewSub.user_id,
        inlineBadgeId,
        activeReviewSub.id,
        currentUser.id
      );
      setInlineBadgeId('');
    }

    setActiveReviewSub(null);
    setReviewFeedback('');
    triggerRefresh();
  };

  // Quick Award Badge directly from Grading Desk
  const handleQuickAwardBadge = (badgeId: string) => {
    if (!activeReviewSub) return;
    const res = storage.assignBadgeAfterReview(
      activeReviewSub.user_id,
      badgeId,
      activeReviewSub.id,
      currentUser.id
    );
    setInlineBadgeNotice({ success: res.success, msg: res.message });
    setTimeout(() => setInlineBadgeNotice(null), 4000);
    triggerRefresh();
  };

  // Save Track Day Edits
  const handleSaveCurriculumDay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTrackDay) return;

    const updatedDay: TrackDay = {
      ...activeTrackDay,
      title: editDayTitle,
      theory_content: editDayTheory,
      hands_on_activity: editDayActivity,
      hands_on_objective: editDayObjective,
      suggested_tools: editDayTools.split(',').map(s => s.trim()).filter(Boolean),
      estimated_minutes: Number(editDayMinutes),
      updated_at: new Date().toISOString()
    };

    storage.saveTrackDay(updatedDay);
    storage.logAudit(currentUser.id, 'CURRICULUM_UPDATED', 'TrackDay', updatedDay.id, {
      track: selectedCurriculumTrack,
      day: updatedDay.day_number
    });

    setCurriculumSavedNotice(true);
    setTimeout(() => setCurriculumSavedNotice(false), 2500);
    triggerRefresh();
  };

  // Broadcast Handler
  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastBody.trim()) return;

    allUsers.forEach(u => {
      storage.saveNotification({
        id: `notif-bc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        user_id: u.id,
        title: broadcastTitle.trim(),
        body: broadcastBody.trim(),
        type: 'announcement',
        delivery_channel: 'in_app',
        status: 'delivered',
        sent_at: new Date().toISOString(),
        created_by: currentUser.id,
        created_at: new Date().toISOString()
      });
    });

    storage.logAudit(currentUser.id, 'BROADCAST_SENT', 'Notification', 'all_users', {
      title: broadcastTitle,
      target: broadcastTarget
    });

    setBroadcastTitle('');
    setBroadcastBody('');
    setBroadcastSentNotice(true);
    setTimeout(() => setBroadcastSentNotice(false), 3000);
  };

  // Manual Certificate Generation (Strict Review-Gated Policy)
  const handleIssueCertificate = (e: React.FormEvent) => {
    e.preventDefault();
    const recipient = allUsers.find(u => u.id === certLearnerId);
    const trackObj = tracks.find(t => t.id === certTrackId);
    if (!recipient || !trackObj) return;

    // Strict Review-Gated Rule: "ADMIN CAN ASSIGN BADGES AND CERTIFICATES ONLY AFTER REVIEW"
    if (!storage.canAssignCredentials(recipient.id)) {
      setCertErrorNotice(`Policy Constraint: According to SarlaYash Mission operational rules, certificates can ONLY be assigned after at least one assignment has been reviewed and approved by Kapil. ${recipient.display_name} has 0 reviewed submissions.`);
      setTimeout(() => setCertErrorNotice(''), 6000);
      return;
    }

    const certNumber = `ZTI-${trackObj.slug === 'generative-ai' ? 'GENAI' : 'AGENT'}-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const cert: Certificate = {
      id: `cert-${Date.now()}`,
      user_id: recipient.id,
      track_id: trackObj.id,
      certificate_number: certNumber,
      certificate_type: 'track_completion',
      recipient_name_snapshot: recipient.display_name,
      track_name_snapshot: trackObj.name,
      issued_by: 'Kapil · SarlaYash Mission',
      issue_date: new Date().toISOString(),
      completion_date: new Date().toISOString(),
      verification_token: `token-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      status: 'issued',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    storage.saveCertificate(cert);
    storage.logAudit(currentUser.id, 'CERTIFICATE_ISSUED', 'Certificate', cert.id, {
      recipient: recipient.display_name,
      certificate_number: certNumber
    });

    setCertSuccessNotice(`Issued Certificate ${certNumber} to ${recipient.display_name}`);
    setCertErrorNotice('');
    setTimeout(() => setCertSuccessNotice(''), 4000);
    triggerRefresh();
  };

  // Review-Gated Competency Badge Issuance
  const handleAssignBadgeAfterReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!awardBadgeLearnerId || !awardBadgeId || !awardBadgeSubmissionId) {
      setBadgeErrorNotice('Please select learner, reviewed deliverable, and badge.');
      setTimeout(() => setBadgeErrorNotice(''), 5000);
      return;
    }

    const res = storage.assignBadgeAfterReview(
      awardBadgeLearnerId,
      awardBadgeId,
      awardBadgeSubmissionId,
      currentUser.id
    );

    if (res.success) {
      setBadgeSuccessNotice(res.message);
      setBadgeErrorNotice('');
      setAwardBadgeId('');
      setAwardBadgeSubmissionId('');
      setTimeout(() => setBadgeSuccessNotice(''), 4500);
      triggerRefresh();
    } else {
      setBadgeErrorNotice(res.message);
      setTimeout(() => setBadgeErrorNotice(''), 5000);
    }
  };

  // Admin Password Change
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    const res = auth.changeAdminPassword(oldPassword, newPassword);
    setPasswordNotice({ success: res.success, msg: res.message });
    if (res.success) {
      setOldPassword('');
      setNewPassword('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Admin Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                Master Administration Console
              </span>
              <span className="text-xs text-slate-400">
                Authorized: {currentUser.display_name} ({currentUser.username})
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-white">
              SarlaYash Mission Operations Portal
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('/dashboard')}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200"
            >
              Learner Dashboard
            </button>
            <button
              onClick={() => {
                auth.logout();
                onNavigate('/');
              }}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-950/40 border border-rose-800/60 hover:bg-rose-900/40 text-rose-300"
            >
              Log Out
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 overflow-x-auto space-x-1 no-scrollbar pb-1">
          {[
            { id: 'overview', label: 'Executive Overview', icon: Shield },
            { id: 'payments', label: `Payments (${metrics.pendingPayments})`, icon: CreditCard },
            { id: 'assignments', label: `Grading Desk (${metrics.pendingReviews})`, icon: FileCheck },
            { id: 'learners', label: `Learners (${metrics.totalLearners})`, icon: Users },
            { id: 'communications', label: 'Email & Text Center', icon: Mail },
            { id: 'curriculum', label: 'Curriculum Editor', icon: BookOpen },
            { id: 'credentials', label: 'Certificates & Badges', icon: Award },
            { id: 'announcements', label: 'Broadcasts', icon: Bell },
            { id: 'audit', label: 'Audit Trail & Security', icon: History },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as AdminTab)}
                className={`py-2.5 px-4 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                  isActive
                    ? 'bg-slate-800 text-cyan-400 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ---------------------------------------------------- */}
        {/* TAB 1: EXECUTIVE OVERVIEW */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
                <span className="text-[10px] font-mono uppercase text-slate-500 block">Total Learners</span>
                <p className="text-2xl font-bold font-mono text-white mt-1">{metrics.totalLearners}</p>
                <span className="text-[11px] text-slate-400">Registered users</span>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
                <span className="text-[10px] font-mono uppercase text-slate-500 block">Pending Payments</span>
                <p className="text-2xl font-bold font-mono text-amber-400 mt-1">{metrics.pendingPayments}</p>
                <span className="text-[11px] text-slate-400">₹1 UTRs awaiting review</span>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
                <span className="text-[10px] font-mono uppercase text-slate-500 block">Pending Reviews</span>
                <p className="text-2xl font-bold font-mono text-cyan-400 mt-1">{metrics.pendingReviews}</p>
                <span className="text-[11px] text-slate-400">Assignments queued</span>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
                <span className="text-[10px] font-mono uppercase text-slate-500 block">Certificates Issued</span>
                <p className="text-2xl font-bold font-mono text-emerald-400 mt-1">{metrics.certificatesIssued}</p>
                <span className="text-[11px] text-slate-400">Verifiable credentials</span>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
                <span className="text-[10px] font-mono uppercase text-slate-500 block">Track Enrollments</span>
                <p className="text-2xl font-bold font-mono text-blue-400 mt-1">{metrics.enrolledGenAI + metrics.enrolledAgenticAI}</p>
                <span className="text-[11px] text-slate-400">GenAI: {metrics.enrolledGenAI} · Agentic: {metrics.enrolledAgenticAI}</span>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
                <span className="text-[10px] font-mono uppercase text-slate-500 block">Avg Completion</span>
                <p className="text-2xl font-bold font-mono text-purple-400 mt-1">{metrics.averageCompletionPercentage}%</p>
                <span className="text-[11px] text-slate-400">Real progress data</span>
              </div>
            </div>

            {/* Mission Directive Card */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-3">
              <h3 className="font-display font-bold text-white text-base flex items-center gap-2">
                <Shield className="w-4 h-4 text-cyan-400" />
                Administrative Governance Principles
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <h4 className="font-semibold text-white">Genuine Hands-On Verification</h4>
                  <p className="text-slate-400 leading-relaxed">
                    Zero-To-Infinity certificates and badges are issued exclusively upon verifiable task completion. Never mark assignments complete without reviewing student code/prompts.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <h4 className="font-semibold text-white">₹1 Contribution Governance</h4>
                  <p className="text-slate-400 leading-relaxed">
                    Verify UTR records against UPI payee <strong className="text-cyan-400">9873152277@kotak</strong> before marking payment status as 'verified'.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <h4 className="font-semibold text-white">Audit Trail Immutability</h4>
                  <p className="text-slate-400 leading-relaxed">
                    All administrative operations (grading, revocations, broadcasts, settings updates) write directly to the persistent audit log for accountability.
                  </p>
                </div>
              </div>
            </div>

            {/* Multi-Channel Learner Communications Quick Access */}
            <div className="bg-gradient-to-r from-cyan-950/40 via-slate-900/80 to-blue-950/40 border border-cyan-800/40 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white flex items-center gap-2">
                    Multi-Channel Learner Communications
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-300">
                      Email + SMS Ready
                    </span>
                  </h4>
                  <p className="text-xs text-slate-400">
                    Dispatch individualized, cohort-targeted (by track or status), or blast announcements across all {allUsers.length} learners with delivery audit tracking.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('communications')}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all shadow-md flex items-center gap-2"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Open Communications Hub</span>
              </button>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 2: PAYMENT VERIFICATION CONSOLE */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'payments' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-2">
                {(['all', 'pending_verification', 'verified', 'rejected'] as const).map(st => (
                  <button
                    key={st}
                    onClick={() => setPaymentFilter(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                      paymentFilter === st 
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {st.replace('_', ' ')}
                  </button>
                ))}
              </div>

              <div className="text-xs text-slate-400 font-mono">
                {filteredPayments.length} Payments in queue
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-mono">
                    <tr>
                      <th className="p-3.5">Learner</th>
                      <th className="p-3.5">Amount</th>
                      <th className="p-3.5">Method & UTR</th>
                      <th className="p-3.5">Date</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filteredPayments.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-500">
                          No payments match the selected filter.
                        </td>
                      </tr>
                    ) : (
                      filteredPayments.map(p => {
                        const learner = allUsers.find(u => u.id === p.user_id);
                        return (
                          <tr key={p.id} className="hover:bg-slate-900/50">
                            <td className="p-3.5 font-medium text-white">
                              <div>{learner?.display_name || p.user_id}</div>
                              <div className="text-[11px] text-slate-400">{learner?.email}</div>
                            </td>
                            <td className="p-3.5 font-mono font-bold text-cyan-300">
                              ₹{p.amount} {p.currency}
                            </td>
                            <td className="p-3.5">
                              <span className="font-mono text-slate-200 font-bold">{p.upi_reference}</span>
                              <span className="text-[10px] text-slate-500 block">{p.payment_method}</span>
                              {p.receipt_url && (
                                <a
                                  href={p.receipt_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-cyan-400 hover:underline text-[10px] flex items-center gap-1 mt-0.5"
                                >
                                  View Screenshot <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                              )}
                            </td>
                            <td className="p-3.5 text-slate-400">
                              {new Date(p.created_at).toLocaleDateString()}
                            </td>
                            <td className="p-3.5">
                              <StatusBadge status={p.verification_status} />
                            </td>
                            <td className="p-3.5 text-right space-x-2">
                              {p.verification_status === 'pending_verification' && (
                                <>
                                  <button
                                    onClick={() => handleVerifyPayment(p.id)}
                                    className="px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors"
                                  >
                                    Approve & Unlock
                                  </button>
                                  <button
                                    onClick={() => setRejectReasonModal({ isOpen: true, paymentId: p.id, reason: '' })}
                                    className="px-3 py-1 rounded-lg text-xs font-semibold bg-rose-950 border border-rose-800 hover:bg-rose-900 text-rose-300 transition-colors"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}
                              {p.verification_status === 'verified' && (
                                <span className="text-[11px] text-emerald-400 font-mono">
                                  Verified by Kapil
                                </span>
                              )}
                              {p.verification_status === 'rejected' && (
                                <span className="text-[11px] text-rose-400 italic">
                                  {p.rejection_reason || 'Rejected'}
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Reject Modal */}
            {rejectReasonModal.isOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4">
                  <h3 className="text-base font-bold text-white">Reject Contribution Record</h3>
                  <p className="text-xs text-slate-400">
                    Provide a clear reason for rejecting this UTR reference (e.g., UTR not found on Kotak statement, invalid reference number).
                  </p>
                  <textarea
                    rows={3}
                    value={rejectReasonModal.reason}
                    onChange={(e) => setRejectReasonModal({ ...rejectReasonModal, reason: e.target.value })}
                    placeholder="Enter rejection reason..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setRejectReasonModal({ isOpen: false, paymentId: '', reason: '' })}
                      className="px-4 py-2 rounded-xl text-xs bg-slate-800 text-slate-300"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleRejectPayment}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-500 hover:bg-rose-400 text-slate-950"
                    >
                      Confirm Rejection
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 3: ASSIGNMENT REVIEW & GRADING DESK */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'assignments' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-2">
                {(['all', 'submitted', 'reviewed', 'needs_revision'] as const).map(st => (
                  <button
                    key={st}
                    onClick={() => setSubmissionFilter(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                      submissionFilter === st 
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {st.replace('_', ' ')}
                  </button>
                ))}
              </div>

              <div className="text-xs text-slate-400 font-mono">
                {filteredSubmissions.length} Submissions Listed
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Submission List */}
              <div className="lg:col-span-6 space-y-3 max-h-[750px] overflow-y-auto pr-2">
                {filteredSubmissions.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 bg-slate-900/40 rounded-2xl border border-slate-800">
                    No submissions match the current filter.
                  </div>
                ) : (
                  filteredSubmissions.map(sub => {
                    const assignment = storage.getAssignments().find(a => a.id === sub.assignment_id);
                    const learner = allUsers.find(u => u.id === sub.user_id);
                    const isSelected = activeReviewSub?.id === sub.id;

                    return (
                      <div
                        key={sub.id}
                        onClick={() => {
                          setActiveReviewSub(sub);
                          setReviewGrade(sub.grade_score ?? 90);
                          setReviewFeedback(sub.feedback || '');
                          setReviewStatus(sub.status === 'needs_revision' ? 'needs_revision' : 'reviewed');
                        }}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                          isSelected 
                            ? 'bg-slate-800 border-cyan-500/60 shadow-md' 
                            : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-xs text-white">
                            {learner?.display_name || sub.user_id}
                          </span>
                          <StatusBadge status={sub.status} />
                        </div>

                        <h4 className="text-sm font-semibold text-cyan-400 line-clamp-1">
                          {assignment ? `Day ${assignment.day_number}: ${assignment.title}` : sub.assignment_id}
                        </h4>

                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                          {sub.response_text || 'No text note provided.'}
                        </p>

                        <div className="flex items-center justify-between text-[11px] text-slate-500 mt-3 pt-2 border-t border-slate-800/80">
                          <span>v{sub.version_number} · {new Date(sub.submitted_at).toLocaleDateString()}</span>
                          {sub.grade_score !== undefined && (
                            <span className="font-mono text-cyan-300 font-bold">Grade: {sub.grade_score}/100</span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Review Inspector Desk */}
              <div className="lg:col-span-6 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
                {activeReviewSub ? (
                  <form onSubmit={handleSubmitReview} className="space-y-4">
                    <div className="border-b border-slate-800 pb-3">
                      <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold tracking-wider">
                        Grading Desk Inspector
                      </span>
                      <h3 className="text-lg font-bold text-white mt-1">
                        Reviewing: {allUsers.find(u => u.id === activeReviewSub.user_id)?.display_name}
                      </h3>
                      <p className="text-xs text-slate-400 font-mono">
                        Submission ID: {activeReviewSub.id} · v{activeReviewSub.version_number}
                      </p>
                    </div>

                    {/* Learner's Submitted Work */}
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                      <span className="text-[10px] uppercase font-mono text-slate-500 font-bold block">
                        Learner Submitted Work
                      </span>
                      <div className="text-slate-300 whitespace-pre-wrap max-h-48 overflow-y-auto">
                        {activeReviewSub.response_text || 'No text response submitted.'}
                      </div>

                      {activeReviewSub.submission_url && (
                        <div className="pt-2 border-t border-slate-800">
                          <a
                            href={activeReviewSub.submission_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-cyan-400 hover:underline flex items-center gap-1.5"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            {activeReviewSub.submission_url}
                          </a>
                        </div>
                      )}

                      {activeReviewSub.file_url && (
                        <div className="pt-2 border-t border-slate-800">
                          <a
                            href={activeReviewSub.file_url}
                            download={activeReviewSub.file_name || 'submission'}
                            className="text-emerald-400 hover:underline flex items-center gap-1.5"
                          >
                            <Download className="w-3.5 h-3.5" />
                            Download Attachment ({activeReviewSub.file_name})
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Grade & Status Controls */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-mono text-slate-300 mb-1">
                          Review Decision
                        </label>
                        <select
                          value={reviewStatus}
                          onChange={(e) => setReviewStatus(e.target.value as any)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                        >
                          <option value="reviewed">Approved & Reviewed</option>
                          <option value="needs_revision">Needs Revision</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-mono text-slate-300 mb-1">
                          Grade Score (0 - 100)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={reviewGrade}
                          onChange={(e) => setReviewGrade(Number(e.target.value))}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                        />
                      </div>
                    </div>

                    {/* Feedback Note */}
                    <div>
                      <label className="block text-xs font-mono text-slate-300 mb-1">
                        Constructive Instructor Feedback (Kapil)
                      </label>
                      <textarea
                        rows={3}
                        value={reviewFeedback}
                        onChange={(e) => setReviewFeedback(e.target.value)}
                        placeholder="Provide detailed feedback on prompt clarity, error handling, agent loop design..."
                        required
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    {/* Review-Gated Badge Option: Award Upon Approval */}
                    {reviewStatus === 'reviewed' && (
                      <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-mono text-cyan-300 flex items-center gap-1.5 font-bold">
                            <Award className="w-3.5 h-3.5 text-cyan-400" />
                            Award Badge Upon Approval (Policy: Only After Review)
                          </label>
                          <span className="text-[10px] text-slate-400 font-mono">Optional</span>
                        </div>
                        <select
                          value={inlineBadgeId}
                          onChange={(e) => setInlineBadgeId(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                        >
                          <option value="">-- Do Not Award Badge Now --</option>
                          {allBadges.map(b => (
                            <option key={b.id} value={b.id}>
                              {b.name} ({b.slug})
                            </option>
                          ))}
                        </select>
                        <p className="text-[10px] text-slate-400">
                          Badges can only be assigned after an assignment is reviewed and marked approved.
                        </p>
                      </div>
                    )}

                    {inlineBadgeNotice && (
                      <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                        inlineBadgeNotice.success 
                          ? 'bg-emerald-950/40 border border-emerald-800/60 text-emerald-300' 
                          : 'bg-rose-950/40 border border-rose-800/60 text-rose-300'
                      }`}>
                        {inlineBadgeNotice.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                        <span>{inlineBadgeNotice.msg}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl font-bold text-xs bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors shadow-lg shadow-cyan-500/20"
                    >
                      Save Evaluation & Notify Learner
                    </button>

                    {/* Quick Badge Award for already reviewed submissions */}
                    {activeReviewSub.status === 'reviewed' && (
                      <div className="pt-3 border-t border-slate-800/80 space-y-2">
                        <span className="text-[11px] font-mono font-bold text-slate-300 block">
                          Instant Badge Issuance (For This Approved Submission)
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {allBadges.map(bg => {
                            const alreadyHas = allLearnerBadges.some(lb => lb.user_id === activeReviewSub.user_id && lb.badge_id === bg.id && !lb.revoked_at);
                            return (
                              <button
                                key={bg.id}
                                type="button"
                                disabled={alreadyHas}
                                onClick={() => handleQuickAwardBadge(bg.id)}
                                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium flex items-center gap-1.5 transition-all ${
                                  alreadyHas
                                    ? 'bg-slate-800/50 text-slate-500 cursor-not-allowed border border-slate-850'
                                    : 'bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                                }`}
                              >
                                <Award className="w-3 h-3" />
                                <span>{bg.name}</span>
                                {alreadyHas && <span className="text-[9px] text-emerald-400">✓ Earned</span>}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </form>
                ) : (
                  <div className="p-12 text-center text-slate-500 space-y-2">
                    <FileCheck className="w-10 h-10 mx-auto text-slate-600" />
                    <p className="text-xs">Select a submission from the left to inspect deliverables, grade, and provide instructor notes.</p>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 4: REAL-TIME LEARNERS ROSTER (FIREBASE SYNC) */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'learners' && (() => {
          // Compute telemetry metrics across all connected learners
          const learnersList = allUsers.filter(u => u.role !== 'admin');
          const verifiedCount = learnersList.filter(u => u.email_verified).length;
          const mobileCount = learnersList.filter(u => 
            u.device_info?.device_type === 'Mobile' || 
            u.device_info?.device_type === 'Tablet' ||
            (u.last_device && (u.last_device.includes('Mobile') || u.last_device.includes('iPhone') || u.last_device.includes('Android')))
          ).length;
          const desktopCount = learnersList.length - mobileCount;

          // Filter learners according to filter pills & search query
          const filteredLearners = learnersList.filter(user => {
            if (learnerFilter === 'verified' && !user.email_verified) return false;
            if (learnerFilter === 'mobile') {
              const isMobile = user.device_info?.device_type === 'Mobile' || 
                               user.device_info?.device_type === 'Tablet' ||
                               (user.last_device && (user.last_device.includes('Mobile') || user.last_device.includes('iPhone') || user.last_device.includes('Android')));
              if (!isMobile) return false;
            }
            if (learnerFilter === 'desktop') {
              const isMobile = user.device_info?.device_type === 'Mobile' || 
                               user.device_info?.device_type === 'Tablet' ||
                               (user.last_device && (user.last_device.includes('Mobile') || user.last_device.includes('iPhone') || user.last_device.includes('Android')));
              if (isMobile) return false;
            }

            if (learnerSearchQuery.trim()) {
              const q = learnerSearchQuery.toLowerCase();
              const matchName = user.display_name.toLowerCase().includes(q);
              const matchEmail = user.email.toLowerCase().includes(q);
              const matchDevice = (user.last_device || '').toLowerCase().includes(q) ||
                                  (user.device_info?.summary || '').toLowerCase().includes(q) ||
                                  (user.device_info?.browser || '').toLowerCase().includes(q) ||
                                  (user.device_info?.os || '').toLowerCase().includes(q);
              return matchName || matchEmail || matchDevice;
            }

            return true;
          });

          return (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Real-time Connection & Telemetry Header */}
              <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="relative flex items-center justify-center">
                      <span className="animate-ping absolute inline-flex h-3.5 w-3.5 rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-display font-bold text-base sm:text-lg text-white">
                          Real-Time Learners Command Center
                        </h3>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-800/80 text-emerald-300 text-[10px] font-mono font-bold flex items-center gap-1">
                          <Radio className="w-3 h-3 animate-pulse text-emerald-400" />
                          Firebase Live Sync Active
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Automatic synchronization across mobile phones, laptops, tablets, and any web browser via Firestore.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={triggerRefresh}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-mono flex items-center gap-1.5 border border-slate-700 transition-colors"
                      title="Force refresh data"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Sync Now
                    </button>
                    <div className="text-[11px] font-mono text-slate-400 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800/80">
                      Last Synced: <span className="text-cyan-400 font-semibold">{lastLiveSync.toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>

                {/* Real-time Telemetry Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
                    <span className="text-[10px] font-mono uppercase text-slate-400 block">Total Real Learners</span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-2xl font-bold font-mono text-white">{learnersList.length}</span>
                      <span className="text-[11px] text-cyan-400 font-mono">in Firebase</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
                    <span className="text-[10px] font-mono uppercase text-slate-400 block">Email Verified (Google)</span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-2xl font-bold font-mono text-emerald-400">{verifiedCount}</span>
                      <span className="text-[11px] text-emerald-500 font-mono">
                        {learnersList.length > 0 ? Math.round((verifiedCount / learnersList.length) * 100) : 100}% verified
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
                    <span className="text-[10px] font-mono uppercase text-slate-400 block">Mobile Sessions</span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-2xl font-bold font-mono text-cyan-400">{mobileCount}</span>
                      <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                        <Smartphone className="w-3 h-3" /> Phones/Tabs
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
                    <span className="text-[10px] font-mono uppercase text-slate-400 block">Laptop & Desktop</span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-2xl font-bold font-mono text-blue-400">{desktopCount}</span>
                      <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                        <Laptop className="w-3 h-3" /> Computers
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Live Event Toast Banner (Appears when learner connects from device) */}
              {liveToast && (
                <div className="p-3.5 rounded-xl bg-cyan-950/70 border border-cyan-700/80 text-cyan-200 text-xs flex items-center justify-between shadow-lg shadow-cyan-950/40 animate-in slide-in-from-top-2 duration-300">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span className="font-semibold">{liveToast}</span>
                  </div>
                  <button 
                    onClick={() => setLiveToast(null)} 
                    className="text-cyan-400 hover:text-white text-xs font-bold px-2 py-0.5"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Search & Filter Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setLearnerFilter('all')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      learnerFilter === 'all'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'text-slate-400 hover:text-slate-200 bg-slate-950 border border-slate-800'
                    }`}
                  >
                    All Learners ({learnersList.length})
                  </button>

                  <button
                    onClick={() => setLearnerFilter('verified')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      learnerFilter === 'verified'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'text-slate-400 hover:text-slate-200 bg-slate-950 border border-slate-800'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Verified Email Only ({verifiedCount})
                  </button>

                  <button
                    onClick={() => setLearnerFilter('mobile')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      learnerFilter === 'mobile'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'text-slate-400 hover:text-slate-200 bg-slate-950 border border-slate-800'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
                    Mobile Devices ({mobileCount})
                  </button>

                  <button
                    onClick={() => setLearnerFilter('desktop')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      learnerFilter === 'desktop'
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                        : 'text-slate-400 hover:text-slate-200 bg-slate-950 border border-slate-800'
                    }`}
                  >
                    <Laptop className="w-3.5 h-3.5 text-blue-400" />
                    Laptop / Desktop ({desktopCount})
                  </button>
                </div>

                {/* Search Bar */}
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={learnerSearchQuery}
                    onChange={(e) => setLearnerSearchQuery(e.target.value)}
                    placeholder="Search by learner, email, device..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                  {learnerSearchQuery && (
                    <button 
                      onClick={() => setLearnerSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Batch Action Toolbar */}
              {selectedLearnerCheckboxIds.length > 0 && (
                <div className="p-3.5 bg-gradient-to-r from-cyan-950/90 to-blue-950/90 border border-cyan-600/70 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-xl animate-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-cyan-500 text-slate-950 flex items-center justify-center font-bold text-xs">
                      {selectedLearnerCheckboxIds.length}
                    </div>
                    <span className="font-bold text-white text-xs">
                      {selectedLearnerCheckboxIds.length} {selectedLearnerCheckboxIds.length === 1 ? 'Learner' : 'Learners'} selected
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setCommPreselectedLearnerIds(selectedLearnerCheckboxIds);
                        setCommPreselectedLearnerId(undefined);
                        setActiveTab('communications');
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-all shadow-md"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Send Email & Text to Selected ({selectedLearnerCheckboxIds.length})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const selEmails = filteredLearners
                          .filter(u => selectedLearnerCheckboxIds.includes(u.id))
                          .map(u => u.email)
                          .filter(Boolean);
                        navigator.clipboard.writeText(selEmails.join(', '));
                        alert(`Copied ${selEmails.length} email addresses to clipboard.`);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white text-xs font-mono"
                    >
                      Copy Emails
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedLearnerCheckboxIds([])}
                      className="px-2.5 py-1.5 rounded-xl text-slate-400 hover:text-white text-xs"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}

              {/* Real-time Learner Table */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-mono">
                      <tr>
                        <th className="p-4 w-10">
                          <input
                            type="checkbox"
                            checked={filteredLearners.length > 0 && selectedLearnerCheckboxIds.length === filteredLearners.length}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedLearnerCheckboxIds(filteredLearners.map(u => u.id));
                              } else {
                                setSelectedLearnerCheckboxIds([]);
                              }
                            }}
                            className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0 cursor-pointer"
                            title="Select all filtered learners"
                          />
                        </th>
                        <th className="p-4">Learner Identity</th>
                        <th className="p-4">Email Verification</th>
                        <th className="p-4">Device & Browser Telemetry</th>
                        <th className="p-4">Last Activity</th>
                        <th className="p-4">Mission Progress</th>
                        <th className="p-4 text-right">Admin Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {filteredLearners.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-10 text-center text-slate-500 space-y-2">
                            <Users className="w-8 h-8 mx-auto text-slate-600" />
                            <p className="text-sm font-semibold text-slate-300">No learners match the current filter or search criteria.</p>
                            <p className="text-xs text-slate-500">Learners who sign in via Google will automatically appear here in real time.</p>
                          </td>
                        </tr>
                      ) : (
                        filteredLearners.map(user => {
                          const enrollments = storage.getEnrollmentsByUser(user.id);
                          const genAIProg = storage.calculateLearnerProgress(user.id, 'track-genai');
                          const agenticProg = storage.calculateLearnerProgress(user.id, 'track-agentic');

                          // Detect device characteristics
                          const isMobile = user.device_info?.device_type === 'Mobile' || 
                                           user.device_info?.device_type === 'Tablet' ||
                                           (user.last_device && (user.last_device.includes('Mobile') || user.last_device.includes('iPhone') || user.last_device.includes('Android')));
                          
                          const deviceSummary = user.device_info?.summary || user.last_device || 'Web Client';
                          const browserName = user.device_info?.browser || 'Browser';
                          const osName = user.device_info?.os || 'Any OS';

                          // Active presence detection (within last 30 minutes)
                          const lastLoginMs = user.last_login_at ? new Date(user.last_login_at).getTime() : 0;
                          const isOnlineNow = (Date.now() - lastLoginMs) < 30 * 60 * 1000;
                          const isChecked = selectedLearnerCheckboxIds.includes(user.id);

                          return (
                            <tr key={user.id} className={`hover:bg-slate-900/70 transition-colors ${isChecked ? 'bg-cyan-950/20' : ''}`}>
                              
                              {/* Row Checkbox */}
                              <td className="p-4">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedLearnerCheckboxIds(prev => [...prev, user.id]);
                                    } else {
                                      setSelectedLearnerCheckboxIds(prev => prev.filter(id => id !== user.id));
                                    }
                                  }}
                                  className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0 cursor-pointer"
                                />
                              </td>

                              {/* Learner Identity */}
                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  {user.photo_url ? (
                                    <img 
                                      src={user.photo_url} 
                                      alt={user.display_name} 
                                      className="w-9 h-9 rounded-xl border border-slate-700 object-cover shrink-0" 
                                      referrerPolicy="no-referrer"
                                    />
                                  ) : (
                                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-600 to-blue-700 flex items-center justify-center text-white font-bold font-mono text-xs shrink-0">
                                      {user.display_name.substring(0, 2).toUpperCase()}
                                    </div>
                                  )}
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-bold text-white text-sm">{user.display_name}</span>
                                      {isOnlineNow && (
                                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-[10px] text-emerald-300 font-mono font-bold">
                                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                          Active Now
                                        </span>
                                      )}
                                    </div>
                                    <span className="text-slate-400 text-xs font-mono block">{user.email}</span>
                                  </div>
                                </div>
                              </td>

                              {/* Email Verification Status */}
                              <td className="p-4">
                                {user.email_verified ? (
                                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 text-xs font-medium">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                    <span>Verified Google ID</span>
                                  </div>
                                ) : (
                                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-950/60 border border-amber-800/80 text-amber-300 text-xs font-medium">
                                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                                    <span>Verification Required</span>
                                  </div>
                                )}
                                <span className="text-[10px] text-slate-500 block mt-1 font-mono">
                                  Provider: Google OAuth
                                </span>
                              </td>

                              {/* Device & Browser Telemetry */}
                              <td className="p-4">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2 text-white font-medium">
                                    {isMobile ? (
                                      <span className="p-1 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/50">
                                        <Smartphone className="w-3.5 h-3.5" />
                                      </span>
                                    ) : (
                                      <span className="p-1 rounded bg-blue-950 text-blue-400 border border-blue-800/50">
                                        <Laptop className="w-3.5 h-3.5" />
                                      </span>
                                    )}
                                    <span className="text-xs font-mono">{deviceSummary}</span>
                                  </div>

                                  <div className="text-[11px] text-slate-400 flex items-center gap-2 font-mono">
                                    <span>{browserName}</span>
                                    <span>·</span>
                                    <span>{osName}</span>
                                    {user.device_info?.screen_resolution && (
                                      <>
                                        <span>·</span>
                                        <span className="text-slate-500">{user.device_info.screen_resolution}</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </td>

                              {/* Last Activity */}
                              <td className="p-4 font-mono text-slate-300">
                                {user.last_login_at ? (
                                  <div>
                                    <span className="block text-xs font-bold text-slate-200">
                                      {new Date(user.last_login_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    </span>
                                    <span className="text-[11px] text-slate-500 block">
                                      {new Date(user.last_login_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-slate-500 text-xs">Recently joined</span>
                                )}
                              </td>

                              {/* Mission Progress */}
                              <td className="p-4 font-mono">
                                <div className="space-y-1.5 w-36">
                                  <div>
                                    <div className="flex justify-between text-[10px] mb-0.5">
                                      <span className="text-slate-400">GenAI</span>
                                      <span className="text-cyan-400 font-bold">{genAIProg.percentage}%</span>
                                    </div>
                                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                      <div 
                                        className="bg-cyan-500 h-full rounded-full transition-all" 
                                        style={{ width: `${genAIProg.percentage}%` }}
                                      ></div>
                                    </div>
                                  </div>

                                  <div>
                                    <div className="flex justify-between text-[10px] mb-0.5">
                                      <span className="text-slate-400">Agentic</span>
                                      <span className="text-blue-400 font-bold">{agenticProg.percentage}%</span>
                                    </div>
                                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                      <div 
                                        className="bg-blue-500 h-full rounded-full transition-all" 
                                        style={{ width: `${agenticProg.percentage}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                </div>
                              </td>

                              {/* Admin Actions */}
                              <td className="p-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => {
                                      setCommPreselectedLearnerId(user.id);
                                      setCommPreselectedLearnerIds([]);
                                      setActiveTab('communications');
                                    }}
                                    className="px-2.5 py-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 hover:text-white text-xs font-semibold border border-cyan-700/80 transition-colors flex items-center gap-1"
                                    title={`Send Email or Text to ${user.display_name}`}
                                  >
                                    <Mail className="w-3.5 h-3.5" />
                                    <span>Message</span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      setCertLearnerId(user.id);
                                      setActiveTab('credentials');
                                    }}
                                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-white text-xs font-semibold border border-slate-700 transition-colors"
                                    title="Issue completion certificate"
                                  >
                                    Credential
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSubmissionLearnerFilter(user.id);
                                      setActiveTab('assignments');
                                    }}
                                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition-colors"
                                    title="Review learner deliverables"
                                  >
                                    Reviews
                                  </button>
                                </div>
                              </td>

                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          );
        })()}

        {/* ---------------------------------------------------- */}
        {/* TAB: COMMUNICATIONS (EMAIL & TEXT DISPATCH HUB) */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'communications' && (
          <AdminCommunications
            currentUser={currentUser}
            allUsers={allUsers}
            preselectedLearnerId={commPreselectedLearnerId}
            preselectedLearnerIds={commPreselectedLearnerIds}
            onClearPreselected={() => {
              setCommPreselectedLearnerId(undefined);
              setCommPreselectedLearnerIds([]);
            }}
            onRefreshData={triggerRefresh}
          />
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 5: CURRICULUM EDITOR */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'curriculum' && (
          <div className="space-y-6">
            <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-slate-400 uppercase">Select Track:</span>
                <select
                  value={selectedCurriculumTrack}
                  onChange={(e) => {
                    setSelectedCurriculumTrack(e.target.value);
                    setSelectedDayNumber(1);
                  }}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-semibold"
                >
                  {tracks.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              {curriculumSavedNotice && (
                <div className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  Day curriculum saved to persistent storage!
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Day Selector */}
              <div className="lg:col-span-3 space-y-1.5 max-h-[700px] overflow-y-auto pr-1">
                {trackDays.map(day => (
                  <button
                    key={day.id}
                    onClick={() => handleSelectDay(day.day_number)}
                    className={`w-full text-left p-2.5 rounded-xl text-xs font-medium transition-all flex items-center gap-2 border ${
                      selectedDayNumber === day.day_number
                        ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300 font-bold'
                        : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="w-5 h-5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono flex items-center justify-center shrink-0">
                      {day.day_number}
                    </span>
                    <span className="truncate">{day.title}</span>
                  </button>
                ))}
              </div>

              {/* Day Editor Form */}
              <div className="lg:col-span-9 bg-slate-900/90 border border-slate-800 rounded-2xl p-6">
                <form onSubmit={handleSaveCurriculumDay} className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="font-display font-bold text-base text-white">
                      Editing Day {selectedDayNumber} of 30
                    </h3>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center gap-1.5 shadow-md shadow-cyan-500/10"
                    >
                      <Save className="w-3.5 h-3.5" />
                      Save Day Changes
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1">Day Title</label>
                    <input
                      type="text"
                      value={editDayTitle}
                      onChange={(e) => setEditDayTitle(e.target.value)}
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1">Practical Objective (Summary)</label>
                    <textarea
                      rows={2}
                      value={editDayObjective}
                      onChange={(e) => setEditDayObjective(e.target.value)}
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono text-slate-300 mb-1">Suggested Tools (comma separated)</label>
                      <input
                        type="text"
                        value={editDayTools}
                        onChange={(e) => setEditDayTools(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-slate-300 mb-1">Estimated Duration (Minutes)</label>
                      <input
                        type="number"
                        value={editDayMinutes}
                        onChange={(e) => setEditDayMinutes(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-cyan-400 mb-1 font-bold">10% Theory Briefing Content</label>
                    <textarea
                      rows={6}
                      value={editDayTheory}
                      onChange={(e) => setEditDayTheory(e.target.value)}
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-500 leading-relaxed font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-emerald-400 mb-1 font-bold">90% Practical Hands-On Mission Content</label>
                    <textarea
                      rows={6}
                      value={editDayActivity}
                      onChange={(e) => setEditDayActivity(e.target.value)}
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-500 leading-relaxed font-sans"
                    />
                  </div>
                </form>
              </div>

            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 6: CREDENTIALS & BADGE ISSUANCE ENGINE */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'credentials' && (
          <div className="space-y-6">

            {/* Operational Policy Header */}
            <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <span className="font-bold text-cyan-300 uppercase tracking-wide block font-mono">
                  SarlaYash Mission Operational Mandate: Review-Gated Credentials
                </span>
                <p className="text-slate-300">
                  Admins can assign badges and certificates <strong>only after review</strong>. A learner must have at least one completed assignment reviewed and approved by Kapil before certificates or competency badges can be cryptographically registered.
                </p>
              </div>
            </div>
            
            {/* Manual Certificate Issuer Form */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-cyan-400" />
                Issue Official Certificate of Completion (Review-Gated)
              </h3>
              <p className="text-xs text-slate-400">
                Generate an immutable cryptographic certificate record signed by Kapil under SarlaYash Mission. Requires at least 1 reviewed submission.
              </p>

              {certSuccessNotice && (
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{certSuccessNotice}</span>
                </div>
              )}

              {certErrorNotice && (
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{certErrorNotice}</span>
                </div>
              )}

              <form onSubmit={handleIssueCertificate} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">Select Learner</label>
                  <select
                    value={certLearnerId}
                    onChange={(e) => {
                      setCertLearnerId(e.target.value);
                      setCertErrorNotice('');
                    }}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="">-- Choose Learner --</option>
                    {allUsers.filter(u => u.role === 'learner').map(u => {
                      const reviewedCount = storage.getReviewedSubmissionsByUser(u.id).length;
                      return (
                        <option key={u.id} value={u.id}>
                          {u.display_name} ({reviewedCount} approved reviews)
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">Track</label>
                  <select
                    value={certTrackId}
                    onChange={(e) => setCertTrackId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    {tracks.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={Boolean(certLearnerId && !storage.canAssignCredentials(certLearnerId))}
                    className={`w-full py-2.5 rounded-xl font-bold text-xs transition-colors shadow-md ${
                      certLearnerId && !storage.canAssignCredentials(certLearnerId)
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                        : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/10'
                    }`}
                  >
                    Generate & Register Certificate
                  </button>
                </div>
              </form>

              {certLearnerId && !storage.canAssignCredentials(certLearnerId) && (
                <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>
                    <strong>Policy Lock:</strong> This learner has 0 reviewed submissions. Kapil must review and approve at least one assignment before a certificate can be issued.
                  </span>
                </div>
              )}
            </div>

            {/* Review-Gated Badge Issuer Desk */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-400" />
                Award Verifiable Competency Badge (Only After Review)
              </h3>
              <p className="text-xs text-slate-400">
                Award cryptographically verifiable skill badges tied directly to an approved assignment review deliverable.
              </p>

              {badgeSuccessNotice && (
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{badgeSuccessNotice}</span>
                </div>
              )}

              {badgeErrorNotice && (
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{badgeErrorNotice}</span>
                </div>
              )}

              <form onSubmit={handleAssignBadgeAfterReview} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1">Select Learner</label>
                    <select
                      value={awardBadgeLearnerId}
                      onChange={(e) => {
                        setAwardBadgeLearnerId(e.target.value);
                        setAwardBadgeSubmissionId('');
                        setBadgeErrorNotice('');
                      }}
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                    >
                      <option value="">-- Choose Learner --</option>
                      {allUsers.filter(u => u.role === 'learner').map(u => {
                        const reviewedCount = storage.getReviewedSubmissionsByUser(u.id).length;
                        return (
                          <option key={u.id} value={u.id}>
                            {u.display_name} ({reviewedCount} approved reviews)
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1">
                      Approved Review Deliverable
                    </label>
                    <select
                      value={awardBadgeSubmissionId}
                      onChange={(e) => setAwardBadgeSubmissionId(e.target.value)}
                      required
                      disabled={!awardBadgeLearnerId || storage.getReviewedSubmissionsByUser(awardBadgeLearnerId).length === 0}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 disabled:opacity-50"
                    >
                      <option value="">-- Select Reviewed Deliverable --</option>
                      {awardBadgeLearnerId && storage.getReviewedSubmissionsByUser(awardBadgeLearnerId).map(sub => {
                        const asg = storage.getAssignments().find(a => a.id === sub.assignment_id);
                        return (
                          <option key={sub.id} value={sub.id}>
                            {asg ? `Day ${asg.day_number}: ${asg.title}` : sub.id} (Grade: {sub.grade_score}/100)
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1">Competency Badge</label>
                    <select
                      value={awardBadgeId}
                      onChange={(e) => setAwardBadgeId(e.target.value)}
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                    >
                      <option value="">-- Choose Badge --</option>
                      {allBadges.map(bg => (
                        <option key={bg.id} value={bg.id}>
                          {bg.name} ({bg.slug})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={!awardBadgeLearnerId || !storage.canAssignCredentials(awardBadgeLearnerId)}
                    className="px-6 py-2.5 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors shadow-md shadow-emerald-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Award Badge After Review
                  </button>
                </div>
              </form>
            </div>

            {/* Issued Certificates Table */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <h4 className="font-bold text-sm text-white">Issued Certificates Database</h4>
                <span className="text-xs font-mono text-slate-400">{allCertificates.length} Records</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-mono">
                    <tr>
                      <th className="p-3.5">Certificate Number</th>
                      <th className="p-3.5">Recipient</th>
                      <th className="p-3.5">Track</th>
                      <th className="p-3.5">Issue Date</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {allCertificates.map(c => (
                      <tr key={c.id} className="hover:bg-slate-900/50">
                        <td className="p-3.5 font-mono text-cyan-400 font-bold">
                          {c.certificate_number}
                        </td>
                        <td className="p-3.5 font-medium text-white">
                          {c.recipient_name_snapshot}
                        </td>
                        <td className="p-3.5 text-slate-300">
                          {c.track_name_snapshot}
                        </td>
                        <td className="p-3.5 text-slate-400">
                          {new Date(c.issue_date).toLocaleDateString()}
                        </td>
                        <td className="p-3.5">
                          <StatusBadge status={c.status} />
                        </td>
                        <td className="p-3.5 text-right space-x-2">
                          <button
                            onClick={() => onNavigate(`/verify/certificate/${c.certificate_number}`)}
                            className="text-cyan-400 hover:underline"
                          >
                            Verify Link
                          </button>
                          {c.status === 'issued' && (
                            <button
                              onClick={() => {
                                const reason = prompt('Enter revocation reason:');
                                if (reason) {
                                  storage.revokeCertificate(c.id, currentUser.id, reason);
                                  triggerRefresh();
                                }
                              }}
                              className="text-rose-400 hover:underline ml-2"
                            >
                              Revoke
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Issued Badges Database */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <h4 className="font-bold text-sm text-white">Issued Competency Badges Registry</h4>
                <span className="text-xs font-mono text-slate-400">{allLearnerBadges.length} Records</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-mono">
                    <tr>
                      <th className="p-3.5">Credential ID</th>
                      <th className="p-3.5">Learner</th>
                      <th className="p-3.5">Badge</th>
                      <th className="p-3.5">Issued At</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {allLearnerBadges.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-slate-500">
                          No competency badges issued yet.
                        </td>
                      </tr>
                    ) : (
                      allLearnerBadges.map(lb => {
                        const learner = allUsers.find(u => u.id === lb.user_id);
                        const badgeInfo = allBadges.find(b => b.id === lb.badge_id);
                        return (
                          <tr key={lb.id} className="hover:bg-slate-900/50">
                            <td className="p-3.5 font-mono text-emerald-400 font-bold">
                              {lb.credential_id}
                            </td>
                            <td className="p-3.5 font-medium text-white">
                              {learner?.display_name || lb.user_id}
                            </td>
                            <td className="p-3.5 text-slate-300">
                              {badgeInfo?.name || lb.badge_id}
                            </td>
                            <td className="p-3.5 text-slate-400">
                              {new Date(lb.issued_at).toLocaleDateString()}
                            </td>
                            <td className="p-3.5 text-right">
                              <button
                                onClick={() => onNavigate(`/verify/badge/${lb.credential_id}`)}
                                className="text-cyan-400 hover:underline"
                              >
                                Verify Link
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 7: BROADCASTS */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'announcements' && (
          <div className="max-w-2xl bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
            {/* Recommendation banner for Email/Text Hub */}
            <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-800/60 text-cyan-300 text-xs flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Want to send targeted <strong>Emails</strong> or <strong>SMS text messages</strong> to specific individuals or cohorts?</span>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('communications')}
                className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shrink-0"
              >
                Go to Communications Hub →
              </button>
            </div>

            <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
              <Bell className="w-4 h-4 text-cyan-400" />
              Broadcast In-App Announcement
            </h3>
            <p className="text-xs text-slate-400">
              Send priority learning mission briefings and schedule updates directly to registered learners.
            </p>

            {broadcastSentNotice && (
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Broadcast dispatched to all learners!</span>
              </div>
            )}

            <form onSubmit={handleSendBroadcast} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">Announcement Title</label>
                <input
                  type="text"
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  placeholder="e.g. Live Hands-On Agent Workshop this Friday"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">Message Body</label>
                <textarea
                  rows={4}
                  value={broadcastBody}
                  onChange={(e) => setBroadcastBody(e.target.value)}
                  placeholder="Enter briefing message details..."
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl font-bold text-xs bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors shadow-lg shadow-cyan-500/20"
              >
                Send Broadcast Notification
              </button>
            </form>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 8: AUDIT TRAIL & SECURITY */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'audit' && (
          <div className="space-y-6">
            
            {/* Change Admin Password */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 max-w-xl">
              <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-cyan-400" />
                Update Administrator Credentials
              </h3>

              {passwordNotice && (
                <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  passwordNotice.success 
                    ? 'bg-emerald-950/40 border border-emerald-800/60 text-emerald-300' 
                    : 'bg-rose-950/40 border border-rose-800/60 text-rose-300'
                }`}>
                  {passwordNotice.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                  <span>{passwordNotice.msg}</span>
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-3">
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">Current Password</label>
                  <input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">New Secure Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    placeholder="Min 8 characters"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>

                <button
                  type="submit"
                  className="py-2.5 px-6 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-white"
                >
                  Save New Password
                </button>
              </form>
            </div>

            {/* Audit Logs Table */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <h4 className="font-bold text-sm text-white flex items-center gap-2">
                  <History className="w-4 h-4 text-cyan-400" />
                  Chronological System Audit Trail
                </h4>
                <span className="text-xs font-mono text-slate-400">{allAuditLogs.length} Events</span>
              </div>
              <div className="overflow-x-auto max-h-96">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-mono sticky top-0">
                    <tr>
                      <th className="p-3">Timestamp</th>
                      <th className="p-3">Actor</th>
                      <th className="p-3">Action</th>
                      <th className="p-3">Target Entity</th>
                      <th className="p-3">Metadata</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 font-mono text-[11px]">
                    {allAuditLogs.map(log => (
                      <tr key={log.id} className="hover:bg-slate-900/50">
                        <td className="p-3 text-slate-400">
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                        <td className="p-3 text-cyan-300">
                          {log.actor_user_id}
                        </td>
                        <td className="p-3 font-bold text-white">
                          {log.action}
                        </td>
                        <td className="p-3 text-slate-300">
                          {log.entity_type} {log.entity_id ? `(${log.entity_id})` : ''}
                        </td>
                        <td className="p-3 text-slate-400 truncate max-w-xs">
                          {JSON.stringify(log.metadata || {})}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
