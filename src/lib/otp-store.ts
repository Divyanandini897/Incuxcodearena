export interface OtpRecord {
  otp: string;
  expiresAt: number;
  type: string;
  tempData?: { name: string; password: string };
}

const otpStore = new Map<string, OtpRecord>();

export function saveOtp(
  email: string,
  otp: string,
  type: string,
  tempData?: { name: string; password: string }
) {
  clearOtp(email);
  otpStore.set(email.toLowerCase(), { otp, expiresAt: Date.now() + 5 * 60 * 1000, type, tempData });
}

export function verifyOtp(
  email: string,
  otp: string,
  type: string
): { valid: boolean; reason?: string; tempData?: { name: string; password: string } } {
  const record = otpStore.get(email.toLowerCase());
  if (!record) return { valid: false, reason: 'No OTP requested for this email' };
  if (record.type !== type) return { valid: false, reason: 'OTP type mismatch' };
  if (Date.now() > record.expiresAt) {
    otpStore.delete(email.toLowerCase());
    return { valid: false, reason: 'OTP has expired. Please request a new one.' };
  }
  if (record.otp !== otp) return { valid: false, reason: 'Incorrect code, please try again' };
  otpStore.delete(email.toLowerCase());
  return { valid: true, tempData: record.tempData };
}

export function clearOtp(email: string) {
  otpStore.delete(email.toLowerCase());
}

export function getTempData(email: string) {
  const record = otpStore.get(email.toLowerCase());
  return record?.tempData;
}
