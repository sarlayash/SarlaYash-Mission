import QRCode from 'qrcode';

export async function generateQrDataUrl(text: string): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 280,
      color: {
        dark: '#0B132B',
        light: '#FFFFFF'
      }
    });
  } catch (err) {
    console.error('Failed to generate QR code:', err);
    return '';
  }
}

export function getCertificateVerificationUrl(certificateNumber: string): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  return `${origin}/verify/certificate/${certificateNumber}`;
}

export function getBadgeVerificationUrl(credentialId: string): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  return `${origin}/verify/badge/${credentialId}`;
}

export function getUpiPaymentUri(upiId: string, amount: number, reference?: string): string {
  const note = encodeURIComponent('ZeroToInfinity 30Day Mission - SarlaYash Mission');
  const payee = encodeURIComponent('SarlaYash Mission');
  const refParam = reference ? `&tr=${encodeURIComponent(reference)}` : '';
  return `upi://pay?pa=${upiId}&pn=${payee}&am=${amount}&cu=INR&tn=${note}${refParam}`;
}
