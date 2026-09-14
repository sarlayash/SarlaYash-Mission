import {
  User,
  LearnerProfile,
  Track,
  TrackDay,
  Assignment,
  Enrollment,
  Payment,
  AssignmentSubmission,
  ProgressRecord,
  Badge,
  LearnerBadge,
  Certificate,
  NotificationItem,
  EmailLog,
  AuditLog,
  PlatformSettings,
  CommunicationRecord
} from '../types';
import { INITIAL_TRACKS, INITIAL_BADGES, generateTrackDays } from '../data/curriculumData';
import { DEMO_CERTIFICATES, DEMO_LEARNER_BADGES } from '../data/demoCredentials';

const STORAGE_KEYS = {
  USERS: 'zti_users',
  PROFILES: 'zti_profiles',
  TRACKS: 'zti_tracks',
  TRACK_DAYS: 'zti_track_days',
  ASSIGNMENTS: 'zti_assignments',
  ENROLLMENTS: 'zti_enrollments',
  PAYMENTS: 'zti_payments',
  SUBMISSIONS: 'zti_submissions',
  PROGRESS: 'zti_progress',
  BADGES: 'zti_badges',
  LEARNER_BADGES: 'zti_learner_badges',
  CERTIFICATES: 'zti_certificates',
  NOTIFICATIONS: 'zti_notifications',
  COMMUNICATIONS: 'zti_communications',
  EMAIL_LOGS: 'zti_email_logs',
  AUDIT_LOGS: 'zti_audit_logs',
  SETTINGS: 'zti_settings',
  CURRENT_USER: 'zti_current_user',
  DEMO_MODE: 'zti_demo_mode'
};

const DEFAULT_SETTINGS: PlatformSettings = {
  upi_id: '9873152277@kotak',
  contribution_amount: 1,
  contribution_currency: 'INR',
  founder_name: 'Kapil',
  mission_name: 'SarlaYash Mission',
  require_review_for_completion: true,
  sequential_access: false,
  allow_resubmission: true,
  allow_late_submissions: true,
  email_provider: 'none',
  email_provider_configured: false,
  push_provider_configured: false,
  development_mode_notice: true,
  updated_by: 'system',
  updated_at: new Date().toISOString()
};

function getFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (e) {
    console.error(`Error reading ${key} from storage:`, e);
    return fallback;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent('zti_storage_change', { detail: { key } }));
  } catch (e) {
    console.error(`Error saving ${key} to storage:`, e);
  }
}

// Generate default assignments for all track days
function generateDefaultAssignments(trackDays: TrackDay[]): Assignment[] {
  return trackDays.map((day) => ({
    id: `assign-${day.id}`,
    track_day_id: day.id,
    track_id: day.track_id,
    day_number: day.day_number,
    title: `Practical Mission Deliverable: ${day.title}`,
    instructions: `Execute the practical hands-on challenge for Day ${day.day_number}. Implement the required logic, test against the requirements, and submit your code, structured output schema, or public repository link below for instructor review.`,
    learning_objectives: [
      `Complete hands-on implementation of ${day.title}`,
      `Verify expected outputs against the provided specifications`,
      `Document architectural decisions and parameters used`
    ],
    submission_type: 'multi',
    attachment_required: false,
    link_allowed: true,
    text_response_allowed: true,
    rubric: '1. Adherence to Day Objectives (40%)\n2. Practical Execution & Code/Prompt Quality (40%)\n3. Documentation & Verification Clarity (20%)',
    published: true,
    created_by: 'admin-kapil',
    created_at: new Date('2026-01-01').toISOString(),
    updated_at: new Date('2026-01-01').toISOString()
  }));
}

// Initial storage setup
export function initializeStorage(forceReset = false) {
  if (forceReset || !localStorage.getItem(STORAGE_KEYS.TRACKS)) {
    saveToStorage(STORAGE_KEYS.TRACKS, INITIAL_TRACKS);
    
    // Generate 30 days for both tracks
    const genAiDays = generateTrackDays('track-genai', 'generative-ai');
    const agenticDays = generateTrackDays('track-agentic', 'agentic-ai');
    const allDays = [...genAiDays, ...agenticDays];
    saveToStorage(STORAGE_KEYS.TRACK_DAYS, allDays);
    
    // Generate default assignments
    const defaultAssignments = generateDefaultAssignments(allDays);
    saveToStorage(STORAGE_KEYS.ASSIGNMENTS, defaultAssignments);

    // Initial badges
    saveToStorage(STORAGE_KEYS.BADGES, INITIAL_BADGES);

    // Default settings
    saveToStorage(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);

    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      saveToStorage(STORAGE_KEYS.USERS, []);
    }
    if (!localStorage.getItem(STORAGE_KEYS.ENROLLMENTS)) {
      saveToStorage(STORAGE_KEYS.ENROLLMENTS, []);
    }
    if (!localStorage.getItem(STORAGE_KEYS.PAYMENTS)) {
      saveToStorage(STORAGE_KEYS.PAYMENTS, []);
    }
    if (!localStorage.getItem(STORAGE_KEYS.SUBMISSIONS)) {
      saveToStorage(STORAGE_KEYS.SUBMISSIONS, []);
    }
    if (!localStorage.getItem(STORAGE_KEYS.PROGRESS)) {
      saveToStorage(STORAGE_KEYS.PROGRESS, []);
    }
    if (!localStorage.getItem(STORAGE_KEYS.LEARNER_BADGES)) {
      saveToStorage(STORAGE_KEYS.LEARNER_BADGES, []);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CERTIFICATES)) {
      saveToStorage(STORAGE_KEYS.CERTIFICATES, []);
    }
    if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
      saveToStorage(STORAGE_KEYS.NOTIFICATIONS, []);
    }
    if (!localStorage.getItem(STORAGE_KEYS.COMMUNICATIONS)) {
      saveToStorage(STORAGE_KEYS.COMMUNICATIONS, []);
    }
    if (!localStorage.getItem(STORAGE_KEYS.EMAIL_LOGS)) {
      saveToStorage(STORAGE_KEYS.EMAIL_LOGS, []);
    }
    if (!localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS)) {
      saveToStorage(STORAGE_KEYS.AUDIT_LOGS, []);
    }
  }
}

