import React from 'react';
import { Infinity as InfinityIcon, ShieldCheck, QrCode, Heart, ExternalLink } from 'lucide-react';

interface FooterProps {
  onNavigate: (route: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 text-sm no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          
          {/* Brand Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white">
                <InfinityIcon className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="font-display font-bold text-lg text-white">ZERO-TO-INFINITY</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Generative AI and Agentic AI — a rigorous 30-day hands-on mission. Learn by building. Practice daily. Grow from first principles to production systems.
            </p>
            <div className="pt-2 text-xs text-slate-300">
              <p className="font-medium text-white">SarlaYash Mission</p>
              <p className="text-slate-400">Founder & Instructor: <span className="text-cyan-400 font-semibold">Kapil</span></p>
            </div>
          </div>

          {/* Curriculum Tracks */}
          <div>
            <h4 className="font-semibold text-white text-xs uppercase tracking-wider mb-4">30-Day Missions</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button 
                  onClick={() => onNavigate('/tracks/generative-ai')}
                  className="hover:text-cyan-400 transition-colors text-left"
                >
                  Track 1: Generative AI (30 Days)
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('/tracks/agentic-ai')}
                  className="hover:text-cyan-400 transition-colors text-left"
                >
                  Track 2: Agentic AI (30 Days)
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('/how-it-works')}
                  className="hover:text-cyan-400 transition-colors text-left"
                >
                  How the Mission Works
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('/tracks')}
                  className="hover:text-cyan-400 transition-colors text-left"
                >
                  Curriculum Overview
                </button>
              </li>
            </ul>
          </div>

          {/* Contribution & UPI */}
          <div>
            <h4 className="font-semibold text-white text-xs uppercase tracking-wider mb-4">Contribution & Access</h4>
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-xs space-y-2">
              <div className="flex items-center justify-between text-slate-300">
                <span>Contribution:</span>
                <span className="font-bold text-white">₹1 / session</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>UPI ID:</span>
                <span className="font-mono text-cyan-400 select-all">9873152277@kotak</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug pt-1 border-t border-slate-800">
                Accessible to learners from all backgrounds. Transparent manual & gateway verification.
              </p>
            </div>
          </div>

          {/* Verification & Compliance */}
          <div>
            <h4 className="font-semibold text-white text-xs uppercase tracking-wider mb-4">Verification & Policies</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button 
                  onClick={() => onNavigate('/verify')}
                  className="hover:text-cyan-400 transition-colors text-left flex items-center gap-1.5"
                >
                  <QrCode className="w-3.5 h-3.5 text-cyan-400" />
                  QR Credential Verification
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('/terms')}
                  className="hover:text-cyan-400 transition-colors text-left"
                >
                  Terms of Participation
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('/privacy')}
                  className="hover:text-cyan-400 transition-colors text-left"
                >
                  Privacy Policy & Data Rights
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('/payment-policy')}
                  className="hover:text-cyan-400 transition-colors text-left"
                >
                  Contribution & Verification Policy
                </button>
              </li>
            </ul>
          </div>

        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Zero-To-Infinity · SarlaYash Mission. Built for practical AI capability.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>10% Theory · 90% Hands-on</span>
            <span>•</span>
            <span>Real Database Backed</span>
            <span>•</span>
            <span>Non-accredited independent workforce certification</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
