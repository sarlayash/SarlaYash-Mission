import React, { useState } from 'react';
import { 
  Sparkles, 
  Bot, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Calendar, 
  Compass, 
  Terminal, 
  FileCheck, 
  Award, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink,
  Code2,
  Cpu,
  Layers,
  Zap,
  Globe,
  Lock
} from 'lucide-react';
import { User, Track } from '../../types';

interface LandingPageProps {
  currentUser: User | null;
  tracks: Track[];
  onNavigate: (route: string) => void;
  onOpenLogin: (isAdmin?: boolean) => void;
  onSelectTrack: (trackSlug: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  currentUser,
  tracks,
  onNavigate,
  onOpenLogin,
  onSelectTrack
}) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Who can join the Zero-To-Infinity mission?',
      a: 'The mission is open to learners from all backgrounds: beginners, students, working engineers, educators, founders, career switchers, homemakers, and creators. No prior AI engineering background is required.'
    },
    {
      q: 'Is there an age or education requirement?',
      a: 'There is no formal educational qualification requirement. The curriculum is constructed with clear step-by-step guidance, starting with foundational first principles and advancing to production-ready agentic workflows.'
    },
    {
      q: 'Can learners join from another country?',
      a: 'Yes. The platform is open globally, subject to applicable platform and regulatory policies. While Indian UPI (9873152277@kotak) is configured for frictionless ₹1 contribution, international learners may request supported alternate contribution or verified access.'
    },
    {
      q: 'What is the contribution amount?',
      a: 'The configured contribution is ₹1 per participant per session under the SarlaYash Mission. This symbolic commitment ensures active learner dedication while remaining universally accessible.'
    },
    {
      q: 'How does payment verification work?',
      a: 'After transferring ₹1 via UPI to 9873152277@kotak, learners enter their transaction UTR (reference number) and optional receipt. The status is recorded in the database as "Pending Verification" until verified by an authorized administrator or integrated payment gateway webhook. No payment is fabricated.'
    },
    {
      q: 'What is the difference between Generative AI and Agentic AI?',
      a: 'Generative AI focuses on understanding models, context windows, prompt patterns, structured outputs, and generating code/text/multimodal assets. Agentic AI goes beyond generation to build goal-driven autonomous systems that utilize tools, memory state, planning loops, error recovery, and API integrations to execute multi-step tasks.'
    },
    {
      q: 'How do assignments work?',
      a: 'Every day provides a 10% theory briefing and a 90% hands-on practical assignment. You complete the challenge in your environment and submit your code, structured output schema, or public repository link. Progress is recorded only upon genuine submission.'
    },
    {
      q: 'How are certificates verified?',
      a: 'Every issued certificate contains an immutable certificate number and a cryptographic QR code linking to our public verification portal (/verify/certificate/[certificateNumber]). Anyone can inspect the valid status, recipient name snapshot, track, and issue timestamp.'
    },
    {
      q: 'Can I download my badge and certificate?',
      a: 'Yes. Once earned through verified criteria, digital badges and print-ready high-resolution certificates can be accessed, viewed, and downloaded directly from your Credentials Wallet.'
    },
    {
      q: 'What happens if I miss a day?',
      a: 'The curriculum is built for daily momentum, but your access remains active so you can submit makeup missions. Admin review queues remain available to help you catch up.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32 border-b border-slate-900">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-900/20 via-slate-950/0 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Header Metadata Chips */}
          <div className="flex flex-wrap items-center gap-2.5 mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              SarlaYash Mission
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Powered by <strong className="text-white">Kapil</strong>
            </span>
            <span className="text-slate-600 hidden sm:inline">•</span>
            <span className="text-xs text-slate-400 hidden sm:inline">
              ₹1 per participant per session
            </span>
            <span className="text-slate-600 hidden sm:inline">•</span>
            <span className="text-xs text-emerald-400 font-medium hidden sm:inline">
              10% Theory · 90% Hands-on Practice
            </span>
          </div>

          {/* Main Hero Typography */}
          <h1 className="font-display font-extrabold text-4xl sm:text-6xl lg:text-7xl tracking-tight text-white max-w-4xl leading-tight">
            Zero-To-Infinity
          </h1>
          <p className="mt-4 text-xl sm:text-2xl text-cyan-300/90 font-medium max-w-3xl">
            Generative AI and Agentic AI — a 30-day hands-on learning journey.
          </p>
          <p className="mt-4 text-base sm:text-lg text-slate-400 max-w-2xl leading-relaxed">
            Learn by building. Practice daily. Grow from first principles to real-world AI workflows. Designed with enterprise rigor for curious minds, engineers, and lifelong learners everywhere.
          </p>

          {/* Hero CTAs */}
          <div className="mt-8 sm:mt-10 flex flex-wrap items-center gap-4">
            {currentUser ? (
              <button
                onClick={() => onNavigate('/dashboard')}
                className="px-6 py-3.5 rounded-xl font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition-all shadow-lg shadow-cyan-500/20 flex items-center gap-2 group"
              >
                Go to My Learning Dashboard
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            ) : (
              <button
                onClick={() => onOpenLogin(false)}
                className="px-7 py-3.5 rounded-xl font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-500 hover:opacity-95 transition-all shadow-lg shadow-cyan-500/25 flex items-center gap-2 group text-sm sm:text-base"
              >
                Join the Learning Mission
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            )}

            <button
              onClick={() => onNavigate('/tracks')}
              className="px-6 py-3.5 rounded-xl font-semibold text-slate-300 hover:text-white bg-slate-900/90 hover:bg-slate-800 border border-slate-800 transition-all text-sm sm:text-base"
            >
              Explore the Tracks
            </button>
          </div>

          {/* Value Badges Banner */}
          <div className="mt-14 pt-8 border-t border-slate-900 grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="space-y-1">
              <span className="text-xs text-slate-500 font-mono uppercase tracking-wider">Commitment</span>
              <p className="text-lg font-bold text-white">30 Days</p>
              <p className="text-xs text-slate-400">Daily structured hands-on mission</p>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-slate-500 font-mono uppercase tracking-wider">Methodology</span>
              <p className="text-lg font-bold text-cyan-400">10% Theory · 90% Build</p>
              <p className="text-xs text-slate-400">Daily assignments & real feedback</p>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-slate-500 font-mono uppercase tracking-wider">Contribution</span>
              <p className="text-lg font-bold text-white">₹1 / session</p>
              <p className="text-xs text-slate-400">Transparent UPI: 9873152277@kotak</p>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-slate-500 font-mono uppercase tracking-wider">Credentials</span>
              <p className="text-lg font-bold text-white">Verified Badges & Certs</p>
              <p className="text-xs text-slate-400">Cryptographic QR verifiable</p>
            </div>
          </div>

        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-slate-900/40 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold">
              Mission Charter
            </span>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-white mt-2">
              Democratizing Frontier AI Through Real Craft
            </h2>
            <p className="mt-3 text-base text-slate-400">
              The SarlaYash Mission was founded on a simple conviction: mastering AI requires building, debugging, and deploying real systems, not passively skimming videos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: 'AI learning should be accessible',
                desc: 'Universal access with a nominal ₹1 contribution so anyone with determination can learn without arbitrary economic barriers.'
              },
              {
                title: 'Learning should be practical',
                desc: '10% concise foundational theory directly paired with 90% hands-on development in real sandboxes.'
              },
              {
                title: 'Learners should build, not merely watch',
                desc: 'Real assignments, real code artifacts, real prompt schemas, and verified project milestones every single day.'
              },
              {
                title: 'Progress should be transparent',
                desc: 'No fake statistics or inflated completion percentages. Every metric is computed strictly from database records.'
              },
              {
                title: 'Credentials should be verifiable',
                desc: 'Badges and certificates are backed by tamper-proof cryptographic verification links and readable QR codes.'
              },
              {
                title: 'A clear path to application',
                desc: 'From first principles to production pipelines: RAG, tool calling, autonomous workflows, and responsible AI safety.'
              }
            ].map((m, idx) => (
              <div key={idx} className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-6 hover:border-slate-700 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-mono font-bold text-xs mb-4">
                  0{idx + 1}
                </div>
                <h3 className="font-semibold text-base text-white mb-2">{m.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Two Parallel Tracks */}
      <section className="py-20 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold">
              Curriculum Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-white mt-2">
              Two Parallel 30-Day Learning Tracks
            </h2>
            <p className="text-sm text-slate-400 mt-3">
              Enroll in either track independently or conquer both for the Dual-Track Mastery credential.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Track 1: Generative AI */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-8 hover:border-cyan-500/50 transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-cyan-300 border border-slate-700">
                    Track 1 · 30 Days
                  </span>
                </div>

                <h3 className="font-display font-bold text-2xl text-white group-hover:text-cyan-400 transition-colors">
                  Generative AI
                </h3>
                <p className="text-xs font-mono text-cyan-400/80 mt-1 mb-4">
                  Practitioner & Production Builder
                </p>
                <p className="text-sm text-slate-300 leading-relaxed mb-6">
                  Understand, use, evaluate, and apply generative AI to create useful outputs, workflows, and solutions. Master prompt patterns, structured JSON schemas, multimodal AI, coding automation, and enterprise safety.
                </p>

                <div className="grid grid-cols-2 gap-3 text-xs text-slate-400 mb-8 pt-4 border-t border-slate-800">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                    <span>30-Day structured roadmap</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                    <span>Beginner to builder</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                    <span>10% Theory / 90% Hands-on</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                    <span>Daily assignments & review</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                    <span>Digital badges upon milestones</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                    <span>Verifiable completion cert</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => onSelectTrack('generative-ai')}
                  className="flex-1 py-3 px-4 rounded-xl font-semibold text-xs sm:text-sm bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors text-center"
                >
                  Enroll in Generative AI Track
                </button>
                <button
                  onClick={() => onNavigate('/tracks/generative-ai')}
                  className="py-3 px-4 rounded-xl font-semibold text-xs sm:text-sm bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                >
                  View Syllabus
                </button>
              </div>
            </div>

            {/* Track 2: Agentic AI */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-8 hover:border-blue-500/50 transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
                    <Bot className="w-6 h-6" />
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-blue-300 border border-slate-700">
                    Track 2 · 30 Days
                  </span>
                </div>

                <h3 className="font-display font-bold text-2xl text-white group-hover:text-blue-400 transition-colors">
                  Agentic AI
                </h3>
                <p className="text-xs font-mono text-blue-400/80 mt-1 mb-4">
                  Systems & Autonomous Architecture
                </p>
                <p className="text-sm text-slate-300 leading-relaxed mb-6">
                  Learn how AI systems use tools, context, planning, workflows, and controlled actions to accomplish meaningful tasks. Architect ReAct loops, function calling, RAG pipelines, human-in-the-loop guardrails, and multi-agent systems.
                </p>

                <div className="grid grid-cols-2 gap-3 text-xs text-slate-400 mb-8 pt-4 border-t border-slate-800">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-400" />
                    <span>30-Day structured roadmap</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-400" />
                    <span>Hands-on tool orchestration</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-400" />
                    <span>10% Theory / 90% Practice</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-400" />
                    <span>Production agent debugging</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-400" />
                    <span>Digital badges for capabilities</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-400" />
                    <span>Verifiable completion cert</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => onSelectTrack('agentic-ai')}
                  className="flex-1 py-3 px-4 rounded-xl font-semibold text-xs sm:text-sm bg-blue-600 hover:bg-blue-500 text-white transition-colors text-center"
                >
                  Enroll in Agentic AI Track
                </button>
                <button
                  onClick={() => onNavigate('/tracks/agentic-ai')}
                  className="py-3 px-4 rounded-xl font-semibold text-xs sm:text-sm bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                >
                  View Syllabus
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Learning Philosophy & How It Works */}
      <section className="py-20 bg-slate-900/30 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Philosophy Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 rounded-2xl p-8 mb-16 text-center">
            <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-semibold">
              The SarlaYash Learning Philosophy
            </span>
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 mt-4 text-sm sm:text-xl font-bold font-display text-white">
              <span className="px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700">Learn</span>
              <span className="text-cyan-400">→</span>
              <span className="px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700">Build</span>
              <span className="text-cyan-400">→</span>
              <span className="px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700">Submit</span>
              <span className="text-cyan-400">→</span>
              <span className="px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700">Review</span>
              <span className="text-cyan-400">→</span>
              <span className="px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700">Improve</span>
              <span className="text-cyan-400">→</span>
              <span className="px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">Earn</span>
            </div>
          </div>

          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold">
              Execution Roadmap
            </span>
            <h2 className="text-3xl font-display font-bold text-white mt-2">
              How the 30-Day Mission Works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'Sign in with Google', desc: 'Authenticate seamlessly using Google Sign-In. Complete your learner profile preferences.' },
              { step: '02', title: 'Choose your track', desc: 'Select Generative AI or Agentic AI (or pursue both simultaneously).' },
              { step: '03', title: '₹1 Contribution Process', desc: 'Scan UPI 9873152277@kotak, submit transaction reference (UTR) for transparent verification.' },
              { step: '04', title: 'Daily Learning Missions', desc: 'Engage with daily 10% theory briefing and 90% hands-on development challenges.' },
              { step: '05', title: 'Submit Assignments', desc: 'Upload code, prompt architectures, and links. Receive feedback from Kapil & instructors.' },
              { step: '06', title: 'Track Real Progress', desc: 'Watch your real streaks and verified completion percentage update from database records.' },
              { step: '07', title: 'Earn Badges', desc: 'Unlock milestones like Prompt Engineering Practitioner and Agentic Workflow Builder.' },
              { step: '08', title: 'Claim Credentials', desc: 'Receive your cryptographic QR verifiable completion certificate upon satisfying criteria.' }
            ].map((st, i) => (
              <div key={i} className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 hover:border-slate-700">
                <span className="text-xs font-mono text-cyan-400 font-bold">{st.step}</span>
                <h4 className="font-semibold text-sm text-white mt-1 mb-2">{st.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{st.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 border-b border-slate-800" id="faq">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold">
              Clarity & Transparency
            </span>
            <h2 className="text-3xl font-display font-bold text-white mt-2">
              Frequently Asked Questions
            </h2>
            <p className="text-xs text-slate-400 mt-2">
              Honest, transparent guidance regarding participation, contribution, assignments, and verification.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div 
                key={idx} 
                className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full text-left px-5 py-4 flex items-center justify-between text-sm font-semibold text-white hover:text-cyan-400 transition-colors"
                >
                  <span>{faq.q}</span>
                  {openFaq === idx ? (
                    <ChevronUp className="w-4 h-4 text-cyan-400 shrink-0 ml-3" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500 shrink-0 ml-3" />
                  )}
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 text-xs text-slate-300 leading-relaxed border-t border-slate-800/60 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-20 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h2 className="text-3xl sm:text-5xl font-display font-bold text-white">
            Start Your 30-Day Journey Today
          </h2>
          <p className="mt-4 text-base text-slate-400 max-w-xl mx-auto">
            Join the Zero-To-Infinity mission under SarlaYash Mission. Learn directly by building, guided by Kapil.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            {currentUser ? (
              <button
                onClick={() => onNavigate('/dashboard')}
                className="px-8 py-3.5 rounded-xl font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition-all shadow-lg shadow-cyan-500/20"
              >
                Go to Dashboard
              </button>
            ) : (
              <button
                onClick={() => onOpenLogin(false)}
                className="px-8 py-3.5 rounded-xl font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-500 hover:opacity-95 transition-all shadow-lg shadow-cyan-500/20 text-sm sm:text-base font-bold"
              >
                Sign in with Google to Begin
              </button>
            )}
            <button
              onClick={() => onNavigate('/tracks')}
              className="px-6 py-3.5 rounded-xl font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 text-sm sm:text-base"
            >
              Browse Full 30-Day Curricula
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
