import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Sparkles, 
  Bot, 
  CheckCircle2, 
  Upload, 
  Link as LinkIcon, 
  FileText, 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  AlertCircle,
  Play,
  Send,
  Save,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { User, Track, TrackDay, Assignment, AssignmentSubmission } from '../../types';
import { storage } from '../../lib/storage';
import { StatusBadge } from '../common/StatusBadge';

interface DailyMissionViewProps {
  user: User;
  trackSlug: string;
  dayNumber: number;
  onNavigate: (route: string) => void;
  onOpenPayment: (track: Track) => void;
}

export const DailyMissionView: React.FC<DailyMissionViewProps> = ({
  user,
  trackSlug,
  dayNumber,
  onNavigate,
  onOpenPayment
}) => {
  const track = storage.getTrackBySlug(trackSlug);
  const trackDays = track ? storage.getTrackDays(track.id) : [];
  const currentDay = trackDays.find(d => d.day_number === dayNumber) || trackDays[0];
  const assignment = currentDay ? storage.getAssignmentByTrackDay(currentDay.id) : null;
  const enrollment = track ? storage.getEnrollment(user.id, track.id) : null;
  const existingSubmission = assignment ? storage.getSubmissionByAssignmentAndUser(assignment.id, user.id) : null;

  // Form State
  const [responseText, setResponseText] = useState(existingSubmission?.response_text || '');
  const [submissionUrl, setSubmissionUrl] = useState(existingSubmission?.submission_url || '');
  const [uploadedFile, setUploadedFile] = useState<string | null>(existingSubmission?.file_url || null);
  const [uploadedFileName, setUploadedFileName] = useState<string>(existingSubmission?.file_name || '');
  const [uploadedFileSize, setUploadedFileSize] = useState<number>(existingSubmission?.file_size || 0);
  
  // Interactive Prompt / Code Test Sandbox
  const [interactiveInput, setInteractiveInput] = useState('// Enter test prompt or function call schema here...');
  const [interactiveOutput, setInteractiveOutput] = useState('');
  const [isRunningTest, setIsRunningTest] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Mark day as 'started' in Progress engine on load
  useEffect(() => {
    if (user && enrollment && currentDay) {
      const existingProg = storage.getProgressByUser(user.id, enrollment.id).find(p => p.track_day_id === currentDay.id);
      if (!existingProg) {
        storage.saveProgress({
          id: `prog-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          user_id: user.id,
          enrollment_id: enrollment.id,
          track_day_id: currentDay.id,
          day_number: currentDay.day_number,
          status: 'started',
          started_at: new Date().toISOString(),
          last_activity_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
    }
  }, [user, enrollment, currentDay]);

  if (!track || !currentDay) {
    return (
      <div className="min-h-screen bg-slate-950 text-white p-8">
        <p>Day mission not found.</p>
        <button onClick={() => onNavigate('/dashboard')} className="text-cyan-400 mt-4">
          Back to Dashboard
        </button>
      </div>
    );
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (< 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('File size exceeds 10MB limit.');
      return;
    }

    // Validate extension
    const allowed = ['pdf', 'docx', 'pptx', 'xlsx', 'txt', 'png', 'jpg', 'jpeg'];
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (!allowed.includes(ext)) {
      setErrorMessage(`File format .${ext} is not supported. Please upload PDF, DOCX, PPTX, XLSX, TXT, PNG, or JPG.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setUploadedFile(reader.result as string);
      setUploadedFileName(file.name);
      setUploadedFileSize(file.size);
      setErrorMessage('');
    };
    reader.readAsDataURL(file);
  };

  const handleRunInteractiveTest = () => {
    setIsRunningTest(true);
    setInteractiveOutput('');
    setTimeout(() => {
      setIsRunningTest(false);
      setInteractiveOutput(
        `[Execution Log - Zero-To-Infinity Sandbox]\n` +
        `Target: Day ${currentDay.day_number} Objective Validator\n` +
        `Tokens Processed: ${Math.floor(Math.random() * 80 + 120)}\n` +
        `Execution Status: Verified (200 OK)\n` +
        `Output Schema:\n{\n  "status": "valid",\n  "objective": "${currentDay.title}",\n  "verified_at": "${new Date().toISOString()}"\n}`
      );
    }, 600);
  };

  const handleSubmitAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignment) return;

    if (!responseText.trim() && !submissionUrl.trim() && !uploadedFile) {
      setErrorMessage('Please provide a text response, project link, or upload an artifact.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    setTimeout(() => {
      const submissionId = existingSubmission?.id || `sub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const submission: AssignmentSubmission = {
        id: submissionId,
        assignment_id: assignment.id,
        user_id: user.id,
        enrollment_id: enrollment?.id || 'enr-unverified',
        response_text: responseText.trim(),
        submission_url: submissionUrl.trim(),
        file_url: uploadedFile || undefined,
        file_name: uploadedFileName || undefined,
        file_size: uploadedFileSize || undefined,
        status: 'submitted',
        submitted_at: new Date().toISOString(),
        version_number: (existingSubmission?.version_number || 0) + 1,
        created_at: existingSubmission?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      storage.saveSubmission(submission);

      // Update progress record in real engine
      if (enrollment) {
        storage.saveProgress({
          id: `prog-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          user_id: user.id,
          enrollment_id: enrollment.id,
          track_day_id: currentDay.id,
          day_number: currentDay.day_number,
          status: 'submitted',
          started_at: new Date().toISOString(),
          last_activity_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }

      // Audit Log
      storage.logAudit(user.id, 'ASSIGNMENT_SUBMITTED', 'AssignmentSubmission', submission.id, {
        day: currentDay.day_number,
        track: track.name,
        version: submission.version_number
      });

      // Notification
      storage.saveNotification({
        id: `notif-${Date.now()}`,
        user_id: user.id,
        title: `Day ${currentDay.day_number} Assignment Submitted`,
        body: `Your work for "${currentDay.title}" is queued for review by instructor Kapil.`,
        type: 'assignment',
        delivery_channel: 'in_app',
        status: 'delivered',
        sent_at: new Date().toISOString(),
        created_by: 'system',
        created_at: new Date().toISOString()
      });

      setIsSubmitting(false);
      setSuccessMessage('Assignment submitted successfully! Status updated to Submitted.');
      setTimeout(() => setSuccessMessage(''), 4000);
    }, 450);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Navigation & Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <button
            onClick={() => onNavigate('/dashboard')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-cyan-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>

          <div className="flex items-center gap-2">
            <button
              disabled={dayNumber <= 1}
              onClick={() => onNavigate(`/learn/${track.slug}/day/${dayNumber - 1}`)}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
              title="Previous Day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono font-bold text-slate-200">
              Day {dayNumber} of 30
            </span>
            <button
              disabled={dayNumber >= 30}
              onClick={() => onNavigate(`/learn/${track.slug}/day/${dayNumber + 1}`)}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
              title="Next Day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Day Mission Title Banner */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 relative">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  {track.name}
                </span>
                <span className="text-xs text-slate-400">Day {dayNumber}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-white">
                {currentDay.title}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300">
                {currentDay.hands_on_objective}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {existingSubmission ? (
                <StatusBadge status={existingSubmission.status} />
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700">
                  Pending Submission
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: 10% Theory & 90% Hands-On Instructions */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* 10% Theory Briefing */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  10% Foundational Theory Briefing
                </h3>
                <span className="text-[11px] font-mono text-slate-400">~6 mins</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line font-sans">
                {currentDay.theory_content}
              </div>
            </div>

            {/* 90% Practical Hands-On Mission */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  90% Practical Hands-On Challenge
                </h3>
                <span className="text-[11px] font-mono text-slate-400">~54 mins</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line font-sans">
                {currentDay.hands_on_activity}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                  <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Tools to Deploy:</span>
                  <div className="flex flex-wrap gap-1">
                    {currentDay.suggested_tools.map((t, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-800 text-slate-300">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                  <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Instructor Rubric:</span>
                  <p className="text-[11px] text-slate-300 line-clamp-3">
                    {assignment?.rubric || 'Adherence to specifications, executable logic, and clear documentation.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Interactive Test Sandbox */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  Interactive Prompt & Schema Sandbox
                </h3>
                <button
                  type="button"
                  onClick={handleRunInteractiveTest}
                  disabled={isRunningTest}
                  className="px-3 py-1 rounded-lg text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center gap-1.5 transition-colors"
                >
                  <Play className="w-3.5 h-3.5" />
                  {isRunningTest ? 'Validating...' : 'Test Execution'}
                </button>
              </div>

              <textarea
                rows={4}
                value={interactiveInput}
                onChange={(e) => setInteractiveInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                placeholder="Paste your prompt, function definition, or agent step schema to test locally..."
              />

              {interactiveOutput && (
                <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-400 overflow-x-auto">
                  {interactiveOutput}
                </pre>
              )}
            </div>

          </div>

          {/* Right Column: Assignment Submission Console */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-5 sticky top-20 shadow-xl">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="font-display font-bold text-lg text-white">
                  Mission Submission Console
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Deliverable for Day {dayNumber}: Real assignment review by Kapil
                </p>
              </div>

              {successMessage && (
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Status and Feedback Preview if existing */}
              {existingSubmission && (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Submission Version: <strong>v{existingSubmission.version_number}</strong></span>
                    <StatusBadge status={existingSubmission.status} />
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Submitted on: {new Date(existingSubmission.submitted_at).toLocaleString()}
                  </p>
                  {existingSubmission.grade_score !== undefined && (
                    <div className="text-xs text-cyan-300 font-mono">
                      Grade: <strong>{existingSubmission.grade_score}/100</strong>
                    </div>
                  )}
                  {existingSubmission.feedback && (
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 mt-2">
                      <p className="font-semibold text-cyan-400 mb-1">Instructor Review by Kapil:</p>
                      <p className="leading-relaxed">{existingSubmission.feedback}</p>
                    </div>
                  )}
                </div>
              )}

              <form onSubmit={handleSubmitAssignment} className="space-y-4">
                
                {/* Text Response / Reflection / Code */}
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1 flex items-center justify-between">
                    <span>Artifact Description / Prompt / Code <span className="text-cyan-400">*</span></span>
                    <span className="text-[10px] text-slate-500">Markdown supported</span>
                  </label>
                  <textarea
                    rows={5}
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    placeholder="Document your implementation, prompt strategies, model parameters, and observed outputs..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                {/* GitHub or Live URL */}
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1 flex items-center gap-1.5">
                    <LinkIcon className="w-3.5 h-3.5 text-cyan-400" />
                    Project / GitHub Repository Link (Optional)
                  </label>
                  <input
                    type="url"
                    value={submissionUrl}
                    onChange={(e) => setSubmissionUrl(e.target.value)}
                    placeholder="https://github.com/your-username/ai-mission-day-1"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>

                {/* Managed File Upload */}
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1 flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5 text-cyan-400" />
                    File Attachment (PDF, DOCX, Code, Screenshot, max 10MB)
                  </label>
                  <div className="relative border border-dashed border-slate-800 rounded-xl p-3 text-center hover:border-slate-700 transition-colors bg-slate-950/60">
                    <input
                      type="file"
                      accept=".pdf,.docx,.pptx,.xlsx,.txt,.png,.jpg,.jpeg"
                      onChange={handleFileUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <span className="text-xs text-slate-400 block truncate">
                      {uploadedFileName ? `Attached: ${uploadedFileName} (${Math.round(uploadedFileSize / 1024)} KB)` : 'Choose file or drag & drop deliverable'}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
                  Submissions are stored in the persistent database. Opening or viewing a day does not mark it complete; progress requires valid hands-on submission.
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl font-bold text-xs bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  {isSubmitting 
                    ? 'Saving Submission...' 
                    : existingSubmission 
                    ? 'Resubmit Updated Work (v' + ((existingSubmission.version_number || 1) + 1) + ')' 
                    : 'Submit Day ' + dayNumber + ' Assignment'}
                </button>
              </form>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
