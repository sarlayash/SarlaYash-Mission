import React, { useState, useEffect } from 'react';
import { 
  X, 
  QrCode, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Copy, 
  Upload, 
  FileText,
  ExternalLink,
  Clock
} from 'lucide-react';
import { User, Track, Payment, Enrollment } from '../../types';
import { storage } from '../../lib/storage';
import { generateQrDataUrl, getUpiPaymentUri } from '../../lib/qr';

interface PaymentModalProps {
  isOpen: boolean;
  user: User;
  track: Track;
  dayNumber?: number;
  onClose: () => void;
  onPaymentSubmitted: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  user,
  track,
  dayNumber,
  onClose,
  onPaymentSubmitted
}) => {
  const settings = storage.getSettings();
  const upiId = settings.upi_id || '9873152277@kotak';
  const amount = settings.contribution_amount || 1;

  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [utrNumber, setUtrNumber] = useState<string>('');
  const [receiptFile, setReceiptFile] = useState<string | null>(null);
  const [receiptFileName, setReceiptFileName] = useState<string>('');
  const [isCopied, setIsCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successNotice, setSuccessNotice] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const upiUri = getUpiPaymentUri(upiId, amount);
      generateQrDataUrl(upiUri).then(setQrCodeUrl);
      setErrorMsg('');
      setSuccessNotice(false);
    }
  }, [isOpen, upiId, amount]);

  if (!isOpen) return null;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Receipt file must be under 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setReceiptFile(reader.result as string);
      setReceiptFileName(file.name);
      setErrorMsg('');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!utrNumber.trim()) {
      setErrorMsg('Please enter your 12-digit or alphanumeric UPI Transaction Reference (UTR).');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    setTimeout(() => {
      // 1. Ensure or create enrollment record
      let enrollment = storage.getEnrollment(user.id, track.id);
      if (!enrollment) {
        enrollment = {
          id: `enr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          user_id: user.id,
          track_id: track.id,
          enrollment_status: 'enrolled',
          payment_status: 'pending_verification',
          enrolled_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      } else {
        enrollment.payment_status = 'pending_verification';
        enrollment.updated_at = new Date().toISOString();
      }
      storage.saveEnrollment(enrollment);

      // 2. Save Payment record with Status "Pending Verification"
      const payment: Payment = {
        id: `pay-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        user_id: user.id,
        enrollment_id: enrollment.id,
        track_id: track.id,
        day_number: dayNumber,
        amount,
        currency: 'INR',
        payment_method: 'UPI',
        upi_reference: utrNumber.trim(),
        receipt_url: receiptFile || undefined,
        verification_status: 'pending_verification',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      storage.savePayment(payment);

      // 3. Log Audit
      storage.logAudit(user.id, 'PAYMENT_SUBMITTED', 'Payment', payment.id, {
        utr: utrNumber.trim(),
        amount,
        track: track.name,
        day_number: dayNumber
      });

      // 4. Save In-App Notification
      storage.saveNotification({
        id: `notif-${Date.now()}`,
        user_id: user.id,
        title: dayNumber ? `Day ${dayNumber} Fee Submitted for Verification` : 'Payment Submitted for Verification',
        body: dayNumber 
          ? `Your daily ₹${amount} fee for Day ${dayNumber} (${track.name}, UTR: ${utrNumber.trim()}) has been queued for verification by Kapil.`
          : `Your ₹${amount} contribution for ${track.name} (UTR: ${utrNumber.trim()}) is under review by administrator Kapil.`,
        type: 'assignment',
        delivery_channel: 'in_app',
        status: 'delivered',
        sent_at: new Date().toISOString(),
        created_by: 'system',
        created_at: new Date().toISOString()
      });

      setIsSubmitting(false);
      setSuccessNotice(true);
      setTimeout(() => {
        onPaymentSubmitted();
        onClose();
      }, 1500);
    }, 450);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono font-semibold text-cyan-400 uppercase tracking-wider">
              {dayNumber ? `Day ${dayNumber} Daily Contribution` : 'Contribution & Enrollment'}
            </span>
            <h2 className="text-xl font-display font-bold text-white mt-0.5">
              ₹{amount} {dayNumber ? `Mission Fee · Day ${dayNumber}` : 'Symbolic Contribution'}
            </h2>
            <p className="text-xs text-slate-400">
              Track: <strong className="text-slate-200">{track.name}</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {successNotice ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/20">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Payment Submitted for Verification</h3>
            <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
              Your UTR (<span className="font-mono text-cyan-400">{utrNumber}</span>) has been recorded as <strong>Pending Verification</strong>.
              In accordance with our strict data policy, content will be unlocked once reviewed by instructor Kapil.
            </p>
          </div>
        ) : (
          <div className="p-6 space-y-5">
            
            {/* Payment instructions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="flex flex-col items-center justify-center text-center">
                {qrCodeUrl ? (
                  <img
                    src={qrCodeUrl}
                    alt="UPI QR Code"
                    className="w-36 h-36 rounded-lg bg-white p-2 shadow-inner"
                  />
                ) : (
                  <div className="w-36 h-36 rounded-lg bg-slate-900 animate-pulse" />
                )}
                <span className="text-[10px] font-mono text-slate-400 mt-2">
                  Scan using GPay / PhonePe / Paytm / Kotak
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-mono text-slate-500 block">Payee UPI ID</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <code className="px-2 py-1 rounded bg-slate-900 text-cyan-300 font-mono text-xs border border-slate-800">
                      {upiId}
                    </code>
                    <button
                      type="button"
                      onClick={handleCopyUpi}
                      className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                      title="Copy UPI ID"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {isCopied && <span className="text-[10px] text-emerald-400 block mt-0.5">Copied to clipboard!</span>}
                </div>

                <div>
                  <span className="text-[10px] uppercase font-mono text-slate-500 block">Amount</span>
                  <p className="text-base font-bold text-white">₹{amount} INR</p>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-mono text-slate-500 block">Recipient</span>
                  <p className="text-slate-300 font-medium">SarlaYash Mission · Kapil</p>
                </div>
              </div>
            </div>

            {/* Submission Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">
                  Transaction UTR / Reference Number <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value)}
                  placeholder="e.g. 429381029384 or Kotak Ref ID"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                />
                <span className="text-[10px] text-slate-500 block mt-1">
                  Enter the 12-digit UTR shown in your payment app upon successful transfer.
                </span>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">
                  Upload Payment Screenshot (Optional)
                </label>
                <div className="relative border border-dashed border-slate-800 rounded-xl p-3 text-center hover:border-slate-700 transition-colors bg-slate-950/40">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                    <Upload className="w-4 h-4 text-cyan-400" />
                    <span>{receiptFileName ? receiptFileName : 'Choose screenshot or drop file (max 5MB)'}</span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 text-[11px] text-slate-400 space-y-1 border border-slate-800/60">
                <p className="text-slate-300 font-semibold">Strict Real Verification Rule:</p>
                <p>
                  Submitting this reference places your status in <strong>Pending Verification</strong>. We do not simulate instant confirmation; admin Kapil reviews all records to protect community integrity.
                </p>
                <p className="text-slate-500 pt-1">
                  International learners: If Indian UPI is unsupported in your country, contact <span className="text-slate-300">kapilnarula27july@gmail.com</span> for manual verification.
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl font-bold text-xs bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors shadow-lg shadow-cyan-500/20"
              >
                {isSubmitting ? 'Recording Verification Request...' : 'Submit ₹1 Payment for Verification'}
              </button>
            </form>

          </div>
        )}

      </div>
    </div>
  );
};
