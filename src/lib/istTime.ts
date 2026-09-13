import { AssignmentSubmission } from '../types';
import { storage } from './storage';

/**
 * Utility functions for Indian Standard Time (IST, UTC+5:30)
 * Enforcing:
 * 1. Only 1 submission, 1 assignment a day across both tracks
 * 2. Assignments remain locked until 12:00 Midnight IST
 */

/**
 * Returns the calendar date string in IST timezone (Asia/Kolkata), formatted as 'YYYY-MM-DD'.
 */
export function getISTDateString(dateInput: Date | string = new Date()): string {
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return '';

  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(d);
}

/**
 * Returns current date and time formatted in IST
 */
export function getCurrentISTInfo(): {
  dateStr: string;
  timeStr: string;
  fullStr: string;
} {
  const now = new Date();
  const dateStr = getISTDateString(now);
  const timeStr = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  }).format(now);

  return {
    dateStr,
    timeStr,
    fullStr: `${dateStr} ${timeStr} IST`
  };
}

/**
 * Calculates remaining time until the next 12:00 Midnight IST (00:00:00).
 */
export function getTimeUntilMidnightIST(): {
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
  formatted: string;
  nextMidnightISTStr: string;
} {
  const now = new Date();
  
  // Get current date string in IST
  const todayIST = getISTDateString(now); // 'YYYY-MM-DD'
  const [year, month, day] = todayIST.split('-').map(Number);
  
  // Next day in IST at 00:00:00
  // In UTC, IST is UTC + 5 hours 30 minutes.
  // Midnight IST tomorrow corresponds to: Date.UTC(year, month - 1, day + 1, 0, 0, 0) - (5.5 * 3600 * 1000)
  const nextMidnightUtcMs = Date.UTC(year, month - 1, day + 1, 0, 0, 0) - (5.5 * 3600 * 1000);
  
  const diffMs = nextMidnightUtcMs - now.getTime();
  const totalSeconds = Math.max(0, Math.floor(diffMs / 1000));
  
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  const pad = (n: number) => n.toString().padStart(2, '0');
  const formatted = `${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;
  
  return {
    hours,
    minutes,
    seconds,
    totalSeconds,
    formatted,
    nextMidnightISTStr: '12:00 AM Midnight IST'
  };
}

/**
 * Retrieves all submissions made by a user on the current IST date across ALL tracks.
 */
export function getSubmissionsTodayInIST(userId: string): AssignmentSubmission[] {
  const todayIST = getISTDateString(new Date());
  const allUserSubs = storage.getSubmissionsByUser(userId);

  return allUserSubs.filter(sub => {
    const subIST = getISTDateString(new Date(sub.submitted_at));
    return subIST === todayIST;
  });
}

/**
 * Checks the operational rule:
 * "ONLY 1 SUBMISSION 1 ASSIGNMENT A DAY FOR BOTH TRACKS.
 * Assignments will remain locked until 12 midnight IST."
 */
export function checkDailySubmissionRule(
  userId: string,
  targetAssignmentId?: string
): {
  isLockedByDailyLimit: boolean;
  hasSubmissionToday: boolean;
  todaySubmission?: AssignmentSubmission;
  timeUntilMidnight: ReturnType<typeof getTimeUntilMidnightIST>;
  message: string;
} {
  const submissionsToday = getSubmissionsTodayInIST(userId);
  const timeUntilMidnight = getTimeUntilMidnightIST();

  if (submissionsToday.length === 0) {
    return {
      isLockedByDailyLimit: false,
      hasSubmissionToday: false,
      timeUntilMidnight,
      message: 'Daily submission slot available (1 submission per day across both tracks).'
    };
  }

  const todaySub = submissionsToday[0];
  
  // If user is editing/updating their SAME assignment that was submitted today, we can permit resubmission if needed,
  // BUT the rule strictly states: "ONLY 1 SUBMISSION 1 ASSIGNMENT A DAY FOR BOTH TRACKS... and assignments will remain locked until 12 midnight IST."
  // If targetAssignmentId is different from the one submitted today, it is locked!
  const isDifferentAssignment = targetAssignmentId && todaySub.assignment_id !== targetAssignmentId;
  const isLocked = isDifferentAssignment || submissionsToday.length >= 1;

  return {
    isLockedByDailyLimit: isLocked,
    hasSubmissionToday: true,
    todaySubmission: todaySub,
    timeUntilMidnight,
    message: `Daily limit reached: You have already submitted an assignment today (${getISTDateString(new Date())}). Only 1 submission per day is allowed across both tracks. Next assignment unlocks at 12:00 Midnight IST.`
  };
}
