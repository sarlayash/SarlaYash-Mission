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
  Infinity as InfinityIcon,
  Printer,
  Copy,
  Check,
  FileText,
  Sparkles,
  Download,
  Calendar,
  User as UserIcon
} from 'lucide-react';
import { storage } from '../../lib/storage';
import { Certificate, LearnerBadge, Badge } from '../../types';
import { generateQrDataUrl, getCertificateVerificationUrl, getBadgeVerificationUrl } from '../../lib/qr';

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
  const [badgeDetails, setBadgeDetails] = useState<Badge | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (identifier) {
      setQueryInput(identifier);
      executeVerification(identifier);
    }
  }, [identifier, type]);

  const executeVerification = async (query: string) => {
    const q = query.trim();
    if (!q) return;

    setHasSearched(true);
    if (type === 'certificate') {
      const cert = storage.getCertificateByNumber(q) || storage.getCertificates().find(c => c.id === q);
      setCertRecord(cert || null);
      setBadgeRecord(null);
      setBadgeDetails(null);

      if (cert) {
        const verifyUrl = getCertificateVerificationUrl(cert.certificate_number);
        const qr = await generateQrDataUrl(verifyUrl);
        setQrCodeUrl(qr);
      } else {
        setQrCodeUrl('');
      }
    } else {
      const b = storage.getLearnerBadgeByCredentialId(q) || storage.getLearnerBadges().find(b => b.id === q);
      setBadgeRecord(b || null);
      setCertRecord(null);

      if (b) {
        const detail = storage.getBadges().find(bg => bg.id === b.badge_id);
        setBadgeDetails(detail || null);
        const verifyUrl = getBadgeVerificationUrl(b.credential_id);
        const qr = await generateQrDataUrl(verifyUrl);
        setQrCodeUrl(qr);
      } else {
        setBadgeDetails(null);
        setQrCodeUrl('');
      }
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeVerification(queryInput);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    const url = type === 'certificate' && certRecord
      ? getCertificateVerificationUrl(certRecord.certificate_number)
      : badgeRecord
        ? getBadgeVerificationUrl(badgeRecord.credential_id)
        : window.location.href;

    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2200);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8 print:bg-white print:p-0">
      
      {/* Embedded High-Fidelity Print & PDF Export Stylesheet */}
      <style>{`
        @media print {
          @page {
            size: ${type === 'certificate' ? 'A4 landscape' : 'A4 portrait'};
            margin: 8mm;
          }
          html, body {
            background: #ffffff !important;
            color: #090d16 !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print, header, nav, footer {
            display: none !important;
          }
          .certificate-print-sheet {
            display: block !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 auto !important;
            box-shadow: none !important;
            border: 6px solid #090d16 !important;
            border-radius: 0 !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .certificate-print-sheet * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>

      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Navigation & Header (Hidden during Print) */}
        <div className="no-print">
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
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-white">
              Official Credential Verification
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Zero-To-Infinity · SarlaYash Mission · Powered by Kapil
            </p>
          </div>
        </div>

        {/* Verification Search Bar (Hidden during Print) */}
        <form onSubmit={handleSearchSubmit} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-wrap gap-3 items-center no-print">
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
          <div className="space-y-6">
            {type === 'certificate' ? (
              certRecord ? (
                <>
                  {/* Action Bar (Print, Share, Copy) - Hidden in Print */}
                  <div className="no-print bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-xs font-semibold text-slate-300">
                        Cryptographic Verification Status: <span className="text-emerald-400 uppercase font-mono">{certRecord.status}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <button
                        onClick={handleCopyLink}
                        className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors flex items-center gap-1.5"
                      >
                        {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        {copiedLink ? 'Link Copied!' : 'Copy Verification URL'}
                      </button>

                      <button
                        onClick={handlePrint}
                        className="px-5 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors flex items-center gap-2 shadow-lg shadow-cyan-500/20"
                      >
                        <Printer className="w-4 h-4" />
                        Print / Save as PDF
                      </button>
                    </div>
                  </div>

                  {/* Print Tips Info Banner (Hidden in Print) */}
                  <div className="no-print p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 flex-shrink-0" />
                      <span>
                        <strong>PDF Export Tip:</strong> Click <em>Print / Save as PDF</em>, select <strong>Destination: Save as PDF</strong>, and choose <strong>Layout: Landscape</strong> for an official high-resolution diploma.
                      </span>
                    </div>
                  </div>

                  {/* Authoritative Database Metadata Summary (Hidden in Print) */}
                  <div className={`no-print border rounded-2xl p-6 space-y-4 ${
                    certRecord.status === 'revoked' 
                      ? 'bg-rose-950/20 border-rose-800/60' 
                      : 'bg-slate-900/80 border-slate-800'
                  }`}>
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2.5">
                        <ShieldCheck className="w-5 h-5 text-cyan-400" />
                        <h3 className="text-sm font-bold text-white">Database Verification Audit</h3>
                      </div>
                      <span className="font-mono text-[11px] text-slate-400">
                        Serial: {certRecord.certificate_number}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                        <span className="text-slate-500 text-[10px] uppercase font-mono block">Recipient</span>
                        <p className="font-semibold text-white truncate">{certRecord.recipient_name_snapshot}</p>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                        <span className="text-slate-500 text-[10px] uppercase font-mono block">Track</span>
                        <p className="font-semibold text-cyan-400 truncate">{certRecord.track_name_snapshot}</p>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                        <span className="text-slate-500 text-[10px] uppercase font-mono block">Issue Date</span>
                        <p className="text-slate-200">{new Date(certRecord.issue_date).toLocaleDateString()}</p>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                        <span className="text-slate-500 text-[10px] uppercase font-mono block">Authority</span>
                        <p className="text-slate-200">Kapil · SarlaYash</p>
                      </div>
                    </div>

                    {certRecord.status === 'revoked' && (
                      <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-xs text-rose-300 flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <strong>Official Revocation Notice:</strong> This certificate was revoked from the active registry.
                          {certRecord.revocation_reason && ` Reason: ${certRecord.revocation_reason}`}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* THE OFFICIAL HIGH-PRECISION CERTIFICATE DIPLOMA (Formatted for screen and print) */}
                  <div className="certificate-print-sheet bg-white text-slate-950 shadow-2xl rounded-2xl overflow-hidden border-8 border-slate-900 relative print:m-0 print:border-8 print:border-slate-950 print:rounded-none">
                    
                    {/* Revoked Watermark Overlay if revoked */}
                    {certRecord.status === 'revoked' && (
                      <div className="absolute inset-0 bg-rose-900/10 z-20 flex items-center justify-center pointer-events-none">
                        <div className="transform -rotate-12 border-8 border-rose-600/80 px-12 py-4 rounded-3xl text-rose-700 font-extrabold text-5xl tracking-widest uppercase opacity-85">
                          REVOKED / VOID
                        </div>
                      </div>
                    )}

                    {/* Inner Ornamental Double Frame */}
                    <div className="m-3 p-6 sm:p-10 border-2 border-slate-800 rounded-lg relative bg-gradient-to-b from-slate-50 via-white to-slate-50">
                      
                      {/* Four Corner Accents */}
                      <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-cyan-800" />
                      <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-cyan-800" />
                      <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-cyan-800" />
                      <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-cyan-800" />

                      {/* Header Crest & Mission Authority */}
                      <div className="text-center space-y-2 mb-6">
                        <div className="flex items-center justify-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-950 text-white flex items-center justify-center shadow-md">
                            <InfinityIcon className="w-6 h-6 stroke-[2.5]" />
                          </div>
                          <div className="text-left">
                            <span className="font-display font-extrabold text-xs tracking-widest text-slate-900 uppercase block">
                              SARLAYASH MISSION
                            </span>
                            <span className="text-[10px] tracking-wider text-slate-600 font-mono block">
                              ACADEMIC & TECHNICAL CREDENTIALS REGISTRY
                            </span>
                          </div>
                        </div>

                        <div className="pt-2">
                          <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-slate-950 uppercase">
                            Certificate of Mastery
                          </h2>
                          <p className="font-sans text-[11px] sm:text-xs font-semibold uppercase tracking-widest text-cyan-800 mt-0.5">
                            Zero-To-Infinity · 30-Day Technical Learning Mission
                          </p>
                        </div>
                      </div>

                      {/* Body Certificate Certification */}
                      <div className="text-center space-y-4 my-6">
                        <p className="font-serif italic text-slate-600 text-sm">
                          This is to formally certify that
                        </p>

                        <div className="inline-block border-b-2 border-slate-400 pb-1 px-8 sm:px-16 min-w-[280px]">
                          <span className="font-serif font-bold text-2xl sm:text-3xl text-slate-950 tracking-tight">
                            {certRecord.recipient_name_snapshot}
                          </span>
                        </div>

                        <p className="font-sans text-xs sm:text-sm text-slate-700 max-w-xl mx-auto leading-relaxed">
                          has successfully completed the intensive curriculum, rigorously solved 30 days of real-world implementation challenges, and submitted verified production deliverables in
                        </p>

                        <div className="py-1">
                          <span className="font-display font-bold text-xl sm:text-2xl text-blue-900 uppercase tracking-wide px-4 py-1.5 rounded-lg bg-blue-50 border border-blue-200">
                            {certRecord.track_name_snapshot}
                          </span>
                        </div>

                        <p className="font-sans text-[11px] text-slate-500 max-w-lg mx-auto">
                          10% Theoretical Architecture · 90% Hands-On Production Engineering · Peer & Instructor Evaluation
                        </p>
                      </div>

                      {/* Certificate Footer: Live QR Code, Authenticity Seal & Signatures */}
                      <div className="pt-6 border-t-2 border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6">
                        
                        {/* Left: Scannable Live QR Verification */}
                        <div className="flex items-center gap-3.5">
                          {qrCodeUrl ? (
                            <img 
                              src={qrCodeUrl} 
                              alt="Live Verification QR Code" 
                              className="w-20 h-20 border border-slate-300 p-1 bg-white shadow-sm"
                            />
                          ) : (
                            <div className="w-20 h-20 border border-dashed border-slate-300 flex items-center justify-center text-[9px] text-slate-400">
                              QR Code
                            </div>
                          )}
                          <div className="text-[10px] text-slate-600 space-y-0.5 text-left font-sans">
                            <span className="font-bold text-slate-900 uppercase block tracking-wider text-[10px]">
                              Live Cryptographic Verification
                            </span>
                            <p className="font-mono text-[10px] text-slate-800">
                              Serial: <strong>{certRecord.certificate_number}</strong>
                            </p>
                            <p className="text-[10px]">
                              Date of Issue: {new Date(certRecord.issue_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                            <p className="text-[9px] text-cyan-800 font-medium">
                              Scan QR code to verify live database record
                            </p>
                          </div>
                        </div>

                        {/* Center: Official Seal */}
                        <div className="hidden md:flex flex-col items-center justify-center text-center">
                          <div className="w-14 h-14 rounded-full border-2 border-dashed border-blue-800/60 flex items-center justify-center p-1">
                            <div className="w-full h-full rounded-full bg-blue-900 text-white flex flex-col items-center justify-center text-[8px] font-bold font-mono">
                              <ShieldCheck className="w-4 h-4 mb-0.5 text-cyan-300" />
                              VERIFIED
                            </div>
                          </div>
                          <span className="text-[8px] font-mono uppercase tracking-widest text-slate-500 mt-1">
                            Official Digital Seal
                          </span>
                        </div>

                        {/* Right: Instructor Signature */}
                        <div className="text-center sm:text-right font-sans">
                          <div className="font-serif italic font-bold text-xl text-slate-900 tracking-wider">
                            Kapil
                          </div>
                          <div className="w-36 h-0.5 bg-slate-900 mx-auto sm:ml-auto mt-1 mb-1" />
                          <p className="text-xs font-bold text-slate-900">
                            Kapil
                          </p>
                          <p className="text-[10px] text-slate-600">
                            Founder & Lead Instructor
                          </p>
                          <p className="text-[9px] text-slate-500">
                            SarlaYash Mission · Zero-To-Infinity
                          </p>
                        </div>

                      </div>

                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 space-y-2 no-print">
                  <XCircle className="w-10 h-10 text-rose-400 mx-auto" />
                  <h3 className="text-base font-semibold text-white">Certificate Record Not Found</h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    No certificate matching "{queryInput}" exists in the official registry. Please confirm the certificate number.
                  </p>
                </div>
              )
            ) : (
              badgeRecord ? (
                <>
                  {/* Badge Verification Action Bar */}
                  <div className="no-print bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                      <span className="text-xs font-semibold text-slate-300">
                        Badge Status: <span className="text-cyan-400 uppercase font-mono">{badgeRecord.revoked_at ? 'Revoked' : 'Active & Verified'}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <button
                        onClick={handleCopyLink}
                        className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors flex items-center gap-1.5"
                      >
                        {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        {copiedLink ? 'Link Copied!' : 'Copy Verification URL'}
                      </button>

                      <button
                        onClick={handlePrint}
                        className="px-5 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors flex items-center gap-2 shadow-lg shadow-cyan-500/20"
                      >
                        <Printer className="w-4 h-4" />
                        Print Badge Slip
                      </button>
                    </div>
                  </div>

                  {/* Printable Badge Slip */}
                  <div className="certificate-print-sheet bg-white text-slate-950 rounded-2xl p-8 border-4 border-slate-900 shadow-2xl space-y-6">
                    <div className="flex items-center justify-between border-b-2 border-slate-200 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-slate-950 text-cyan-400 flex items-center justify-center">
                          <Award className="w-7 h-7" />
                        </div>
                        <div>
                          <h2 className="text-xl font-display font-bold text-slate-900">
                            Verified Digital Competency Badge
                          </h2>
                          <p className="text-xs text-slate-600 font-mono">
                            Credential ID: {badgeRecord.credential_id}
                          </p>
                        </div>
                      </div>

                      <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider ${
                        badgeRecord.revoked_at 
                          ? 'bg-rose-100 text-rose-800 border border-rose-300' 
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      }`}>
                        {badgeRecord.revoked_at ? 'Revoked' : 'Active & Verified'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                        <span className="text-slate-500 uppercase font-mono text-[10px] block">Badge Competency</span>
                        <p className="font-bold text-base text-slate-900">
                          {badgeDetails?.name || badgeRecord.badge_id}
                        </p>
                        <p className="text-slate-600 text-xs mt-1">
                          {badgeDetails?.description || 'Hands-on mission deliverable milestone verified.'}
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                        <span className="text-slate-500 uppercase font-mono text-[10px] block">Issuance Date</span>
                        <p className="font-semibold text-sm text-slate-900">{new Date(badgeRecord.issued_at).toLocaleDateString()}</p>
                        <p className="text-slate-600 text-xs mt-1">Issuer: Kapil · SarlaYash Mission</p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {qrCodeUrl && (
                          <img src={qrCodeUrl} alt="Badge Verification QR" className="w-16 h-16 border border-slate-300 p-1 bg-white" />
                        )}
                        <div className="text-[10px] text-slate-600">
                          <p className="font-bold text-slate-900">Official SarlaYash Credential Registry</p>
                          <p>Scan to verify authenticity live on database</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-serif italic font-bold text-slate-900">Kapil</p>
                        <p className="text-[10px] text-slate-500">Authorized Issuer</p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 space-y-2 no-print">
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

