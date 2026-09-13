import React, { useState } from 'react';
import { 
  Award, 
  Sparkles, 
  Bot, 
  CheckCircle2, 
  Download, 
  ExternalLink, 
  Copy, 
  QrCode, 
  ShieldCheck, 
  Printer,
  X,
  Infinity as InfinityIcon
} from 'lucide-react';
import { User, Certificate, LearnerBadge, Badge } from '../../types';
import { storage } from '../../lib/storage';
import { generateQrDataUrl, getCertificateVerificationUrl, getBadgeVerificationUrl } from '../../lib/qr';
import { StatusBadge } from '../common/StatusBadge';

interface CredentialsWalletProps {
  user: User;
  onNavigate: (route: string) => void;
}

export const CredentialsWallet: React.FC<CredentialsWalletProps> = ({ user, onNavigate }) => {
  const certificates = storage.getCertificates(user.id);
  const learnerBadges = storage.getLearnerBadges(user.id);
  const allBadges = storage.getBadges();

  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const [certQrUrl, setCertQrUrl] = useState<string>('');
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const handleInspectCertificate = async (cert: Certificate) => {
    setSelectedCert(cert);
    const url = getCertificateVerificationUrl(cert.certificate_number);
    const qr = await generateQrDataUrl(url);
    setCertQrUrl(qr);
  };

  const handleCopyLink = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(id);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <span className="text-xs font-mono font-semibold text-cyan-400 uppercase tracking-wider">
              Cryptographic Credentials
            </span>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-white mt-1">
              Learner Credentials & Badge Wallet
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Verifiable proof of real hands-on AI achievements powered by Kapil under SarlaYash Mission.
            </p>
          </div>

          <button
            onClick={() => onNavigate('/dashboard')}
            className="self-start sm:self-auto px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200"
          >
            Back to Dashboard
          </button>
        </div>

        {/* Issued Certificates Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-display font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-cyan-400" />
              Issued Certificates
            </h2>
            <span className="text-xs text-slate-400">
              {certificates.length} {certificates.length === 1 ? 'Certificate' : 'Certificates'} Issued
            </span>
          </div>

          {certificates.length === 0 ? (
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-10 text-center text-slate-400 space-y-2">
              <Award className="w-10 h-10 text-slate-600 mx-auto" />
              <h3 className="text-sm font-semibold text-slate-200">No Certificates Issued Yet</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Certificates are generated once 30-day mission completion criteria are fulfilled or reviewed by instructor Kapil. No simulated credentials are created.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {certificates.map(cert => (
                <div
                  key={cert.id}
                  className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4 hover:border-cyan-500/40 transition-all shadow-lg"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-cyan-400 font-semibold tracking-wider block">
                        Official Credential
                      </span>
                      <h3 className="text-lg font-bold text-white mt-0.5">
                        {cert.track_name_snapshot}
                      </h3>
                      <p className="text-xs text-slate-400 font-mono">
                        Number: {cert.certificate_number}
                      </p>
                    </div>
                    <StatusBadge status={cert.status} />
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                    <p className="text-slate-400">Recipient: <strong className="text-white">{cert.recipient_name_snapshot}</strong></p>
                    <p className="text-slate-400">Issue Date: <span className="text-slate-200">{new Date(cert.issue_date).toLocaleDateString()}</span></p>
                    <p className="text-slate-400">Issued By: <span className="text-cyan-400 font-semibold">{cert.issued_by}</span></p>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                    <button
                      onClick={() => handleInspectCertificate(cert)}
                      className="flex-1 py-2 rounded-xl font-semibold text-xs bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      View & Print Certificate
                    </button>
                    <button
                      onClick={() => onNavigate(`/verify/certificate/${cert.certificate_number}`)}
                      className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1"
                      title="Open Public Verification URL"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      Verify
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Digital Badges Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-display font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
              Digital Competency Badges
            </h2>
            <span className="text-xs text-slate-400">
              {learnerBadges.length} Earned
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {allBadges.map(badge => {
              const earnedRecord = learnerBadges.find(lb => lb.badge_id === badge.id && !lb.revoked_at);
              const isEarned = !!earnedRecord;

              return (
                <div
                  key={badge.id}
                  className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                    isEarned
                      ? 'bg-slate-900/90 border-cyan-500/40 shadow-md shadow-cyan-500/5'
                      : 'bg-slate-900/40 border-slate-800/80 opacity-60'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        isEarned ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-slate-800 text-slate-500'
                      }`}>
                        <Award className="w-5 h-5" />
                      </div>
                      {isEarned ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Earned
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-500">Incomplete</span>
                      )}
                    </div>

                    <div>
                      <h4 className="font-semibold text-sm text-white">{badge.name}</h4>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">{badge.description}</p>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 text-[11px] text-slate-400">
                      <span className="font-mono text-[10px] uppercase text-slate-500 block">Criteria:</span>
                      {badge.criteria}
                    </div>
                  </div>

                  {isEarned && earnedRecord && (
                    <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between text-[11px]">
                      <span className="font-mono text-cyan-300">ID: {earnedRecord.credential_id}</span>
                      <button
                        onClick={() => onNavigate(`/verify/badge/${earnedRecord.credential_id}`)}
                        className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                      >
                        Verify <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Certificate Inspection & Print Modal */}
        {selectedCert && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 overflow-y-auto">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden my-8">
              
              {/* Modal action bar */}
              <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between no-print">
                <span className="text-xs font-mono text-cyan-400 font-semibold">
                  Print-Ready Certificate View
                </span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center gap-1.5"
                  >
                    <Printer className="w-4 h-4" />
                    Print / Save as PDF
                  </button>
                  <button
                    onClick={() => setSelectedCert(null)}
                    className="p-1 rounded-lg text-slate-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Printable Certificate Frame */}
              <div className="p-8 sm:p-12 bg-white text-slate-900 font-serif relative print:p-0 print:border-none border-8 border-slate-900 m-4 rounded-xl">
                <div className="border-4 border-slate-800 p-8 sm:p-12 text-center relative space-y-6">
                  
                  {/* Watermark / Seal */}
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-12 h-12 rounded-xl bg-slate-950 text-white flex items-center justify-center">
                      <InfinityIcon className="w-7 h-7 stroke-[2.5]" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="font-sans text-xs uppercase tracking-widest text-slate-600 font-bold">
                      SarlaYash Mission · Learning Credentials
                    </p>
                    <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-950 tracking-tight">
                      Certificate of Mastery
                    </h2>
                    <p className="font-sans text-xs text-slate-500 uppercase tracking-wider">
                      Zero-To-Infinity 30-Day Learning Mission
                    </p>
                  </div>

                  <p className="font-sans text-xs text-slate-600">
                    This certifies that
                  </p>

                  <h3 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 border-b-2 border-slate-300 pb-2 inline-block px-8">
                    {selectedCert.recipient_name_snapshot}
                  </h3>

                  <p className="font-sans text-xs sm:text-sm text-slate-700 max-w-lg mx-auto leading-relaxed">
                    has successfully completed the 30-day curriculum, hands-on development challenges, and verified practical deliverables in
                  </p>

                  <p className="font-sans font-bold text-lg sm:text-xl text-blue-900 uppercase tracking-wide">
                    {selectedCert.track_name_snapshot}
                  </p>

                  <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6 font-sans text-left">
                    <div className="flex items-center gap-4">
                      {certQrUrl && (
                        <img src={certQrUrl} alt="Verification QR" className="w-20 h-20 border border-slate-300 p-1" />
                      )}
                      <div className="text-[11px] text-slate-600 space-y-0.5">
                        <p className="font-bold text-slate-900">Cryptographic Verification</p>
                        <p className="font-mono text-[10px]">No: {selectedCert.certificate_number}</p>
                        <p>Date: {new Date(selectedCert.issue_date).toLocaleDateString()}</p>
                        <p className="text-[9px] text-slate-500">Scan QR to verify in database</p>
                      </div>
                    </div>

                    <div className="text-center sm:text-right">
                      <div className="font-serif font-bold text-base text-slate-900 italic">Kapil</div>
                      <div className="w-32 h-0.5 bg-slate-800 mx-auto sm:ml-auto mt-1 mb-1" />
                      <p className="text-xs font-bold text-slate-800">Kapil</p>
                      <p className="text-[10px] text-slate-500">Founder & Instructor, SarlaYash Mission</p>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
