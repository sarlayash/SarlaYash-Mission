import { Certificate, Badge, LearnerBadge } from '../types';

export const DEMO_CERTIFICATES: Certificate[] = [
  {
    id: 'cert-demo-genai-2026',
    user_id: 'learner-demo',
    track_id: 'track-genai',
    certificate_number: 'ZTI-GENAI-2026-DEMO',
    certificate_type: 'track_completion',
    recipient_name_snapshot: 'Kapil Exemplary Learner',
    track_name_snapshot: '30-Day Generative AI Engineering (Zero-To-Infinity)',
    status: 'issued',
    issued_by: 'Kapil · Founder & Instructor, SarlaYash Mission',
    issue_date: '2026-02-15T00:00:00.000Z',
    completion_date: '2026-02-14T18:30:00.000Z',
    verification_token: 'token-demo-genai-2026-verified',
    created_at: '2026-02-15T00:00:00.000Z',
    updated_at: '2026-02-15T00:00:00.000Z'
  },
  {
    id: 'cert-demo-agentic-2026',
    user_id: 'learner-demo',
    track_id: 'track-agentic',
    certificate_number: 'ZTI-AGENT-2026-DEMO',
    certificate_type: 'track_completion',
    recipient_name_snapshot: 'Priya Sharma (Sample Graduate)',
    track_name_snapshot: '30-Day Autonomous Agentic AI Systems (Zero-To-Infinity)',
    status: 'issued',
    issued_by: 'Kapil · Founder & Instructor, SarlaYash Mission',
    issue_date: '2026-03-01T00:00:00.000Z',
    completion_date: '2026-02-28T18:30:00.000Z',
    verification_token: 'token-demo-agent-2026-verified',
    created_at: '2026-03-01T00:00:00.000Z',
    updated_at: '2026-03-01T00:00:00.000Z'
  }
];

export const DEMO_LEARNER_BADGES: LearnerBadge[] = [
  {
    id: 'lbadge-demo-01',
    user_id: 'learner-demo',
    badge_id: 'badge-genai-foundations',
    issued_at: '2026-01-05T12:00:00.000Z',
    credential_id: 'BADGE-GENAI-01-DEMO',
    verification_token: 'tok-badge-01-demo',
    created_at: '2026-01-05T12:00:00.000Z'
  },
  {
    id: 'lbadge-demo-02',
    user_id: 'learner-demo',
    badge_id: 'badge-rag-architect',
    issued_at: '2026-01-12T12:00:00.000Z',
    credential_id: 'BADGE-RAG-02-DEMO',
    verification_token: 'tok-badge-02-demo',
    created_at: '2026-01-12T12:00:00.000Z'
  },
  {
    id: 'lbadge-demo-03',
    user_id: 'learner-demo',
    badge_id: 'badge-agentic-loop',
    issued_at: '2026-01-20T12:00:00.000Z',
    credential_id: 'BADGE-AGENT-03-DEMO',
    verification_token: 'tok-badge-03-demo',
    created_at: '2026-01-20T12:00:00.000Z'
  },
  {
    id: 'lbadge-demo-04',
    user_id: 'learner-demo',
    badge_id: 'badge-multi-agent',
    issued_at: '2026-01-28T12:00:00.000Z',
    credential_id: 'BADGE-MULTI-04-DEMO',
    verification_token: 'tok-badge-04-demo',
    created_at: '2026-01-28T12:00:00.000Z'
  }
];
