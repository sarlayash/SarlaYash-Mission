import { jsPDF } from 'jspdf';
import { User, Track, Enrollment, AssignmentSubmission, Certificate, LearnerBadge, TrackDay, Assignment } from '../types';
import { storage } from './storage';

export interface ReportData {
  user: User;
  enrollments: Enrollment[];
  submissions: AssignmentSubmission[];
  certificates: Certificate[];
  learnerBadges: LearnerBadge[];
  trackStats: {
    track: Track;
    enrollment: Enrollment | undefined;
    progress: {
      completedDays: number;
      totalDays: number;
      percentage: number;
      submittedAssignments: number;
      pendingAssignments: number;
      currentDay: number;
      streakDays: number;
      lastActivity: string | null;
    };
  }[];
  overallPercentage: number;
  totalCompletedDays: number;
  maxStreak: number;
}

export function generateLearnerReportPdf(data: ReportData): void {
  const { 
    user, 
    submissions, 
    certificates, 
    learnerBadges, 
    trackStats, 
    overallPercentage, 
    totalCompletedDays,
    maxStreak 
  } = data;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2; // 182mm
  let y = margin;

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - 16) {
      doc.addPage();
      y = margin;
      drawPageHeaderMini();
    }
  };

  const drawPageHeaderMini = () => {
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(margin, y, contentWidth, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text('ZERO-TO-INFINITY LEARNING MISSION · PROGRESS & ASSIGNMENT REPORT', margin + 3, y + 5.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text(user.display_name, pageWidth - margin - 3, y + 5.5, { align: 'right' });
    y += 12;
  };

  // ==========================================
  // PAGE 1: COVER / HEADER BANNER
  // ==========================================
  // Header background block
  doc.setFillColor(15, 23, 42); // Slate-900
  doc.roundedRect(margin, y, contentWidth, 34, 3, 3, 'F');

  // Accent line
  doc.setFillColor(6, 182, 212); // Cyan-500
  doc.rect(margin, y + 33, contentWidth, 1.2, 'F');

  // Brand text inside banner
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(6, 182, 212); // Cyan
  doc.text('SARLAYASH MISSION · 30-DAY LEARNING CURRICULUM', margin + 6, y + 8);

  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text('Learner Progress & Assignment Deliverables Report', margin + 6, y + 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(203, 213, 225); // Slate-300
  doc.text('10% Theory · 90% Hands-On Building · Instructor-Evaluated Milestone Portfolio', margin + 6, y + 23);

  const reportDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(`Generated: ${reportDate} | Ref: RPT-ZTI-${user.id.slice(-6).toUpperCase()}`, margin + 6, y + 29);

  y += 40;

  // ==========================================
  // SECTION 1: LEARNER PROFILE CARD
  // ==========================================
  doc.setFillColor(248, 250, 252); // Slate-50
  doc.setDrawColor(226, 232, 240); // Slate-200
  doc.roundedRect(margin, y, contentWidth, 24, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(user.display_name, margin + 5, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Email: ${user.email}`, margin + 5, y + 13);
  doc.text(`Authentication: Verified Google Identity (${user.auth_provider})`, margin + 5, y + 18.5);

  // Right side of learner card
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(`Role: ${user.role.toUpperCase()}`, margin + 110, y + 7);
  doc.text(`Email Verified: ${user.email_verified ? 'YES (Verified via Google)' : 'Verification Pending'}`, margin + 110, y + 13);
  const registeredDate = user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Active';
  doc.text(`Enrolled On: ${registeredDate}`, margin + 110, y + 18.5);

  y += 29;

  // ==========================================
  // SECTION 2: KEY PERFORMANCE METRICS
  // ==========================================
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('Mission Milestone Summary', margin, y + 4);
  y += 7;

  const cardWidth = (contentWidth - 9) / 4; // 4 columns
  const cardHeight = 20;

  const metrics = [
    { label: 'OVERALL PROGRESS', value: `${overallPercentage}%`, sub: `${totalCompletedDays}/30 Days Done`, color: [6, 182, 212] },
    { label: 'REAL STREAK', value: `${maxStreak} ${maxStreak === 1 ? 'Day' : 'Days'}`, sub: 'Active Engagement', color: [245, 158, 11] },
    { label: 'SUBMITTED WORKS', value: `${submissions.length}`, sub: 'Practical Challenges', color: [16, 185, 129] },
    { label: 'CREDENTIALS', value: `${certificates.length + learnerBadges.length}`, sub: `${certificates.length} Certs, ${learnerBadges.length} Badges`, color: [99, 102, 241] }
  ];

  metrics.forEach((m, idx) => {
    const cardX = margin + idx * (cardWidth + 3);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(cardX, y, cardWidth, cardHeight, 2, 2, 'FD');

    // Colored top border
    doc.setFillColor(m.color[0], m.color[1], m.color[2]);
    doc.rect(cardX, y, cardWidth, 1.2, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(m.label, cardX + 3, y + 5.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(15, 23, 42);
    doc.text(m.value, cardX + 3, y + 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(m.sub, cardX + 3, y + 17);
  });

  y += cardHeight + 6;

  // ==========================================
  // SECTION 3: TRACK-BY-TRACK BREAKDOWN
  // ==========================================
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('30-Day Track Completion Status', margin, y + 4);
  y += 7;

  trackStats.forEach((t) => {
    const isEnrolled = !!t.enrollment;
    doc.setFillColor(isEnrolled ? 255 : 250, 250, 250);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, y, contentWidth, 23, 2, 2, 'FD');

    // Track icon/pill indicator
    const trackColor = t.track.slug === 'generative-ai' ? [6, 182, 212] : [59, 130, 246];
    doc.setFillColor(trackColor[0], trackColor[1], trackColor[2]);
    doc.rect(margin, y, 2.5, 23, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(t.track.name, margin + 6, y + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(`Status: ${isEnrolled ? 'Enrolled & Active' : 'Not Enrolled'} | Fee: ₹1/session via UPI`, margin + 6, y + 11);

    if (isEnrolled) {
      doc.text(
        `Completed: ${t.progress.completedDays} of ${t.progress.totalDays} days | Submissions: ${t.progress.submittedAssignments} | Current Day: Day ${t.progress.currentDay}`,
        margin + 6,
        y + 16
      );

      // Progress bar
      const barWidth = 45;
      const barX = pageWidth - margin - barWidth - 5;
      const barY = y + 8;
      doc.setFillColor(226, 232, 240);
      doc.roundedRect(barX, barY, barWidth, 3.5, 1, 1, 'F');
      
      const fillWidth = Math.max(1, (barWidth * t.progress.percentage) / 100);
      doc.setFillColor(trackColor[0], trackColor[1], trackColor[2]);
      doc.roundedRect(barX, barY, fillWidth, 3.5, 1, 1, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      doc.text(`${t.progress.percentage}%`, barX + barWidth + 2, barY + 3);
    } else {
      doc.text('Enrollment available via UPI ₹1 payment to 9873152277@kotak.', margin + 6, y + 16);
    }

    y += 26;
  });

  y += 2;

  // ==========================================
  // SECTION 4: COMPLETED ASSIGNMENTS & DELIVERABLES
  // ==========================================
  checkPageBreak(30);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('Completed Assignments & Practical Deliverables', margin, y + 4);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Comprehensive log of hands-on challenges, submissions, instructor reviews, and grades.', margin, y + 9);
  y += 12;

  if (submissions.length === 0) {
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, y, contentWidth, 22, 2, 2, 'FD');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text('No assignment submissions recorded yet.', margin + 6, y + 9);
    doc.setFontSize(8);
    doc.text('Complete daily hands-on challenges and submit deliverables via the Assignment Center.', margin + 6, y + 15);
    y += 26;
  } else {
    // Sort submissions: latest first
    const sortedSubmissions = [...submissions].sort(
      (a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()
    );

    // Table Header
    doc.setFillColor(15, 23, 42);
    doc.rect(margin, y, contentWidth, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(255, 255, 255);
    doc.text('MISSION / CHALLENGE TITLE', margin + 3, y + 5);
    doc.text('DATE', margin + 98, y + 5);
    doc.text('STATUS', margin + 125, y + 5);
    doc.text('GRADE / REVIEW', margin + 152, y + 5);
    y += 7;

    sortedSubmissions.forEach((sub, idx) => {
      const assignment = storage.getAssignmentById(sub.assignment_id);
      const track = assignment ? storage.getTrack(assignment.track_id) : undefined;
      const trackDay = assignment ? storage.getTrackDays().find(d => d.id === assignment.track_day_id) : undefined;

      const trackTitle = track?.name || '30-Day Mission';
      const dayNum = assignment?.day_number || trackDay?.day_number || '?';
      const assignTitle = trackDay?.title || assignment?.title || 'Practical Challenge';

      // Estimate height needed for this row (depends on whether feedback is present)
      const hasFeedback = !!sub.feedback;
      const rowHeight = hasFeedback ? 20 : 12;

      checkPageBreak(rowHeight + 2);

      // Zebra striping
      doc.setFillColor(idx % 2 === 0 ? 255 : 250, idx % 2 === 0 ? 255 : 250, idx % 2 === 0 ? 255 : 252);
      doc.setDrawColor(226, 232, 240);
      doc.rect(margin, y, contentWidth, rowHeight, 'FD');

      // Mission title & Track
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(15, 23, 42);
      const truncatedTitle = assignTitle.length > 50 ? assignTitle.slice(0, 48) + '...' : assignTitle;
      doc.text(`Day ${dayNum}: ${truncatedTitle}`, margin + 3, y + 4.5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text(trackTitle, margin + 3, y + 8.5);

      // Submission Date
      const subDate = new Date(sub.submitted_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
      doc.text(subDate, margin + 98, y + 5.5);

      // Status Pill
      let statusText = 'Submitted';
      let statusBg: [number, number, number] = [224, 231, 255]; // indigo
      let statusFg: [number, number, number] = [67, 56, 202];

      if (sub.status === 'reviewed') {
        statusText = 'Reviewed & Approved';
        statusBg = [209, 250, 229]; // emerald
        statusFg = [6, 95, 70];
      } else if (sub.status === 'needs_revision') {
        statusText = 'Revision Requested';
        statusBg = [254, 243, 199]; // amber
        statusFg = [146, 64, 14];
      }

      doc.setFillColor(statusBg[0], statusBg[1], statusBg[2]);
      doc.roundedRect(margin + 124, y + 2, 24, 4.5, 1, 1, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6);
      doc.setTextColor(statusFg[0], statusFg[1], statusFg[2]);
      doc.text(statusText, margin + 125.5, y + 5);

      // Grade
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(15, 23, 42);
      if (sub.grade_score !== undefined && sub.grade_score !== null) {
        doc.text(`${sub.grade_score} / 100`, margin + 152, y + 5.5);
      } else {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(148, 163, 184);
        doc.text('Pending Review', margin + 152, y + 5.5);
      }

      // Feedback row if present
      if (hasFeedback) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(7);
        doc.setTextColor(71, 85, 105);
        const feedbackTrunc = sub.feedback!.length > 110 ? sub.feedback!.slice(0, 107) + '...' : sub.feedback!;
        doc.text(`Instructor Review: "${feedbackTrunc}"`, margin + 3, y + 14);
      }

      y += rowHeight;
    });

    y += 4;
  }

  // ==========================================
  // SECTION 5: CREDENTIALS & CERTIFICATES EARNED
  // ==========================================
  if (certificates.length > 0 || learnerBadges.length > 0) {
    checkPageBreak(30);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('Issued Certificates & Competency Badges', margin, y + 4);
    y += 7;

    if (certificates.length > 0) {
      certificates.forEach(c => {
        doc.setFillColor(240, 253, 250); // teal-50
        doc.setDrawColor(204, 251, 241);
        doc.roundedRect(margin, y, contentWidth, 14, 2, 2, 'FD');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(15, 23, 42);
        doc.text(`Certificate of Mastery: ${c.track_name_snapshot}`, margin + 4, y + 5);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(100, 116, 139);
        doc.text(`Certificate No: ${c.certificate_number} | Issue Date: ${new Date(c.issue_date).toLocaleDateString()}`, margin + 4, y + 10);
        
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(13, 148, 136);
        doc.text('VERIFIED AUTHENTIC', pageWidth - margin - 35, y + 7.5);

        y += 17;
      });
    }

    if (learnerBadges.length > 0) {
      const allBadgeDefs = storage.getBadges();
      learnerBadges.forEach(lb => {
        const bDef = allBadgeDefs.find(b => b.id === lb.badge_id);
        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(226, 232, 240);
        doc.roundedRect(margin, y, contentWidth, 12, 1.5, 1.5, 'FD');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(15, 23, 42);
        doc.text(`Badge: ${bDef?.name || 'Competency Badge'}`, margin + 4, y + 5);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(100, 116, 139);
        doc.text(`Credential ID: ${lb.credential_id} | Awarded: ${new Date(lb.issued_at).toLocaleDateString()}`, margin + 4, y + 9);

        y += 14;
      });
    }
  }

  // ==========================================
  // SECTION 6: INSTRUCTOR VERIFICATION SIGN-OFF
  // ==========================================
  checkPageBreak(32);

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, 24, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Instructor Verification & Audit Guarantee', margin + 4, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(
    'This progress report is an authentic transcript of hands-on deliverables evaluated by Kapil under the SarlaYash Mission.',
    margin + 4,
    y + 11
  );
  doc.text(
    'All deliverables adhere to the 10% Theory · 90% Hands-On Building doctrine. Questions or verification: kapilnarula27july@gmail.com',
    margin + 4,
    y + 16
  );

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Kapil Narula', pageWidth - margin - 35, y + 16);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Founder & Lead Instructor', pageWidth - margin - 35, y + 20);

  // ==========================================
  // FOOTER & PAGE NUMBERING (ALL PAGES)
  // ==========================================
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, pageHeight - 11, pageWidth - margin, pageHeight - 11);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(
      'Zero-To-Infinity 30-Day Mission · Generative AI & Agentic AI · https://ai.studio/build',
      margin,
      pageHeight - 7
    );
    doc.text(
      `Page ${i} of ${totalPages}`,
      pageWidth - margin,
      pageHeight - 7,
      { align: 'right' }
    );
  }

  // Save the PDF
  const sanitizedName = user.display_name.replace(/[^a-zA-Z0-9_-]/g, '_');
  doc.save(`ZeroToInfinity_Report_${sanitizedName}.pdf`);
}
