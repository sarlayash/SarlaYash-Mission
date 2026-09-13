export type UserRole = 'learner' | 'admin';
export type AccountStatus = 'active' | 'suspended';

export interface User {
  id: string;
  auth_provider: 'google' | 'admin';
  provider_user_id: string;
  email: string;
  display_name: string;
  photo_url?: string;
  role: UserRole;
  account_status: AccountStatus;
  created_at: string;
  updated_at: string;
  last_login_at: string;
}

export interface LearnerProfile {
  id: string;
  user_id: string;
  country?: string;
  preferred_language: string;
  timezone: string;
  onboarding_completed: boolean;
  accessibility_preferences?: string;
  created_at: string;
  updated_at: string;
}

export type TrackSlug = 'generative-ai' | 'agentic-ai';

export interface Track {
  id: string;
  slug: TrackSlug;
  name: string;
  description: string;
  duration_days: number;
  theory_percentage: number;
  hands_on_percentage: number;
  status: 'active' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface TrackDay {
  id: string;
  track_id: string;
  day_number: number;
  title: string;
  theory_content: string;
  hands_on_objective: string;
  hands_on_activity: string;
  estimated_minutes: number;
  suggested_tools: string[];
  completion_criteria: string;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export type SubmissionType = 'text' | 'file' | 'link' | 'multi';

export interface Assignment {
  id: string;
  track_day_id: string;
  track_id: string;
  day_number: number;
  title: string;
  instructions: string;
  learning_objectives: string[];
  submission_type: SubmissionType;
  attachment_required: boolean;
  link_allowed: boolean;
  text_response_allowed: boolean;
  rubric: string;
  due_at?: string;
  published: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export type EnrollmentStatus = 'enrolled' | 'completed' | 'paused';
export type PaymentStatus = 'pending_verification' | 'verified' | 'rejected' | 'exempt';

export interface Enrollment {
  id: string;
  user_id: string;
  track_id: string;
  enrollment_status: EnrollmentStatus;
  payment_status: PaymentStatus;
  enrolled_at: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  user_id: string;
  enrollment_id: string;
  track_id?: string;
  day_number?: number;
  amount: number;
  currency: string;
  payment_method: 'UPI' | 'GATEWAY' | 'CARD';
  upi_reference?: string; // UTR
  receipt_url?: string;
  verification_status: 'pending_verification' | 'verified' | 'rejected';
  verified_by?: string;
  verified_at?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

export type SubmissionStatus = 'submitted' | 'reviewed' | 'needs_revision';

export interface AssignmentSubmission {
  id: string;
  assignment_id: string;
  user_id: string;
  enrollment_id: string;
  response_text?: string;
  submission_url?: string;
  file_url?: string;
  file_name?: string;
  file_size?: number;
  status: SubmissionStatus;
  submitted_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  feedback?: string;
  version_number: number;
  grade_score?: number; // e.g. 1-100 or pass
  created_at: string;
  updated_at: string;
}

export type DayProgressStatus = 'started' | 'submitted' | 'completed';

export interface ProgressRecord {
  id: string;
  user_id: string;
  enrollment_id: string;
  track_day_id: string;
  day_number: number;
  status: DayProgressStatus;
  started_at: string;
  completed_at?: string;
  last_activity_at: string;
  created_at: string;
  updated_at: string;
}

export interface Badge {
  id: string;
  track_id?: string; // null if cross-track
  name: string;
  slug: string;
  description: string;
  criteria: string;
  icon_name: string;
  image_url?: string;
  status: 'active' | 'archived';
  created_at: string;
}

export interface LearnerBadge {
  id: string;
  user_id: string;
  badge_id: string;
  enrollment_id?: string;
  issued_at: string;
  credential_id: string;
  verification_token: string;
  revoked_at?: string;
  created_at: string;
}

export type CertificateType = 'track_completion' | 'dual_track' | '30_day_journey' | 'participation';

export interface Certificate {
  id: string;
  user_id: string;
  enrollment_id?: string;
  track_id?: string;
  certificate_number: string;
  certificate_type: CertificateType;
  issue_date: string;
  completion_date: string;
  recipient_name_snapshot: string;
  track_name_snapshot: string;
  status: 'issued' | 'revoked';
  revocation_reason?: string;
  pdf_url?: string;
  verification_token: string;
  issued_by: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationItem {
  id: string;
  user_id?: string; // null for broadcast
  title: string;
  body: string;
  type: 'welcome' | 'assignment' | 'review' | 'badge' | 'certificate' | 'announcement';
  delivery_channel: 'in_app' | 'email' | 'push';
  status: 'delivered' | 'read';
  action_link?: string;
  sent_at: string;
  created_by: string;
  created_at: string;
}

export interface EmailLog {
  id: string;
  recipient_user_id: string;
  recipient_email: string;
  template_name: string;
  subject: string;
  provider_message_id?: string;
  delivery_status: 'sent' | 'pending' | 'failed' | 'not_configured';
  error_message?: string;
  sent_at: string;
  sent_by: string;
}

export interface AuditLog {
  id: string;
  actor_user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  metadata?: Record<string, any>;
  ip_hash_or_safe_audit_metadata: string;
  created_at: string;
}

export interface PlatformSettings {
  upi_id: string;
  contribution_amount: number;
  contribution_currency: string;
  founder_name: string;
  mission_name: string;
  require_review_for_completion: boolean;
  sequential_access: boolean;
  allow_resubmission: boolean;
  allow_late_submissions: boolean;
  email_provider: 'resend' | 'sendgrid' | 'postmark' | 'none';
  email_provider_configured: boolean;
  push_provider_configured: boolean;
  development_mode_notice: boolean;
  updated_by: string;
  updated_at: string;
}
