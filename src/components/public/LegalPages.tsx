import React from 'react';
import { Shield, Lock, FileText, CheckCircle2, ArrowLeft, ExternalLink, HelpCircle } from 'lucide-react';

interface LegalPageProps {
  pageType: 'terms' | 'privacy' | 'payment-policy' | 'about' | 'how-it-works' | 'faq';
  onNavigate: (route: string) => void;
}

export const LegalPages: React.FC<LegalPageProps> = ({ pageType, onNavigate }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        <button
          onClick={() => onNavigate('/')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-cyan-400 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </button>

        {pageType === 'terms' && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-8 space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <span className="text-xs font-mono text-cyan-400 font-semibold uppercase tracking-wider">Zero-To-Infinity</span>
              <h1 className="text-3xl font-display font-bold text-white mt-1">Terms of Participation</h1>
              <p className="text-xs text-slate-400 mt-1">Last revised: September 2026 · SarlaYash Mission</p>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
              <section className="space-y-2">
                <h3 className="font-semibold text-base text-white">1. Mission Purpose and Scope</h3>
                <p>
                  Zero-To-Infinity is an independent learning mission organized under the SarlaYash Mission and powered by Kapil. The platform offers structured 30-day practical educational curricula in Generative AI and Agentic AI.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-semibold text-base text-white">2. Learner Responsibilities & Code of Conduct</h3>
                <p>
                  Learners agree to submit only their own authentic work for daily assignments and capstone deliverables. Plagiarizing assignments, submitting malicious code/payloads, or attempting unauthorized access to other learners' accounts or administrative endpoints constitutes grounds for immediate deactivation.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-semibold text-base text-white">3. Non-Accreditation Notice</h3>
                <p>
                  Certificates issued by Zero-To-Infinity / SarlaYash Mission attest to the successful completion of the hands-on 30-day curriculum and practical deliverables. They do not constitute formal university degrees, government-sponsored diplomas, or statutory licensing certifications.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-semibold text-base text-white">4. Intellectual Property</h3>
                <p>
                  Learners retain full ownership of the intellectual property in the original projects, code, and prompt libraries they create during the mission. Curriculum materials, documentation, and assessment rubrics are protected educational property of SarlaYash Mission.
                </p>
              </section>
            </div>
          </div>
        )}

        {pageType === 'privacy' && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-8 space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <span className="text-xs font-mono text-cyan-400 font-semibold uppercase tracking-wider">Zero-To-Infinity</span>
              <h1 className="text-3xl font-display font-bold text-white mt-1">Privacy Policy & Data Rights</h1>
              <p className="text-xs text-slate-400 mt-1">SarlaYash Mission · Principle of Minimal Data Collection</p>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
              <section className="space-y-2">
                <h3 className="font-semibold text-base text-white">1. Real Data & No Fabricated Statistics</h3>
                <p>
                  In accordance with our strict data principles, we do not fabricate learner metrics, completion rates, or telemetry. We collect only what is strictly necessary to administer the learning journey.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-semibold text-base text-white">2. Data We Collect</h3>
                <ul className="list-disc pl-5 space-y-1 text-slate-400">
                  <li><strong>Identity Information:</strong> Name, Google email address, and avatar URL provided via authorized Google Sign-In.</li>
                  <li><strong>Profile Preferences:</strong> Country, preferred timezone, and accessibility preferences.</li>
                  <li><strong>Academic Records:</strong> Assignment submissions, source code links, instructor feedback, completion milestones, and issued badges/certificates.</li>
                  <li><strong>Contribution Records:</strong> Transaction UTR references and receipt metadata required for payment verification.</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className="font-semibold text-base text-white">3. Public Verification Display</h3>
                <p>
                  Public credential verification pages (/verify/certificate/[number] and /verify/badge/[id]) display only the verified recipient name snapshot, track title, and issuance date. Learner email addresses and private submissions are never exposed publicly.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-semibold text-base text-white">4. Learner Data Control</h3>
                <p>
                  Learners can export their activity data or request account deactivation at any time by contacting the mission administrator or accessing platform settings.
                </p>
              </section>
            </div>
          </div>
        )}

        {pageType === 'payment-policy' && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-8 space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <span className="text-xs font-mono text-cyan-400 font-semibold uppercase tracking-wider">Zero-To-Infinity</span>
              <h1 className="text-3xl font-display font-bold text-white mt-1">Payment & Contribution Policy</h1>
              <p className="text-xs text-slate-400 mt-1">Transparent Contribution Model · SarlaYash Mission</p>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
              <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-800/40 text-cyan-200">
                <p className="font-semibold text-white mb-1">Configured Contribution</p>
                <p className="text-xs">
                  ₹1 per participant per session · Official UPI ID: <strong className="font-mono text-white">9873152277@kotak</strong>
                </p>
              </div>

              <section className="space-y-2">
                <h3 className="font-semibold text-base text-white">1. Verification Workflow</h3>
                <p>
                  To prevent unauthorized access or simulated claims, payments are not automatically marked as verified upon submission of a screenshot alone. Each transaction UTR reference is reviewed by an authorized administrator or verified via a secure provider webhook.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-semibold text-base text-white">2. No Silent Recurring Charges</h3>
                <p>
                  We never store sensitive banking credentials or credit card numbers. There are no hidden fees, recurring auto-debits, or silent renewals.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-semibold text-base text-white">3. International Learners</h3>
                <p>
                  Indian UPI is the primary rail configured for seamless ₹1 transfers. International learners whose payment providers do not support Indian UPI handles may request alternative supported access or manual clearance through the program policy.
                </p>
              </section>
            </div>
          </div>
        )}

        {pageType === 'about' && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-8 space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <span className="text-xs font-mono text-cyan-400 font-semibold uppercase tracking-wider">Mission Leadership</span>
              <h1 className="text-3xl font-display font-bold text-white mt-1">About Zero-To-Infinity</h1>
              <p className="text-xs text-slate-400 mt-1">Powered by Kapil · Under SarlaYash Mission</p>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
              <p>
                Zero-To-Infinity was created to solve a critical dilemma in modern technical education: while Generative AI and Agentic AI are reshaping global industry, most online courses remain superficial video lectures without genuine hands-on engineering.
              </p>
              <p>
                Under the <strong>SarlaYash Mission</strong>, led by <strong>Kapil</strong>, we flipped the paradigm: <strong>10% foundational theory + 90% hands-on building</strong>. Every learner writes code, configures agents, debugs tool-calling loops, and deploys practical workflows.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <h4 className="font-semibold text-white text-sm">Enterprise Quality</h4>
                  <p className="text-xs text-slate-400 mt-1">Built to the standard expected of Fortune 500 engineering and workforce-transformation programs.</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <h4 className="font-semibold text-white text-sm">True Accessibility</h4>
                  <p className="text-xs text-slate-400 mt-1">No artificial educational gates, no age discrimination, and a symbolic ₹1 contribution.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {pageType === 'how-it-works' && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-8 space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <span className="text-xs font-mono text-cyan-400 font-semibold uppercase tracking-wider">Daily Rhythm</span>
              <h1 className="text-3xl font-display font-bold text-white mt-1">How the 30-Day Mission Works</h1>
              <p className="text-xs text-slate-400 mt-1">Structured, disciplined, hands-on growth</p>
            </div>

            <div className="space-y-6 text-xs sm:text-sm text-slate-300">
              {[
                { title: 'Step 1: Sign in with Google Only', desc: 'Authentication requires Google OAuth to ensure genuine learner identity without vulnerable password handling.' },
                { title: 'Step 2: Choose Your Track', desc: 'Select Generative AI (Practitioner & Builder) or Agentic AI (Systems & Architecture), or complete both in parallel.' },
                { title: 'Step 3: ₹1 Contribution Process', desc: 'Scan UPI 9873152277@kotak, submit your transaction UTR, and your enrollment transitions to Pending Verification.' },
                { title: 'Step 4: Daily Learning Missions', desc: 'Receive each day’s 10% theory briefing, followed by 90% practical hands-on challenge.' },
                { title: 'Step 5: Submit Authentic Work', desc: 'Submit code, schemas, and links directly in the assignment console for instructor evaluation.' },
                { title: 'Step 6: Instructor Review & Feedback', desc: 'Instructor Kapil reviews submissions, provides feedback, and updates your progress engine.' },
                { title: 'Step 7: Earn Cryptographic Credentials', desc: 'Unlock digital badges for key competencies and receive a print-ready QR verifiable certificate upon completion.' }
              ].map((step, idx) => (
                <div key={idx} className="flex gap-4 p-4 rounded-xl bg-slate-950 border border-slate-800/80">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-mono font-bold shrink-0">
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-sm">{step.title}</h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