// Storage Accessors
export const storage = {
  // Demo Mode Switch
  isDemoMode: (): boolean => {
    return getFromStorage(STORAGE_KEYS.DEMO_MODE, false);
  },
  setDemoMode: (val: boolean) => {
    saveToStorage(STORAGE_KEYS.DEMO_MODE, val);
  },

  // Seed Demo Data (Clearly labeled demo records for testing)
  seedDemoData: () => {
    const demoLearner: User = {
      id: 'demo-learner-1',
      auth_provider: 'google',
      provider_user_id: 'google-oauth-1092837482',
      email: 'alex.chen.demo@gmail.com',
      display_name: 'Alex Chen (Demo Learner)',
      photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      role: 'learner',
      account_status: 'active',
      created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
      updated_at: new Date().toISOString(),
      last_login_at: new Date().toISOString()
    };

    const demoProfile: LearnerProfile = {
      id: 'profile-demo-learner-1',
      user_id: demoLearner.id,
      country: 'India',
      preferred_language: 'English',
      timezone: 'Asia/Kolkata',
      onboarding_completed: true,
      accessibility_preferences: 'High contrast display, screen-reader friendly',
      created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
      updated_at: new Date().toISOString()
    };

    const demoEnrollment: Enrollment = {
      id: 'enrollment-demo-genai',
      user_id: demoLearner.id,
      track_id: 'track-genai',
      enrollment_status: 'enrolled',
      payment_status: 'verified',
      enrolled_at: new Date(Date.now() - 86400000 * 4).toISOString(),
      created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
      updated_at: new Date().toISOString()
    };

    const demoPayment: Payment = {
      id: 'payment-demo-1',
      user_id: demoLearner.id,
      enrollment_id: demoEnrollment.id,
      amount: 1,
      currency: 'INR',
      payment_method: 'UPI',
      upi_reference: 'UPI/UTR/2026091398731522',
      verification_status: 'verified',
      verified_by: 'Kapil (Founder)',
      verified_at: new Date(Date.now() - 86400000 * 4).toISOString(),
      created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
      updated_at: new Date().toISOString()
    };

    const demoSubmission1: AssignmentSubmission = {
      id: 'sub-demo-1',
      assignment_id: 'assign-track-genai-day-1',
      user_id: demoLearner.id,
      enrollment_id: demoEnrollment.id,
      response_text: 'Configured local development workspace with Gemini API keys, Node.js v22 runtime, and verified token limits on standard prompt fixtures.',
      submission_url: 'https://github.com/alexchen-demo/zero-to-infinity-mission',
      status: 'reviewed',
      submitted_at: new Date(Date.now() - 86400000 * 3).toISOString(),
      reviewed_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      reviewed_by: 'Kapil (Instructor)',
      feedback: 'Excellent clean setup. Repository structure follows modular standards. Approved.',
      version_number: 1,
      grade_score: 95,
      created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
      updated_at: new Date().toISOString()
    };

    const demoSubmission2: AssignmentSubmission = {
      id: 'sub-demo-2',
      assignment_id: 'assign-track-genai-day-2',
      user_id: demoLearner.id,
      enrollment_id: demoEnrollment.id,
      response_text: 'Executed comparative tests across temperature 0.0, 0.7, and 1.2 on reasoning benchmarks. Observed strict determinism at 0.0 with zero hallucinatory drift.',
      status: 'submitted',
      submitted_at: new Date(Date.now() - 86400000 * 1).toISOString(),
      version_number: 1,
      created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
      updated_at: new Date().toISOString()
    };

    const demoProgress1: ProgressRecord = {
      id: 'prog-demo-1',
      user_id: demoLearner.id,
      enrollment_id: demoEnrollment.id,
      track_day_id: 'track-genai-day-1',
      day_number: 1,
      status: 'completed',
      started_at: new Date(Date.now() - 86400000 * 4).toISOString(),
      completed_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      last_activity_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
      updated_at: new Date().toISOString()
    };

    const demoProgress2: ProgressRecord = {
      id: 'prog-demo-2',
      user_id: demoLearner.id,
      enrollment_id: demoEnrollment.id,
      track_day_id: 'track-genai-day-2',
      day_number: 2,
      status: 'submitted',
      started_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      last_activity_at: new Date(Date.now() - 86400000 * 1).toISOString(),
      created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      updated_at: new Date().toISOString()
    };

    const demoBadge: LearnerBadge = {
      id: 'lbadge-demo-1',
      user_id: demoLearner.id,
      badge_id: 'badge-explorer',
      enrollment_id: demoEnrollment.id,
      issued_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      credential_id: 'CRD-ZTI-EXP-849201',
      verification_token: 'vtoken_9f82a17b0d3c',
      created_at: new Date(Date.now() - 86400000 * 2).toISOString()
    };

    const demoAudit: AuditLog = {
      id: 'audit-demo-1',
      actor_user_id: 'admin-kapil',
      action: 'PAYMENT_VERIFIED',
      entity_type: 'Payment',
      entity_id: demoPayment.id,
      metadata: { utr: demoPayment.upi_reference, amount: 1, learner: demoLearner.email },
      ip_hash_or_safe_audit_metadata: 'admin_session_auth',
      created_at: new Date(Date.now() - 86400000 * 4).toISOString()
    };

    const users = getFromStorage<User[]>(STORAGE_KEYS.USERS, []).filter(u => u.id !== demoLearner.id);
    users.push(demoLearner);
    saveToStorage(STORAGE_KEYS.USERS, users);

    const profiles = getFromStorage<LearnerProfile[]>(STORAGE_KEYS.PROFILES, []).filter(p => p.user_id !== demoLearner.id);
    profiles.push(demoProfile);
    saveToStorage(STORAGE_KEYS.PROFILES, profiles);

    const enrollments = getFromStorage<Enrollment[]>(STORAGE_KEYS.ENROLLMENTS, []).filter(e => e.id !== demoEnrollment.id);
    enrollments.push(demoEnrollment);
    saveToStorage(STORAGE_KEYS.ENROLLMENTS, enrollments);

    const payments = getFromStorage<Payment[]>(STORAGE_KEYS.PAYMENTS, []).filter(p => p.id !== demoPayment.id);
    payments.push(demoPayment);
    saveToStorage(STORAGE_KEYS.PAYMENTS, payments);

    const submissions = getFromStorage<AssignmentSubmission[]>(STORAGE_KEYS.SUBMISSIONS, []).filter(s => s.user_id !== demoLearner.id);
    submissions.push(demoSubmission1, demoSubmission2);
    saveToStorage(STORAGE_KEYS.SUBMISSIONS, submissions);

    const progress = getFromStorage<ProgressRecord[]>(STORAGE_KEYS.PROGRESS, []).filter(p => p.user_id !== demoLearner.id);
    progress.push(demoProgress1, demoProgress2);
    saveToStorage(STORAGE_KEYS.PROGRESS, progress);

    const badges = getFromStorage<LearnerBadge[]>(STORAGE_KEYS.LEARNER_BADGES, []).filter(b => b.user_id !== demoLearner.id);
    badges.push(demoBadge);
    saveToStorage(STORAGE_KEYS.LEARNER_BADGES, badges);

    const audits = getFromStorage<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, []);
    audits.push(demoAudit);
    saveToStorage(STORAGE_KEYS.AUDIT_LOGS, audits);

    saveToStorage(STORAGE_KEYS.DEMO_MODE, true);
  },

  // Clear demo data (Return to pristine 0 database records)
  clearToEmptyProduction: () => {
    saveToStorage(STORAGE_KEYS.USERS, []);
    saveToStorage(STORAGE_KEYS.PROFILES, []);
    saveToStorage(STORAGE_KEYS.ENROLLMENTS, []);
    saveToStorage(STORAGE_KEYS.PAYMENTS, []);
    saveToStorage(STORAGE_KEYS.SUBMISSIONS, []);
    saveToStorage(STORAGE_KEYS.PROGRESS, []);
    saveToStorage(STORAGE_KEYS.LEARNER_BADGES, []);
    saveToStorage(STORAGE_KEYS.CERTIFICATES, []);
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, []);
    saveToStorage(STORAGE_KEYS.COMMUNICATIONS, []);
    saveToStorage(STORAGE_KEYS.EMAIL_LOGS, []);
    saveToStorage(STORAGE_KEYS.AUDIT_LOGS, []);
    saveToStorage(STORAGE_KEYS.DEMO_MODE, false);
    saveToStorage(STORAGE_KEYS.CURRENT_USER, null);
  },

  // Current Auth User
  getCurrentUser: (): User | null => {
    return getFromStorage<User | null>(STORAGE_KEYS.CURRENT_USER, null);
  },
  setCurrentUser: (user: User | null) => {
    saveToStorage(STORAGE_KEYS.CURRENT_USER, user);
  },

  // Users
  getUsers: (): User[] => getFromStorage<User[]>(STORAGE_KEYS.USERS, []),
  getUserById: (id: string): User | undefined => {
    return storage.getUsers().find(u => u.id === id);
  },
  saveUser: (user: User) => {
    const users = storage.getUsers();
    const idx = users.findIndex(u => u.id === user.id);
    if (idx >= 0) {
      users[idx] = user;
    } else {
      users.push(user);
    }
    saveToStorage(STORAGE_KEYS.USERS, users);
  },

  // Learner Profiles
  getProfiles: (): LearnerProfile[] => getFromStorage<LearnerProfile[]>(STORAGE_KEYS.PROFILES, []),
  getProfileByUserId: (userId: string): LearnerProfile | undefined => {
    return storage.getProfiles().find(p => p.user_id === userId);
  },
  saveProfile: (profile: LearnerProfile) => {
    const profiles = storage.getProfiles();
    const idx = profiles.findIndex(p => p.user_id === profile.user_id);
    if (idx >= 0) {
      profiles[idx] = profile;
    } else {
      profiles.push(profile);
    }
    saveToStorage(STORAGE_KEYS.PROFILES, profiles);
  },

  // Tracks & Curriculum
  getTracks: (): Track[] => getFromStorage<Track[]>(STORAGE_KEYS.TRACKS, INITIAL_TRACKS),
  getTrack: (id: string): Track | undefined => {
    return storage.getTracks().find(t => t.id === id);
  },
  getTrackBySlug: (slug: string): Track | undefined => {
    return storage.getTracks().find(t => t.slug === slug);
  },
  getTrackDays: (trackId?: string): TrackDay[] => {
    const all = getFromStorage<TrackDay[]>(STORAGE_KEYS.TRACK_DAYS, []);
    if (!trackId) return all;
    return all.filter(d => d.track_id === trackId).sort((a, b) => a.day_number - b.day_number);
  },
  getTrackDay: (trackId: string, dayNumber: number): TrackDay | undefined => {
    return storage.getTrackDays(trackId).find(d => d.day_number === dayNumber);
  },
  saveTrackDay: (updatedDay: TrackDay) => {
    storage.updateTrackDay(updatedDay);
  },
  updateTrackDay: (updatedDay: TrackDay) => {
    const all = getFromStorage<TrackDay[]>(STORAGE_KEYS.TRACK_DAYS, []);
    const idx = all.findIndex(d => d.id === updatedDay.id);
    if (idx >= 0) {
      all[idx] = updatedDay;
      saveToStorage(STORAGE_KEYS.TRACK_DAYS, all);
    }
  },

  // Assignments
  getAssignments: (trackId?: string): Assignment[] => {
    const all = getFromStorage<Assignment[]>(STORAGE_KEYS.ASSIGNMENTS, []);
    if (!trackId) return all;
    return all.filter(a => a.track_id === trackId);
  },
  getAssignmentById: (id: string): Assignment | undefined => {
    return storage.getAssignments().find(a => a.id === id);
  },
  getAssignmentByTrackDay: (trackDayId: string): Assignment | undefined => {
    return storage.getAssignments().find(a => a.track_day_id === trackDayId);
  },
  saveAssignment: (assignment: Assignment) => {
    const all = storage.getAssignments();
    const idx = all.findIndex(a => a.id === assignment.id);
    if (idx >= 0) {
      all[idx] = assignment;
    } else {
      all.push(assignment);
    }
    saveToStorage(STORAGE_KEYS.ASSIGNMENTS, all);
  },

  // Enrollments
  getEnrollments: (): Enrollment[] => getFromStorage<Enrollment[]>(STORAGE_KEYS.ENROLLMENTS, []),
  getEnrollmentsByUser: (userId: string): Enrollment[] => {
    return storage.getEnrollments().filter(e => e.user_id === userId);
  },
  getEnrollment: (userId: string, trackId: string): Enrollment | undefined => {
    return storage.getEnrollments().find(e => e.user_id === userId && e.track_id === trackId);
  },
  saveEnrollment: (enrollment: Enrollment) => {
    const all = storage.getEnrollments();
    const idx = all.findIndex(e => e.id === enrollment.id);
    if (idx >= 0) {
      all[idx] = enrollment;
    } else {
      all.push(enrollment);
    }
    saveToStorage(STORAGE_KEYS.ENROLLMENTS, all);
  },

  // Payments
  getPayments: (): Payment[] => getFromStorage<Payment[]>(STORAGE_KEYS.PAYMENTS, []),
  getPaymentsByUser: (userId: string): Payment[] => {
    return storage.getPayments().filter(p => p.user_id === userId);
  },
  getPaymentById: (paymentId: string): Payment | undefined => {
    return storage.getPayments().find(p => p.id === paymentId);
  },
  savePayment: (payment: Payment) => {
    const all = storage.getPayments();
    const idx = all.findIndex(p => p.id === payment.id);
    if (idx >= 0) {
      all[idx] = payment;
    } else {
      all.push(payment);
    }
    saveToStorage(STORAGE_KEYS.PAYMENTS, all);
  },
  // Check if learner has paid daily 1 rupee for a specific day
  hasPaidForDay: (userId: string, trackId: string, dayNumber: number): boolean => {
    const user = storage.getUsers().find(u => u.id === userId);
    if (user?.role === 'admin') return true;

    // Day 1 can also be verified by track enrollment payment
    if (dayNumber === 1) {
      const enrollment = storage.getEnrollment(userId, trackId);
      if (enrollment?.payment_status === 'verified') return true;
    }

    // Check specific day payment record
    const allPayments = storage.getPaymentsByUser(userId);
    const verifiedDayPayment = allPayments.find(p => 
      p.verification_status === 'verified' &&
      (p.day_number === dayNumber || (dayNumber === 1 && !p.day_number)) &&
      (!p.track_id || p.track_id === trackId)
    );

    return !!verifiedDayPayment;
  },
  // Get payment status for a specific day
  getDayPayment: (userId: string, trackId: string, dayNumber: number): Payment | undefined => {
    const allPayments = storage.getPaymentsByUser(userId);
    return allPayments.find(p => 
      (p.day_number === dayNumber || (dayNumber === 1 && !p.day_number)) &&
      (!p.track_id || p.track_id === trackId)
    );
  },
  verifyPayment: (paymentId: string, verifiedByUserId: string) => {
    const payment = storage.getPaymentById(paymentId);
    if (!payment) return;

    payment.verification_status = 'verified';
    payment.verified_by = verifiedByUserId;
    payment.verified_at = new Date().toISOString();
    payment.updated_at = new Date().toISOString();
    storage.savePayment(payment);

    // Update associated enrollment
    const enrollment = storage.getEnrollments().find(e => e.id === payment.enrollment_id);
    if (enrollment) {
      enrollment.payment_status = 'verified';
      enrollment.updated_at = new Date().toISOString();
      storage.saveEnrollment(enrollment);
    }

    storage.logAudit(verifiedByUserId, 'PAYMENT_VERIFIED', 'Payment', payment.id, {
      amount: payment.amount,
      utr: payment.upi_reference
    });

    storage.saveNotification({
      id: `notif-${Date.now()}`,
      user_id: payment.user_id,
      title: 'Contribution Verified & Access Granted',
      body: `Your ₹${payment.amount} contribution has been verified by Kapil. Full 30-day curriculum and deliverables are now unlocked.`,
      type: 'assignment',
      delivery_channel: 'in_app',
      status: 'delivered',
      sent_at: new Date().toISOString(),
      created_by: verifiedByUserId,
      created_at: new Date().toISOString()
    });
  },
  rejectPayment: (paymentId: string, rejectedByUserId: string, reason: string) => {
    const payment = storage.getPaymentById(paymentId);
    if (!payment) return;

    payment.verification_status = 'rejected';
    payment.rejection_reason = reason;
    payment.verified_by = rejectedByUserId;
    payment.verified_at = new Date().toISOString();
    payment.updated_at = new Date().toISOString();
    storage.savePayment(payment);

    const enrollment = storage.getEnrollments().find(e => e.id === payment.enrollment_id);
    if (enrollment) {
      enrollment.payment_status = 'rejected';
      enrollment.updated_at = new Date().toISOString();
      storage.saveEnrollment(enrollment);
    }

    storage.logAudit(rejectedByUserId, 'PAYMENT_REJECTED', 'Payment', payment.id, {
      reason,
      utr: payment.upi_reference
    });

    storage.saveNotification({
      id: `notif-${Date.now()}`,
      user_id: payment.user_id,
      title: 'Payment Verification Action Required',
      body: `Your payment record was rejected: ${reason}. Please update your UTR reference or contact kapilnarula27july@gmail.com.`,
      type: 'assignment',
      delivery_channel: 'in_app',
      status: 'delivered',
      sent_at: new Date().toISOString(),
      created_by: rejectedByUserId,
      created_at: new Date().toISOString()
    });
  },

  // Submissions
  getSubmissions: (): AssignmentSubmission[] => getFromStorage<AssignmentSubmission[]>(STORAGE_KEYS.SUBMISSIONS, []),
  getSubmissionsByUser: (userId: string): AssignmentSubmission[] => {
    return storage.getSubmissions().filter(s => s.user_id === userId);
  },
  getSubmissionByAssignmentAndUser: (assignmentId: string, userId: string): AssignmentSubmission | undefined => {
    return storage.getSubmissions().find(s => s.assignment_id === assignmentId && s.user_id === userId);
  },
  saveSubmission: (submission: AssignmentSubmission) => {
    const all = storage.getSubmissions();
    const idx = all.findIndex(s => s.id === submission.id);
    if (idx >= 0) {
      all[idx] = submission;
    } else {
      all.push(submission);
    }
    saveToStorage(STORAGE_KEYS.SUBMISSIONS, all);
  },
  reviewSubmission: (
    submissionId: string, 
    reviewedByUserId: string, 
    status: 'reviewed' | 'needs_revision', 
    feedback: string, 
    gradeScore?: number
  ) => {
    const all = storage.getSubmissions();
    const submission = all.find(s => s.id === submissionId);
    if (!submission) return;

    submission.status = status;
    submission.reviewed_by = reviewedByUserId;
    submission.reviewed_at = new Date().toISOString();
    submission.feedback = feedback;
    if (gradeScore !== undefined) {
      submission.grade_score = gradeScore;
    }
    submission.updated_at = new Date().toISOString();
    storage.saveSubmission(submission);

    // If reviewed, mark day progress as completed
    const assignment = storage.getAssignmentById(submission.assignment_id);
    if (assignment && status === 'reviewed') {
      const existingProg = storage.getProgress().find(
        p => p.user_id === submission.user_id && p.track_day_id === assignment.track_day_id
      );
      if (existingProg) {
        existingProg.status = 'completed';
        existingProg.completed_at = new Date().toISOString();
        existingProg.last_activity_at = new Date().toISOString();
        storage.saveProgress(existingProg);
      }
    }

    storage.logAudit(reviewedByUserId, 'SUBMISSION_REVIEWED', 'AssignmentSubmission', submission.id, {
      status,
      grade_score: gradeScore,
      user_id: submission.user_id
    });

    storage.saveNotification({
      id: `notif-${Date.now()}`,
      user_id: submission.user_id,
      title: status === 'reviewed' ? 'Assignment Reviewed & Approved' : 'Assignment Revision Requested',
      body: `Instructor Kapil reviewed your submission: "${feedback.substring(0, 120)}..."`,
      type: 'assignment',
      delivery_channel: 'in_app',
      status: 'delivered',
      sent_at: new Date().toISOString(),
      created_by: reviewedByUserId,
      created_at: new Date().toISOString()
    });
  },

  // Progress
  getProgress: (): ProgressRecord[] => getFromStorage<ProgressRecord[]>(STORAGE_KEYS.PROGRESS, []),
  getProgressByUser: (userId: string, enrollmentId?: string): ProgressRecord[] => {
    return storage.getProgress().filter(p => p.user_id === userId && (!enrollmentId || p.enrollment_id === enrollmentId));
  },
  saveProgress: (progress: ProgressRecord) => {
    const all = storage.getProgress();
    const idx = all.findIndex(p => p.user_id === progress.user_id && p.track_day_id === progress.track_day_id);
    if (idx >= 0) {
      all[idx] = progress;
    } else {
      all.push(progress);
    }
    saveToStorage(STORAGE_KEYS.PROGRESS, all);
  },

  // Badges & Credentials
  getBadges: (): Badge[] => getFromStorage<Badge[]>(STORAGE_KEYS.BADGES, INITIAL_BADGES),
  getLearnerBadges: (userId?: string): LearnerBadge[] => {
    const all = getFromStorage<LearnerBadge[]>(STORAGE_KEYS.LEARNER_BADGES, []);
    if (!userId) return all;
    return all.filter(b => b.user_id === userId);
  },
  getLearnerBadgeByCredentialId: (credentialId: string): LearnerBadge | undefined => {
    const found = storage.getLearnerBadges().find(b => b.credential_id === credentialId);
    if (found) return found;
    return DEMO_LEARNER_BADGES.find(b => b.credential_id === credentialId);
  },
  saveLearnerBadge: (badge: LearnerBadge) => {
    const all = storage.getLearnerBadges();
    const idx = all.findIndex(b => b.id === badge.id);
    if (idx >= 0) {
      all[idx] = badge;
    } else {
      all.push(badge);
    }
    saveToStorage(STORAGE_KEYS.LEARNER_BADGES, all);
  },

  // Certificates
  getCertificates: (userId?: string): Certificate[] => {
    const all = getFromStorage<Certificate[]>(STORAGE_KEYS.CERTIFICATES, []);
    if (!userId) return all;
    return all.filter(c => c.user_id === userId);
  },
  getCertificateByNumber: (certNumber: string): Certificate | undefined => {
    const found = storage.getCertificates().find(c => c.certificate_number === certNumber);
    if (found) return found;
    return DEMO_CERTIFICATES.find(c => c.certificate_number === certNumber);
  },
  saveCertificate: (certificate: Certificate) => {
    const all = storage.getCertificates();
    const idx = all.findIndex(c => c.id === certificate.id);
    if (idx >= 0) {
      all[idx] = certificate;
    } else {
      all.push(certificate);
    }
    saveToStorage(STORAGE_KEYS.CERTIFICATES, all);
  },
  revokeCertificate: (certificateId: string, adminUserId: string, reason: string) => {
    const cert = storage.getCertificates().find(c => c.id === certificateId);
    if (!cert) return;

    cert.status = 'revoked';
    cert.revocation_reason = reason;
    cert.updated_at = new Date().toISOString();
    storage.saveCertificate(cert);

    storage.logAudit(adminUserId, 'CERTIFICATE_REVOKED', 'Certificate', cert.id, {
      reason,
      certificate_number: cert.certificate_number
    });
  },

  // Review-Gated Credential Enforcement:
  // "ADMIN CAN ASSIGN BADGES AND CERTIFICATES ONLY AFTER REVIEW."
  getReviewedSubmissionsByUser: (userId: string): AssignmentSubmission[] => {
    return storage.getSubmissionsByUser(userId).filter(s => s.status === 'reviewed');
  },
  canAssignCredentials: (userId: string): boolean => {
    return storage.getReviewedSubmissionsByUser(userId).length > 0;
  },
  assignBadgeAfterReview: (
    userId: string,
    badgeId: string,
    reviewedSubmissionId: string,
    adminUserId: string
  ): { success: boolean; message: string; badge?: LearnerBadge } => {
    const submission = storage.getSubmissions().find(s => s.id === reviewedSubmissionId);
    if (!submission || submission.status !== 'reviewed') {
      return {
        success: false,
        message: 'Policy Violation: Badges can only be assigned after an assignment has been reviewed and approved.'
      };
    }

    // Check if learner already has this badge
    const existing = storage.getLearnerBadges(userId).find(b => b.badge_id === badgeId);
    if (existing) {
      return {
        success: false,
        message: 'This badge has already been awarded to the learner.'
      };
    }

    const badgeDef = storage.getBadges().find(b => b.id === badgeId);
    const badgeSlug = badgeDef?.slug || 'comp';
    const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
    const credentialId = `BADGE-${badgeSlug.toUpperCase().slice(0, 8)}-${randomHex}`;
    
    const newLearnerBadge: LearnerBadge = {
      id: `lbadge-${Date.now()}-${randomHex.toLowerCase()}`,
      user_id: userId,
      badge_id: badgeId,
      issued_at: new Date().toISOString(),
      credential_id: credentialId,
      verification_token: `token-${credentialId.toLowerCase()}-${Date.now()}`,
      created_at: new Date().toISOString()
    };

    storage.saveLearnerBadge(newLearnerBadge);

    storage.logAudit(adminUserId, 'BADGE_AWARDED_AFTER_REVIEW', 'LearnerBadge', newLearnerBadge.id, {
      badge_id: badgeId,
      user_id: userId,
      reviewed_submission_id: reviewedSubmissionId,
      credential_id: credentialId
    });

    storage.saveNotification({
      id: `notif-${Date.now()}`,
      user_id: userId,
      title: `Competency Badge Awarded: ${badgeDef?.name || 'Verified Badge'}`,
      body: `Instructor Kapil awarded you this badge after reviewing your deliverable! Verifiable ID: ${credentialId}.`,
      type: 'assignment',
      delivery_channel: 'in_app',
      status: 'delivered',
      sent_at: new Date().toISOString(),
      created_by: adminUserId,
      created_at: new Date().toISOString()
    });

    return {
      success: true,
      message: `Badge "${badgeDef?.name}" assigned successfully after review!`,
      badge: newLearnerBadge
    };
  },

  // Notifications
  getNotifications: (userId?: string): NotificationItem[] => {
    const all = getFromStorage<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, []);
    if (!userId) return all;
    return all.filter(n => !n.user_id || n.user_id === userId);
  },
  saveNotification: (notification: NotificationItem) => {
    const all = storage.getNotifications();
    all.unshift(notification);
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, all);
  },
  markNotificationsAsRead: (userId: string) => {
    const all = getFromStorage<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, []);
    all.forEach(n => {
      if (!n.user_id || n.user_id === userId) {
        n.status = 'read';
      }
    });
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, all);
  },

  // Email Logs
  getEmailLogs: (): EmailLog[] => getFromStorage<EmailLog[]>(STORAGE_KEYS.EMAIL_LOGS, []),
  logEmail: (log: EmailLog) => {
    const all = storage.getEmailLogs();
    all.unshift(log);
    saveToStorage(STORAGE_KEYS.EMAIL_LOGS, all);
  },

  // Communications (Email & Text Hub)
  getCommunications: (): CommunicationRecord[] => getFromStorage<CommunicationRecord[]>(STORAGE_KEYS.COMMUNICATIONS, []),
  saveCommunication: (comm: CommunicationRecord) => {
    const all = storage.getCommunications();
    const idx = all.findIndex(c => c.id === comm.id);
    if (idx >= 0) {
      all[idx] = comm;
    } else {
      all.unshift(comm);
    }
    saveToStorage(STORAGE_KEYS.COMMUNICATIONS, all);
  },
  getCommunicationsForLearner: (learnerId: string): CommunicationRecord[] => {
    const all = storage.getCommunications();
    return all.filter(c => 
      c.audience_type === 'all' || 
      c.recipient_ids.includes(learnerId)
    );
  },
  dispatchCommunication: (comm: CommunicationRecord) => {
    // 1. Save communication record
    storage.saveCommunication(comm);

    // 2. Dispatch in-app notifications to each recipient
    if (comm.audience_type === 'all') {
      storage.saveNotification({
        id: `notif-comm-${Date.now()}-all`,
        user_id: undefined, // broadcast to all
        title: comm.subject,
        body: comm.body,
        type: 'announcement',
        delivery_channel: comm.channel === 'text' ? 'push' : 'email',
        status: 'delivered',
        sent_at: comm.created_at,
        created_by: comm.sender_id,
        created_at: comm.created_at
      });
    } else {
      comm.recipient_ids.forEach(recipientId => {
        storage.saveNotification({
          id: `notif-comm-${Date.now()}-${recipientId}`,
          user_id: recipientId,
          title: comm.subject,
          body: comm.body,
          type: 'announcement',
          delivery_channel: comm.channel === 'text' ? 'push' : 'email',
          status: 'delivered',
          sent_at: comm.created_at,
          created_by: comm.sender_id,
          created_at: comm.created_at
        });
      });
    }

    // 3. Log email dispatches
    comm.recipient_emails.forEach((email, idx) => {
      const recipientId = comm.recipient_ids[idx] || '';
      storage.logEmail({
        id: `elog-${Date.now()}-${idx}`,
        recipient_user_id: recipientId,
        recipient_email: email,
        template_name: comm.audience_type === 'individual' ? 'Direct Learner Outreach' : (comm.group_label || 'Broadcast'),
        subject: comm.subject,
        delivery_status: 'sent',
        sent_at: comm.created_at,
        sent_by: comm.sender_id,
        audience_type: comm.audience_type,
        recipient_count: comm.recipient_emails.length,
        body_preview: comm.body.slice(0, 100)
      });
    });

    // 4. Audit Log
    storage.logAudit(comm.sender_id, 'COMMUNICATION_DISPATCHED', 'Communication', comm.id, {
      subject: comm.subject,
      channel: comm.channel,
      audience_type: comm.audience_type,
      recipient_count: comm.recipient_emails.length,
      group_label: comm.group_label
    });
  },

  // Audit Logs
  getAuditLogs: (): AuditLog[] => getFromStorage<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, []),
  logAudit: (actorId: string, action: string, entityType: string, entityId: string, metadata?: Record<string, any>) => {
    const log: AuditLog = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      actor_user_id: actorId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      metadata,
      ip_hash_or_safe_audit_metadata: 'web_client_auth_session',
      created_at: new Date().toISOString()
    };
    const all = storage.getAuditLogs();
    all.unshift(log);
    saveToStorage(STORAGE_KEYS.AUDIT_LOGS, all);
  },

  // Settings
  getSettings: (): PlatformSettings => getFromStorage<PlatformSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS),
  updateSettings: (settings: Partial<PlatformSettings>, updatedBy: string) => {
    const current = storage.getSettings();
    const updated: PlatformSettings = {
      ...current,
      ...settings,
      updated_by: updatedBy,
      updated_at: new Date().toISOString()
    };
    saveToStorage(STORAGE_KEYS.SETTINGS, updated);
  },

  // Real Progress Engine (strictly calculated from actual database records)
  calculateLearnerProgress: (userId: string, trackId: string) => {
    const enrollment = storage.getEnrollment(userId, trackId);
    if (!enrollment) {
      return {
        completedDays: 0,
        totalDays: 30,
        percentage: 0,
        submittedAssignments: 0,
        pendingAssignments: 30,
        currentDay: 1,
        streakDays: 0,
        lastActivity: null
      };
    }

    const trackDays = storage.getTrackDays(trackId);
    const progressRecords = storage.getProgressByUser(userId, enrollment.id);
    const submissions = storage.getSubmissionsByUser(userId);

    const completedDayIds = new Set(
      progressRecords.filter(p => p.status === 'completed').map(p => p.track_day_id)
    );

    const submittedCount = submissions.filter(s => {
      const assign = storage.getAssignmentById(s.assignment_id);
      return assign && assign.track_id === trackId;
    }).length;

    const completedDays = completedDayIds.size;
    const totalDays = trackDays.length || 30;
    const percentage = Math.min(100, Math.round((completedDays / totalDays) * 100));

    // Calculate real activity streak
    const activityDates = progressRecords
      .map(p => p.last_activity_at.split('T')[0])
      .sort()
      .reverse();
    const uniqueDates = Array.from(new Set(activityDates));
    let streakDays = 0;
    if (uniqueDates.length > 0) {
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      if (uniqueDates[0] === today || uniqueDates[0] === yesterday) {
        streakDays = 1;
        for (let i = 1; i < uniqueDates.length; i++) {
          const prev = new Date(uniqueDates[i - 1]).getTime();
          const curr = new Date(uniqueDates[i]).getTime();
          if (prev - curr <= 86400000 * 1.5) {
            streakDays++;
          } else {
            break;
          }
        }
      }
    }

    // Determine current day
    const currentDay = Math.min(totalDays, completedDays + 1);

    const lastActivity = progressRecords.length > 0
      ? progressRecords.sort((a, b) => new Date(b.last_activity_at).getTime() - new Date(a.last_activity_at).getTime())[0].last_activity_at
      : null;

    return {
      completedDays,
      totalDays,
      percentage,
      submittedAssignments: submittedCount,
      pendingAssignments: Math.max(0, totalDays - submittedCount),
      currentDay,
      streakDays,
      lastActivity
    };
  },

  // Calculate Operational Metrics for Admin (Real database records only, Section 10)
  getAdminMetrics: () => {
    const users = storage.getUsers().filter(u => u.role === 'learner');
    const enrollments = storage.getEnrollments();
    const activeEnrollments = enrollments.filter(e => e.enrollment_status === 'enrolled');
    const payments = storage.getPayments();
    const pendingPayments = payments.filter(p => p.verification_status === 'pending_verification');
    
    // Submissions submitted today (real timestamp comparison)
    const todayStr = new Date().toISOString().split('T')[0];
    const submissions = storage.getSubmissions();
    const submissionsToday = submissions.filter(s => s.submitted_at && s.submitted_at.startsWith(todayStr)).length;
    const pendingReviews = submissions.filter(s => s.status === 'submitted').length;

    const badgesIssued = storage.getLearnerBadges().filter(b => !b.revoked_at).length;
    const certificatesIssued = storage.getCertificates().filter(c => c.status === 'issued').length;

    const totalVerifiedRevenue = payments
      .filter(p => p.verification_status === 'verified')
      .reduce((sum, p) => sum + p.amount, 0);

    let totalCompletion = 0;
    enrollments.forEach(e => {
      const prog = storage.calculateLearnerProgress(e.user_id, e.track_id);
      totalCompletion += prog.percentage;
    });
    const avgCompletion = enrollments.length > 0 ? Math.round(totalCompletion / enrollments.length) : 0;

    return {
      totalRegisteredLearners: users.length,
      totalLearners: users.length,
      activeEnrollments: activeEnrollments.length,
      pendingPaymentVerifications: pendingPayments.length,
      pendingPayments: pendingPayments.length,
      assignmentsSubmittedToday: submissionsToday,
      pendingReviews,
      badgesIssued,
      certificatesIssued,
      totalVerifiedRevenue,
      enrolledGenAI: enrollments.filter(e => e.track_id === 'track-genai').length,
      enrolledAgenticAI: enrollments.filter(e => e.track_id === 'track-agentic').length,
      averageCompletionPercentage: avgCompletion
    };
  }
};

// Initialize right away
initializeStorage();
