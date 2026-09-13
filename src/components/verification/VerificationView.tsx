import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  XCircle, 
  CheckCircle2, 
  Award, 
  QrCode, 
  ArrowLeft, 
  ExternalLink,
  Infinity as InfinityIcon
} from 'lucide-react';
import { storage } from '../../lib/storage';
import { Certificate, LearnerBadge } from '../../types';

interface VerificationViewProps {
  type: 'certificate' | 'badge';
  identifier?: string;
  onNavigate: (route: string) => void;
}

export const VerificationView: React.FC<VerificationViewProps> = ({
  type,
  identifier,
  onNavigate
}) => {
  const [queryInput, setQueryInput] = useState(identifier || '');
  const [certRecord, setCertRecord] = useState<Certificate | null>(null);
  const [badgeRecord, setBadgeRecord] = useState<LearnerBadge | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (identifier) {
      setQueryInput(identifier);
      executeVerification(identifier);
    }
  }, [identifier, type]);

  const executeVerification = (query: string) => {
    const q = query.trim();
    if (!q) return;

    setHasSearched(true);
    if (type === 'certificate') {
      const cert = storage.getCertificateByNumber(q) || storage.getCertificates().find(c => c.id === q);
      setCertRecord(cert || null);
    } else {
      const b = storage.getLearnerBadgeByCredentialId(q) || storage.getLearnerBadges().find(b => b.id === q);
      setBadgeRecord(b || null);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeVerification(queryInput);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Navigation & Header */}
        <div>
          <button
            onClick={() => onNavigate('/')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-cyan-400 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>

          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-cyan-500/20">
              <InfinityIcon className="w-7 h-7 stroke-[2.5]" />
            </div>
            <h1 className="text-3xl font-display font-bold text-white">
              Official Credential Verification
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Zero-To-Infinity · SarlaYash Mission · Powered by Kapil
            </p>
          </div>
        </div>

        {/* Verification Search Bar */}
        <form onSubmit={handleSearchSubmit} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-wrap gap-3 items-center">
          <input
            type="text"
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            placeholder={type === 'certificate' ? "Enter Certificate Number (e.g. ZTI-GENAI-2026-001)" : "Enter Badge Credential ID (e.g. CRD-ZTI-EXP-849201)"}
            className="flex-1 min-w-[240px] bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
          />
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl font-bold text-xs bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors shadow-md shadow-cyan-500/10"
          >
            Verify Record
          </button>
        </form>

        {/* Results Container */}
        {hasSearched && (
          <div>
            {type === 'certificate' ? (
              certRecord ? (
                <div className={`border rounded-2xl p-6 sm:p-8 space-y-6 ${
                  certRecord.status === 'revoked' 
                    ? 'bg-rose-950/20 border-rose-800/60' 
                    : 'bg-slate-900/90 border-slate-800'
                }`}>
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
                    <div className="flex items-center gap-3">
                      {certRecord.status === 'issued' ? (
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                          <CheckCircle2 className="w-6 h-6" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center">
                          <XCircle className="w-6 h-6" />
                        </div>
                      )}
                      <div>
                        <h2 className="text-xl font-display font-bold text-white">
                          {certRecord.status === 'issued' ? 'Authentic Verified Certificate' : 'Revoked Credential'}
                        </h2>
                        <p className="text-xs text-slate-400 font-mono">
                          Record ID: {certRecord.certificate_number}
                        </p>
                      </div>
                    </div>

                    <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider ${
                      certRecord.status === 'issued' 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                    }`}>
                      {certRecord.status}
                    </span>
                  </div>

                  {certRecord.status === 'revoked' && (
                    <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800 text-xs text-rose-300">
                      <strong>Revocation Notice:</strong> This certificate was officially revoked. Reason: {certRecord.revocation_reason || 'Administrative revocation.'}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                      <span className="text-slate-500 uppercase font-mono text-[10px] block">Recipient</span>
                      <p className="font-semibold text-sm text-white">{certRecord.recipient_name_snapshot}</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                      <span className="text-slate-500 uppercase font-mono text-[10px] block">Track Completed</span>
                      <p className="font-semibold text-sm text-cyan-400">{certRecord.track_name_snapshot}</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                      <span className="text-slate-500 uppercase font-mono text-[10px] block">Issue Date</span>
                      <p className="text-slate-200">{new Date(certRecord.issue_date).toLocaleDateString()}</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                      <span className="text-slate-500 uppercase font-mono text-[10px] block">Issuer Authority</span>
                      <p className="text-slate-200">{certRecord.issued_by} · SarlaYash Mission</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400 leading-relaxed">
                    This cryptographic record exists in the authoritative Zero-To-Infinity platform database. Verification is evaluated live against database tables to eliminate fabricated claims.
                  </div>
                </div>
              ) : (
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 space-y-2">
                  <XCircle className="w-10 h-10 text-rose-400 mx-auto" />
                  <h3 className="text-base font-semibold text-white">Certificate Record Not Found</h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    No certificate matching "{queryInput}" exists in the official registry. Please confirm the certificate number.
                  </p>
                </div>
              )
            ) : (
              badgeRecord ? (
                <div className={`border rounded-2xl p-6 sm:p-8 space-y-6 ${
                  badgeRecord.revoked_at 
                    ? 'bg-rose-950/20 border-rose-800/60' 
                    : 'bg-slate-900/90 border-slate-800'
                }`}>
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center">
                        <Award className="w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="text-xl font-display font-bold text-white">
                          Verified Competency Badge
                        </h2>
                        <p className="text-xs text-slate-400 font-mono">
                          Credential ID: {badgeRecord.credential_id}
                        </p>
                      </div>
                    </div>

                    <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      {badgeRecord.revoked_at ? 'Revoked' : 'Active & Valid'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                      <span className="text-slate-500 uppercase font-mono text-[10px] block">Badge Category</span>
                      <p className="font-semibold text-white">
                        {storage.getBadges().find(b => b.id === badgeRecord.badge_id)?.name || badgeRecord.badge_id}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                      <span className="text-slate-500 uppercase font-mono text-[10px] block">Award Date</span>
                      <p className="text-slate-200">{new Date(badgeRecord.issued_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 space-y-2">
                  <XCircle className="w-10 h-10 text-rose-400 mx-auto" />
                  <h3 className="text-base font-semibold text-white">Badge Record Not Found</h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    No digital badge matching "{queryInput}" was found in the database.
                  </p>
                </div>
              )
            )}
          </div>
        )}

      </div>
    </div>
  );
};
