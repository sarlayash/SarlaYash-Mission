import React, { useState, useMemo } from 'react';
import { 
  Mail, 
  Send, 
  Users, 
  User as UserIcon, 
  MessageSquare, 
  CheckCircle2, 
  AlertTriangle, 
  Copy, 
  ExternalLink, 
  Eye, 
  Sparkles, 
  Smartphone, 
  Laptop, 
  Clock, 
  Check, 
  RefreshCw,
  Search,
  Filter,
  FileText,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react';
import { 
  User, 
  CommunicationRecord, 
  MessageAudienceType, 
  MessageChannelType 
} from '../../types';
import { storage } from '../../lib/storage';
import { syncCommunicationToFirestore } from '../../lib/firebase';

interface AdminCommunicationsProps {
  currentUser: User;
  allUsers: User[];
  preselectedLearnerId?: string;
  preselectedLearnerIds?: string[];
  onClearPreselected?: () => void;
  onRefreshData?: () => void;
}

interface TemplateOption {
  id: string;
  label: string;
  subject: string;
  body: string;
  smsText: string;
  channel: MessageChannelType;
  recommendedAudience: MessageAudienceType;
}

const TEMPLATES: TemplateOption[] = [
  {
    id: 'verify_email',
    label: 'Email Verification Alert (Mandatory)',
    subject: '[SarlaYash Mission] Action Required: Verify your Google Email Address',
    body: `Hello {name},\n\nThis is Instructor Kapil from Zero-To-Infinity (SarlaYash Mission).\n\nWe noticed your Google account email ({email}) is currently pending verification. According to our operational and credentialing policy, all student deliverables and completion certificates require a verified Google identity.\n\nPlease log in to your Learner Dashboard and click the "Verify Email" button to complete this quick step.\n\nDirect Dashboard Link: https://ais-dev-sv6v5ia256obtp543lgfav-252756721792.asia-east1.run.app/dashboard\n\nBest regards,\nKapil Narula\nFounder & Instructor, SarlaYash Mission\nkapilnarula27july@gmail.com`,
    smsText: `Zero-To-Infinity: Hi {name}, please verify your Google email in your learner dashboard to unlock completion certificates. - Instructor Kapil`,
    channel: 'both',
    recommendedAudience: 'group'
  },
  {
    id: 'welcome_briefing',
    label: 'Welcome & 30-Day Mission Kickoff',
    subject: '[SarlaYash Mission] Welcome to Zero-To-Infinity: 30-Day AI Mission',
    body: `Welcome {name} to the Zero-To-Infinity 30-Day Learning Mission!\n\nOur philosophy is strict: 10% Theory, 90% Hands-On Building. Each day brings an industry-grade challenge where you will build working LLM pipelines, autonomous agents, or production architectures.\n\nMission Guidelines:\n1. Complete daily practical tasks and submit deliverables in the Assignment Center.\n2. Maintain your daily streak ({streak} days active).\n3. Every assignment is personally reviewed by Kapil before official competency badges and certificates are unlocked.\n\nLet's build the future together.\n\nWarm regards,\nKapil Narula\nSarlaYash Mission · kapilnarula27july@gmail.com`,
    smsText: `Welcome to Zero-To-Infinity, {name}! 10% theory, 90% building. Start Day 1 mission deliverables in your dashboard now. - Kapil`,
    channel: 'both',
    recommendedAudience: 'all'
  },
  {
    id: 'assignment_reminder',
    label: 'Mission Assignment Deliverable Reminder',
    subject: '[Zero-To-Infinity] Assignment Deliverable Review & Deadline Notice',
    body: `Hi {name},\n\nThis is a friendly checkpoint regarding your 30-Day AI Mission progress.\n\nRemember to submit your code, structured prompts, or test outputs for your active track deliverables. All submissions are reviewed with constructive feedback and scores.\n\nAccess your submission portal:\nhttps://ais-dev-sv6v5ia256obtp543lgfav-252756721792.asia-east1.run.app/assignments\n\nKeep pushing forward!\nKapil Narula`,
    smsText: `Hi {name}, checkpoint reminder for your Zero-To-Infinity assignment. Submit your deliverable for review: /assignments - Kapil`,
    channel: 'both',
    recommendedAudience: 'group'
  },
  {
    id: 'live_workshop',
    label: 'Live Hands-On Agent Workshop Invitation',
    subject: '[Special Event] Live Agentic AI Coding Lab with Kapil Narula',
    body: `Dear {name},\n\nI am hosting a live, interactive hands-on coding lab this weekend for all active Zero-To-Infinity learners!\n\nAgenda:\n- Multi-Agent Orchestration with Tool Calling\n- Real-world deployment architectures\n- Live code review and Q&A\n\nEnsure your assignments are up to date so you can follow along directly.\n\nLooking forward to seeing you there!\n\nKapil Narula\nSarlaYash Mission`,
    smsText: `Zero-To-Infinity: Live Hands-On Agent Workshop with Kapil this weekend! Check your learner inbox for schedule details.`,
    channel: 'both',
    recommendedAudience: 'all'
  },
  {
    id: 'individual_feedback',
    label: 'Personal Direct Feedback & Encouragement',
    subject: '[Feedback] Review of your recent mission deliverable from Kapil',
    body: `Hi {name},\n\nI just reviewed your recent work and wanted to personally commend your dedication to the hands-on building curriculum.\n\nYour code and structured thinking show great progress. Keep testing edge cases and pushing the boundaries of what you build.\n\nIf you have any questions or blockers, feel free to reply directly to this email.\n\nKeep up the great work!\nKapil Narula\nkapilnarula27july@gmail.com`,
    smsText: `Hi {name}, great work on your recent mission deliverable! Keep up the momentum. - Instructor Kapil`,
    channel: 'email',
    recommendedAudience: 'individual'
  }
];

export const AdminCommunications: React.FC<AdminCommunicationsProps> = ({
  currentUser,
  allUsers,
  preselectedLearnerId,
  preselectedLearnerIds,
  onClearPreselected,
  onRefreshData
}) => {
  const learners = useMemo(() => allUsers.filter(u => u.role !== 'admin'), [allUsers]);

  // Audience & Mode State
  const [audienceType, setAudienceType] = useState<MessageAudienceType>(
    preselectedLearnerId ? 'individual' : (preselectedLearnerIds && preselectedLearnerIds.length > 0 ? 'group' : 'all')
  );
  
  // Individual selection
  const [selectedLearnerId, setSelectedLearnerId] = useState<string>(
    preselectedLearnerId || (learners[0]?.id || '')
  );

  // Group selection criteria
  const [groupCohort, setGroupCohort] = useState<string>('verified_email');
  const [customSelectedIds, setCustomSelectedIds] = useState<string[]>(
    preselectedLearnerIds || []
  );

  // Channel & Content
  const [channel, setChannel] = useState<MessageChannelType>('both');
  const [subject, setSubject] = useState<string>('[SarlaYash Mission] Briefing from Instructor Kapil');
  const [body, setBody] = useState<string>('Hello {name},\n\nHere is an important briefing regarding your 30-Day AI learning mission...');
  const [smsText, setSmsText] = useState<string>('Zero-To-Infinity: Hi {name}, here is a quick mission briefing from Kapil.');

  // UI state
  const [isSending, setIsSending] = useState(false);
  const [sentSuccessToast, setSentSuccessToast] = useState<string | null>(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [historyFilter, setHistoryFilter] = useState<'all' | 'individual' | 'group' | 'broadcast'>('all');
  const [learnerSearchText, setLearnerSearchText] = useState('');
  const [copiedEmailsNotice, setCopiedEmailsNotice] = useState(false);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<CommunicationRecord | null>(null);

  // Compute targeted recipients based on audienceType & filters
  const targetRecipients = useMemo<User[]>(() => {
    if (audienceType === 'individual') {
      const target = learners.find(u => u.id === selectedLearnerId);
      return target ? [target] : [];
    }

    if (audienceType === 'all') {
      return learners;
    }

    if (audienceType === 'group') {
      if (groupCohort === 'custom') {
        return learners.filter(u => customSelectedIds.includes(u.id));
      }
      if (groupCohort === 'verified_email') {
        return learners.filter(u => u.email_verified);
      }
      if (groupCohort === 'pending_email') {
        return learners.filter(u => !u.email_verified);
      }
      if (groupCohort === 'genai') {
        const enrollments = storage.getEnrollments();
        const genAiUserIds = enrollments.filter(e => e.track_id === 'track-genai').map(e => e.user_id);
        return learners.filter(u => genAiUserIds.includes(u.id));
      }
      if (groupCohort === 'agentic') {
        const enrollments = storage.getEnrollments();
        const agenticUserIds = enrollments.filter(e => e.track_id === 'track-agentic').map(e => e.user_id);
        return learners.filter(u => agenticUserIds.includes(u.id));
      }
      if (groupCohort === 'mobile_learners') {
        return learners.filter(u => 
          u.device_info?.device_type === 'Mobile' || 
          u.device_info?.device_type === 'Tablet' ||
          (u.last_device && (u.last_device.includes('Mobile') || u.last_device.includes('iPhone') || u.last_device.includes('Android')))
        );
      }
      if (groupCohort === 'desktop_learners') {
        return learners.filter(u => {
          const isMobile = u.device_info?.device_type === 'Mobile' || 
                           u.device_info?.device_type === 'Tablet' ||
                           (u.last_device && (u.last_device.includes('Mobile') || u.last_device.includes('iPhone') || u.last_device.includes('Android')));
          return !isMobile;
        });
      }
      if (groupCohort === 'has_submissions') {
        const submissions = storage.getSubmissions();
        const submittedUserIds = Array.from(new Set(submissions.map(s => s.user_id)));
        return learners.filter(u => submittedUserIds.includes(u.id));
      }
      if (groupCohort === 'needs_revision') {
        const submissions = storage.getSubmissions();
        const revUserIds = Array.from(new Set(submissions.filter(s => s.status === 'needs_revision').map(s => s.user_id)));
        return learners.filter(u => revUserIds.includes(u.id));
      }
    }

    return learners;
  }, [audienceType, selectedLearnerId, groupCohort, customSelectedIds, learners]);

  // Load a template
  const handleLoadTemplate = (tpl: TemplateOption) => {
    setSubject(tpl.subject);
    setBody(tpl.body);
    setSmsText(tpl.smsText);
    setChannel(tpl.channel);
    if (tpl.recommendedAudience === 'individual' && audienceType === 'all') {
      setAudienceType('individual');
    }
  };

  // Insert template variable into body
  const insertVariable = (varName: string) => {
    setBody(prev => prev + ` {${varName}}`);
  };

  // Copy emails to clipboard
  const handleCopyEmails = () => {
    const emails = targetRecipients.map(u => u.email).filter(Boolean);
    if (emails.length === 0) return;
    navigator.clipboard.writeText(emails.join(', '));
    setCopiedEmailsNotice(true);
    setTimeout(() => setCopiedEmailsNotice(false), 3000);
  };

  // Open native email client (mailto:)
  const handleOpenEmailClient = () => {
    const emails = targetRecipients.map(u => u.email).filter(Boolean);
    if (emails.length === 0) return;

    const firstRecipient = emails[0];
    const bccList = emails.slice(1).join(',');

    // Sample substitution for preview
    const sampleLearner = targetRecipients[0];
    const interpolatedBody = body
      .replace(/{name}/g, sampleLearner?.display_name || 'Learner')
      .replace(/{email}/g, sampleLearner?.email || 'email@example.com')
      .replace(/{streak}/g, '1')
      .replace(/{day}/g, '1');

    const mailtoUrl = `mailto:${firstRecipient}?${bccList ? `bcc=${encodeURIComponent(bccList)}&` : ''}subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(interpolatedBody)}`;
    window.open(mailtoUrl, '_blank');
  };

  // Open WhatsApp Web
  const handleOpenWhatsApp = () => {
    const sampleLearner = targetRecipients[0];
    const interpolatedText = smsText
      .replace(/{name}/g, sampleLearner?.display_name || 'Learner')
      .replace(/{email}/g, sampleLearner?.email || '')
      .replace(/{streak}/g, '1');

    const waUrl = `https://wa.me/?text=${encodeURIComponent(interpolatedText)}`;
    window.open(waUrl, '_blank');
  };

  // Send communication: saves to storage + syncs to Firestore + dispatches in-app notifications
  const handleSendCommunication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !body.trim()) {
      alert('Please provide both subject and message body.');
      return;
    }
    if (targetRecipients.length === 0) {
      alert('No learners found for the selected audience.');
      return;
    }

    setIsSending(true);

    try {
      const recipientIds = targetRecipients.map(u => u.id);
      const recipientEmails = targetRecipients.map(u => u.email);
      const recipientNames = targetRecipients.map(u => u.display_name);

      let groupLabel = '';
      if (audienceType === 'all') groupLabel = 'All Learners (Broadcast)';
      else if (audienceType === 'individual') groupLabel = `Individual (${recipientNames[0] || 'Learner'})`;
      else {
        if (groupCohort === 'verified_email') groupLabel = 'Verified Google ID Cohort';
        else if (groupCohort === 'pending_email') groupLabel = 'Pending Email Verification Cohort';
        else if (groupCohort === 'genai') groupLabel = 'Generative AI Track Cohort';
        else if (groupCohort === 'agentic') groupLabel = 'Agentic AI Track Cohort';
        else if (groupCohort === 'mobile_learners') groupLabel = 'Mobile Phone Learners Cohort';
        else if (groupCohort === 'desktop_learners') groupLabel = 'Desktop/Laptop Learners Cohort';
        else if (groupCohort === 'has_submissions') groupLabel = 'Active Submissions Cohort';
        else if (groupCohort === 'needs_revision') groupLabel = 'Needs Revision Cohort';
        else groupLabel = `Custom Group (${recipientIds.length} Learners)`;
      }

      const newComm: CommunicationRecord = {
        id: `comm-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        subject: subject.trim(),
        body: body.trim(),
        sms_text: channel !== 'email' ? smsText.trim() : undefined,
        channel,
        audience_type: audienceType,
        recipient_ids: recipientIds,
        recipient_emails: recipientEmails,
        recipient_names: recipientNames,
        group_label: groupLabel,
        sender_id: currentUser.id,
        sender_name: 'Instructor Kapil Narula',
        sender_email: 'kapilnarula27july@gmail.com',
        status: 'delivered',
        created_at: new Date().toISOString()
      };

      // 1. Dispatch locally and generate in-app notifications
      storage.dispatchCommunication(newComm);

      // 2. Sync to Firestore in background
      await syncCommunicationToFirestore(newComm);

      // 3. UI feedback
      const count = targetRecipients.length;
      setSentSuccessToast(
        `Communication successfully dispatched to ${count} ${count === 1 ? 'learner' : 'learners'} via ${channel === 'both' ? 'Email & Text & In-App' : channel === 'email' ? 'Email & In-App' : 'Text & In-App'}!`
      );
      setTimeout(() => setSentSuccessToast(null), 6000);

      // Clear preselection if any
      if (onClearPreselected) onClearPreselected();
      if (onRefreshData) onRefreshData();

    } catch (err: any) {
      console.error('Error dispatching communication:', err);
      alert(`Error sending communication: ${err.message || 'Unknown error'}`);
    } finally {
      setIsSending(false);
    }
  };

  // Communications history
  const allHistory = storage.getCommunications();
  const filteredHistory = useMemo(() => {
    if (historyFilter === 'all') return allHistory;
    return allHistory.filter(h => h.audience_type === historyFilter);
  }, [allHistory, historyFilter]);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="bg-slate-900/90 p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg sm:text-xl font-display font-bold text-white">
                Admin Communications & Messaging Center
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-950 border border-cyan-700 text-cyan-300">
                Email · Text · Real-time
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Dispatch personalized emails, SMS/WhatsApp texts, and in-app mission directives to individual learners, targeted cohort groups, or all registered students simultaneously.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyEmails}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-mono flex items-center gap-1.5 transition-colors"
            title="Copy comma-separated list of target emails"
          >
            {copiedEmailsNotice ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Emails ({targetRecipients.length})</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setPreviewModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-white text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            Preview Email
          </button>
        </div>
      </div>

      {/* Success Alert Banner */}
      {sentSuccessToast && (
        <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-700/80 text-emerald-200 text-xs flex items-center justify-between shadow-lg shadow-emerald-950/40 animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="font-semibold">{sentSuccessToast}</span>
          </div>
          <button
            onClick={() => setSentSuccessToast(null)}
            className="text-emerald-400 hover:text-white text-xs font-bold px-2 py-0.5"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Composer Form */}
      <form onSubmit={handleSendCommunication} className="space-y-6">
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT PANEL: Audience Targeting & Templates */}
          <div className="space-y-6">
            
            {/* 1. Target Audience Switcher */}
            <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-4">
              <label className="text-xs font-mono uppercase tracking-wider text-slate-400 block font-bold">
                1. Select Target Audience
              </label>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setAudienceType('individual')}
                  className={`p-3 rounded-xl text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
                    audienceType === 'individual'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-850'
                  }`}
                >
                  <UserIcon className="w-4 h-4" />
                  <span>Individual</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAudienceType('group')}
                  className={`p-3 rounded-xl text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
                    audienceType === 'group'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-850'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Group / Cohort</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAudienceType('all')}
                  className={`p-3 rounded-xl text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
                    audienceType === 'all'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-850'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>All Learners</span>
                </button>
              </div>

              {/* INDIVIDUAL LEARNER SELECTOR */}
              {audienceType === 'individual' && (
                <div className="space-y-2 pt-2 animate-in fade-in duration-150">
                  <span className="text-[11px] font-mono text-slate-400 block">Choose Individual Learner:</span>
                  <select
                    value={selectedLearnerId}
                    onChange={(e) => setSelectedLearnerId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    {learners.map(u => (
                      <option key={u.id} value={u.id}>
                        {u.display_name} ({u.email}) {u.email_verified ? '✓ Verified' : '⚠ Unverified'}
                      </option>
                    ))}
                  </select>

                  {/* Selected Learner Snapshot card */}
                  {(() => {
                    const sel = learners.find(u => u.id === selectedLearnerId);
                    if (!sel) return null;
                    return (
                      <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-1 mt-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white">{sel.display_name}</span>
                          {sel.email_verified ? (
                            <span className="text-[10px] text-emerald-400 font-mono">✓ Verified</span>
                          ) : (
                            <span className="text-[10px] text-amber-400 font-mono">⚠ Unverified</span>
                          )}
                        </div>
                        <p className="text-slate-400 font-mono text-[11px]">{sel.email}</p>
                        <p className="text-slate-500 text-[10px]">
                          Device: {sel.device_info?.summary || sel.last_device || 'Web Client'}
                        </p>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* GROUP / COHORT SELECTOR */}
              {audienceType === 'group' && (
                <div className="space-y-2.5 pt-2 animate-in fade-in duration-150">
                  <span className="text-[11px] font-mono text-slate-400 block">Select Cohort Preset:</span>
                  
                  <div className="space-y-1.5">
                    {[
                      { id: 'verified_email', label: 'Verified Google ID Learners', count: learners.filter(u => u.email_verified).length },
                      { id: 'pending_email', label: 'Pending Email Verification', count: learners.filter(u => !u.email_verified).length },
                      { id: 'genai', label: 'Generative AI Track Enrollees', count: storage.getEnrollments().filter(e => e.track_id === 'track-genai').length },
                      { id: 'agentic', label: 'Agentic AI Track Enrollees', count: storage.getEnrollments().filter(e => e.track_id === 'track-agentic').length },
                      { id: 'mobile_learners', label: 'Mobile Device Sessions', count: learners.filter(u => u.device_info?.device_type === 'Mobile' || (u.last_device && u.last_device.includes('Mobile'))).length },
                      { id: 'desktop_learners', label: 'Laptop & Desktop Sessions', count: learners.filter(u => !(u.device_info?.device_type === 'Mobile' || (u.last_device && u.last_device.includes('Mobile')))).length },
                      { id: 'has_submissions', label: 'Learners with Submissions', count: Array.from(new Set(storage.getSubmissions().map(s => s.user_id))).length },
                      { id: 'needs_revision', label: 'Learners Needing Revision', count: Array.from(new Set(storage.getSubmissions().filter(s => s.status === 'needs_revision').map(s => s.user_id))).length },
                      { id: 'custom', label: 'Custom Checked List (Picker)', count: customSelectedIds.length },
                    ].map(cohort => (
                      <button
                        key={cohort.id}
                        type="button"
                        onClick={() => setGroupCohort(cohort.id)}
                        className={`w-full px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-all text-left ${
                          groupCohort === cohort.id
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                            : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-850'
                        }`}
                      >
                        <span className="truncate pr-2">{cohort.label}</span>
                        <span className="px-1.5 py-0.5 rounded bg-slate-900 text-[10px] font-mono shrink-0">
                          {cohort.count}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Custom Picker Checklist if 'custom' is selected */}
                  {groupCohort === 'custom' && (
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2 max-h-48 overflow-y-auto">
                      <div className="flex items-center justify-between pb-1.5 border-b border-slate-850">
                        <span className="text-[10px] font-mono text-slate-400">Select Learners:</span>
                        <button
                          type="button"
                          onClick={() => {
                            if (customSelectedIds.length === learners.length) setCustomSelectedIds([]);
                            else setCustomSelectedIds(learners.map(u => u.id));
                          }}
                          className="text-[10px] text-cyan-400 hover:underline"
                        >
                          {customSelectedIds.length === learners.length ? 'Deselect All' : 'Select All'}
                        </button>
                      </div>
                      {learners.map(l => (
                        <label key={l.id} className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer hover:text-white">
                          <input
                            type="checkbox"
                            checked={customSelectedIds.includes(l.id)}
                            onChange={(e) => {
                              if (e.target.checked) setCustomSelectedIds(prev => [...prev, l.id]);
                              else setCustomSelectedIds(prev => prev.filter(id => id !== l.id));
                            }}
                            className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0"
                          />
                          <span className="truncate">{l.display_name}</span>
                          <span className="text-[10px] text-slate-500 font-mono ml-auto">
                            {l.email.split('@')[0]}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ALL LEARNERS INFO */}
              {audienceType === 'all' && (
                <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-700/40 text-xs text-cyan-200 space-y-1">
                  <p className="font-bold flex items-center gap-1.5 text-cyan-300">
                    <Sparkles className="w-3.5 h-3.5" />
                    Broadcasting to all {learners.length} registered learners
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Message will be sent across mobile and desktop devices with real-time Firebase sync.
                  </p>
                </div>
              )}

              {/* Recipient Count Indicator */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-mono">Target Recipient Count:</span>
                <span className="font-mono font-bold text-cyan-400 px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30">
                  {targetRecipients.length} {targetRecipients.length === 1 ? 'Learner' : 'Learners'}
                </span>
              </div>
            </div>

            {/* 2. Quick Templates */}
            <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-3">
              <label className="text-xs font-mono uppercase tracking-wider text-slate-400 block font-bold">
                Quick Template Library
              </label>
              <div className="space-y-1.5">
                {TEMPLATES.map(tpl => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => handleLoadTemplate(tpl)}
                    className="w-full text-left p-2.5 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-850 hover:border-slate-700 transition-all text-xs group"
                  >
                    <span className="font-semibold text-slate-200 group-hover:text-cyan-400 block truncate">
                      {tpl.label}
                    </span>
                    <span className="text-[10px] text-slate-500 block truncate mt-0.5">
                      {tpl.subject}
                    </span>
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT 2 COLUMNS: Channel, Message Composer, Preview */}
          <div className="lg:col-span-2 space-y-6">
            
            <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 space-y-5">
              
              {/* Channel Selector */}
              <div>
                <label className="text-xs font-mono uppercase tracking-wider text-slate-400 block font-bold mb-2">
                  2. Choose Delivery Channel
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setChannel('email')}
                    className={`p-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                      channel === 'email'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    <Mail className="w-4 h-4" />
                    <span>Email & In-App</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setChannel('text')}
                    className={`p-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                      channel === 'text'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Text / SMS & In-App</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setChannel('both')}
                    className={`p-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                      channel === 'both'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Both (Email + SMS)</span>
                  </button>
                </div>
              </div>

              {/* Sender Details */}
              <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-850 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">From:</span>
                  <span className="text-white font-bold">Kapil Narula</span>
                  <span className="text-cyan-400">kapilnarula27july@gmail.com</span>
                </div>
                <span className="text-[10px] text-slate-400 uppercase">SarlaYash Mission</span>
              </div>

              {/* Subject Line */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-mono text-slate-300 font-semibold">
                    Email Subject / Message Heading
                  </label>
                  <div className="flex items-center gap-1 text-[10px]">
                    <span className="text-slate-500">Quick Tags:</span>
                    {['[SarlaYash Mission]', '[Action Required]', '[Feedback]'].map(tag => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setSubject(prev => prev.startsWith(tag) ? prev : `${tag} ${prev}`)}
                        className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-cyan-300"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Enter message subject..."
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-medium"
                />
              </div>

              {/* Variable Insertion Pills */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-mono text-slate-400">Insert Dynamic Learner Tags:</span>
                  <span className="text-[10px] text-slate-500">Auto-replaced per recipient</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { tag: 'name', label: '{name} (Learner Name)' },
                    { tag: 'email', label: '{email} (Learner Email)' },
                    { tag: 'streak', label: '{streak} (Active Streak)' },
                    { tag: 'day', label: '{day} (Day #)' },
                  ].map(v => (
                    <button
                      key={v.tag}
                      type="button"
                      onClick={() => insertVariable(v.tag)}
                      className="px-2 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-cyan-400 border border-slate-800 text-[11px] font-mono transition-colors"
                    >
                      + {v.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Main Email / Long Body */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-mono text-slate-300 font-semibold">
                    Email & Full Directive Content
                  </label>
                  <span className="text-[11px] font-mono text-slate-500">
                    {body.length} characters · {body.split(/\s+/).filter(Boolean).length} words
                  </span>
                </div>
                <textarea
                  rows={8}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Compose your message body..."
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-white focus:outline-none focus:border-cyan-500 leading-relaxed font-sans"
                />
              </div>

              {/* Text / SMS Message Field (If text or both enabled) */}
              {(channel === 'text' || channel === 'both') && (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono text-cyan-400 font-semibold flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5" />
                      SMS & WhatsApp Short Message Format
                    </label>
                    <span className="text-[11px] font-mono text-slate-400">
                      {smsText.length}/160 chars ({Math.ceil(smsText.length / 160) || 1} SMS segments)
                    </span>
                  </div>
                  <textarea
                    rows={2}
                    value={smsText}
                    onChange={(e) => setSmsText(e.target.value)}
                    placeholder="Short SMS/WhatsApp alert message..."
                    className="w-full bg-slate-900 border border-slate-700/70 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                  <div className="flex items-center justify-end">
                    <button
                      type="button"
                      onClick={handleOpenWhatsApp}
                      className="px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-700/80 text-emerald-300 hover:text-white text-[11px] font-mono flex items-center gap-1 transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Test in WhatsApp Web
                    </button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleOpenEmailClient}
                    className="px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-850 text-slate-300 hover:text-white text-xs font-mono flex items-center gap-1.5 border border-slate-800 transition-colors"
                    title="Open your device default email app (Gmail, Apple Mail, Outlook)"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Open Native Email Client (mailto:)
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={isSending || targetRecipients.length === 0}
                    className="px-6 py-2.5 rounded-xl font-bold text-xs bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-all shadow-lg shadow-cyan-500/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isSending ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Dispatching...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Dispatch to {targetRecipients.length} {targetRecipients.length === 1 ? 'Learner' : 'Learners'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

            </div>

          </div>

        </div>

      </form>

      {/* Dispatched Communications Log History */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl space-y-4 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="font-display font-bold text-base text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              Dispatched Communications & Delivery Log
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Historical record of all emails, text messages, and broadcasts sent by the administrator.
            </p>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            {[
              { id: 'all', label: `All (${allHistory.length})` },
              { id: 'individual', label: 'Individual' },
              { id: 'group', label: 'Group' },
              { id: 'all', label: 'Broadcast' },
            ].map(f => (
              <button
                key={f.id + f.label}
                type="button"
                onClick={() => setHistoryFilter(f.id as any)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  historyFilter === f.id
                    ? 'bg-slate-800 text-cyan-300 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* History Table */}
        <div className="overflow-x-auto border border-slate-800 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-mono">
              <tr>
                <th className="p-3.5">Dispatched At</th>
                <th className="p-3.5">Audience & Target</th>
                <th className="p-3.5">Channel</th>
                <th className="p-3.5">Subject & Preview</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    <Mail className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                    <p className="text-xs">No dispatched communications recorded yet. Messages sent above will appear here.</p>
                  </td>
                </tr>
              ) : (
                filteredHistory.map(comm => (
                  <tr key={comm.id} className="hover:bg-slate-900/60 transition-colors">
                    
                    {/* Timestamp */}
                    <td className="p-3.5 font-mono text-slate-300 whitespace-nowrap">
                      <span className="block font-bold">
                        {new Date(comm.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(comm.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>

                    {/* Audience */}
                    <td className="p-3.5">
                      <div className="space-y-1">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          comm.audience_type === 'individual'
                            ? 'bg-blue-950 text-blue-300 border border-blue-800'
                            : comm.audience_type === 'group'
                            ? 'bg-purple-950 text-purple-300 border border-purple-800'
                            : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                        }`}>
                          {comm.audience_type.toUpperCase()}
                        </span>
                        <p className="text-xs text-white font-medium truncate max-w-[200px]">
                          {comm.group_label || `${comm.recipient_ids.length} Recipients`}
                        </p>
                      </div>
                    </td>

                    {/* Channel */}
                    <td className="p-3.5 font-mono">
                      <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[11px] text-slate-300">
                        {comm.channel === 'both' ? 'Email + SMS' : comm.channel === 'email' ? 'Email' : 'SMS/Text'}
                      </span>
                    </td>

                    {/* Subject & Preview */}
                    <td className="p-3.5 max-w-xs">
                      <p className="font-bold text-slate-200 truncate">{comm.subject}</p>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">{comm.body}</p>
                    </td>

                    {/* Status */}
                    <td className="p-3.5">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-[10px] font-mono font-bold">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        Delivered
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-3.5 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setSelectedHistoryItem(comm)}
                        className="text-cyan-400 hover:text-cyan-300 text-xs font-semibold mr-3"
                      >
                        Inspect
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSubject(comm.subject);
                          setBody(comm.body);
                          if (comm.sms_text) setSmsText(comm.sms_text);
                          setChannel(comm.channel);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="text-slate-400 hover:text-white text-xs font-mono"
                      >
                        Reuse
                      </button>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Email HTML Preview */}
      {previewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-white text-base">Learner Email Live Preview</h3>
              </div>
              <button
                onClick={() => setPreviewModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            {/* Email Card rendering */}
            <div className="bg-white text-slate-900 rounded-2xl p-6 sm:p-8 shadow-inner space-y-6 font-sans">
              
              {/* Brand Header */}
              <div className="border-b border-slate-200 pb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-900 font-display">
                    ZERO-TO-INFINITY
                  </h2>
                  <p className="text-xs text-slate-500">
                    SarlaYash Mission · Generative AI & Autonomous Agent Architecture
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded bg-cyan-100 text-cyan-800 text-[10px] font-mono font-bold">
                  OFFICIAL DISPATCH
                </span>
              </div>

              {/* Subject */}
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 block">Subject</span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  {subject}
                </h3>
              </div>

              {/* Interpolated Body */}
              <div className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                {body
                  .replace(/{name}/g, targetRecipients[0]?.display_name || 'Alex Chen')
                  .replace(/{email}/g, targetRecipients[0]?.email || 'learner@gmail.com')
                  .replace(/{streak}/g, '3')
                  .replace(/{day}/g, '4')}
              </div>

              {/* Action Link Mock */}
              <div className="py-2">
                <div className="inline-block px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs">
                  Access Zero-To-Infinity Mission Hub →
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-slate-200 pt-4 text-xs text-slate-500 space-y-1">
                <p className="font-semibold text-slate-700">
                  Kapil Narula · Founder & Instructor
                </p>
                <p>Zero-To-Infinity Learning Mission by SarlaYash Mission</p>
                <p className="text-[11px] text-slate-400">
                  Sent to {targetRecipients[0]?.email || 'your registered Google ID'} · Verification & Security Mandate
                </p>
              </div>

            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPreviewModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Close Preview
              </button>
              <button
                type="button"
                onClick={() => {
                  setPreviewModalOpen(false);
                  handleOpenEmailClient();
                }}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Launch in Email Client
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 2: Inspect History Item */}
      {selectedHistoryItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wide">Communication Record</span>
                <h4 className="font-bold text-white text-base mt-0.5">{selectedHistoryItem.subject}</h4>
              </div>
              <button
                onClick={() => setSelectedHistoryItem(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 block font-mono">Dispatched At</span>
                <span className="text-white font-semibold mt-0.5 block">
                  {new Date(selectedHistoryItem.created_at).toLocaleString()}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 block font-mono">Audience Type</span>
                <span className="text-white font-semibold mt-0.5 block uppercase font-mono">
                  {selectedHistoryItem.audience_type} ({selectedHistoryItem.recipient_ids.length} recipients)
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Message Body</span>
              <p className="text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
                {selectedHistoryItem.body}
              </p>
            </div>

            {selectedHistoryItem.sms_text && (
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono text-cyan-400 uppercase">SMS/WhatsApp Short Text</span>
                <p className="text-xs font-mono text-slate-300">
                  {selectedHistoryItem.sms_text}
                </p>
              </div>
            )}

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-[10px] font-mono text-slate-400 uppercase">
                Recipients ({selectedHistoryItem.recipient_emails.length})
              </span>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {selectedHistoryItem.recipient_emails.map((email, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs font-mono text-slate-400">
                    <span>{selectedHistoryItem.recipient_names[idx] || 'Learner'}</span>
                    <span className="text-cyan-400">{email}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedHistoryItem(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
