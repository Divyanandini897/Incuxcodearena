import nodemailer from 'nodemailer';

const PLACEHOLDER_VALUES = [
  'your.email@gmail.com',
  'your-16-char-app-password',
  'pasamformains@gmail.com',
  'PLEASE_GENERATE_APP_PASSWORD_AND_PASTE_HERE',
];

function hasRealCredentials(): boolean {
  const host = process.env.SMTP_HOST || '';
  const user = process.env.SMTP_USER || '';
  const pass = process.env.SMTP_PASSWORD || '';
  if (!host || !user || !pass) return false;
  if (PLACEHOLDER_VALUES.includes(user) || PLACEHOLDER_VALUES.includes(pass)) return false;
  return true;
}

async function createTransporter() {
  if (hasRealCredentials()) {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465',
      auth: { user: process.env.SMTP_USER!, pass: process.env.SMTP_PASSWORD! },
    });

    await transporter.verify();

    return transporter;
  }

  const testAccount = await nodemailer.createTestAccount();
  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: { user: testAccount.user, pass: testAccount.pass },
  });

  await transporter.verify();

  return transporter;
}

function buildEmailHtml(otp: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color: #10b981;">CodeNode Verification</h2>
      <p>Your verification code is:</p>
      <div style="font-size: 32px; letter-spacing: 8px; font-weight: bold; color: #10b981;
                  background: #f0fdf4; padding: 16px 24px; border-radius: 8px;
                  text-align: center; margin: 16px 0;">
        ${otp}
      </div>
      <p style="color: #666;">This code expires in <strong>5 minutes</strong>.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
      <p style="color: #999; font-size: 12px;">
        If you did not request this code, please ignore this email.
      </p>
    </div>
  `;
}

export async function sendOtpEmail(
  email: string,
  otp: string
): Promise<{ success: true; previewUrl?: string } | { success: false; error: string }> {
  try {
    const transporter = await createTransporter();
    const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@codenode.app';

    const info = await transporter.sendMail({
      from: FROM_EMAIL,
      to: email,
      subject: 'Your CodeNode verification code',
      text: `Your verification code is: ${otp}\n\nThis code expires in 5 minutes.`,
      html: buildEmailHtml(otp),
    });

    let previewUrl: string | undefined;
    if (info.messageId) {
      const url = nodemailer.getTestMessageUrl(info);
      if (url) previewUrl = url;
    }

    return { success: true, previewUrl };
  } catch (err: any) {
    console.error('[EMAIL] Nodemailer error:', err.message);
    if (err.code) console.error('[EMAIL] Error code:', err.code);
    if (err.command) console.error('[EMAIL] Failed command:', err.command);
    if (err.response) console.error('[EMAIL] Server response:', err.response);
    return { success: false, error: err.message || 'Unknown email error' };
  }
}
