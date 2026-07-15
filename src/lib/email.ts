import { Resend } from 'resend'
import nodemailer from 'nodemailer'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

const FROM = process.env.RESEND_FROM ?? 'onboarding@resend.dev'

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

function buildOtpEmailHtml(otp: string): string {
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

function buildWelcomeEmailHtml(name: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color: #10b981;">Welcome to CodeNode!</h2>
      <p>Hi ${name},</p>
      <p>Your account has been created successfully. You can now sign in and start solving coding challenges.</p>
      <p style="margin: 24px 0;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/login"
           style="background: #10b981; color: white; text-decoration: none;
                  padding: 12px 24px; border-radius: 8px; display: inline-block;">
          Sign In
        </a>
      </p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
      <p style="color: #999; font-size: 12px;">
        If you did not create this account, please ignore this email.
      </p>
    </div>
  `;
}



export async function sendOtpEmail(
  email: string,
  otp: string
): Promise<{ success: true; previewUrl?: string } | { success: false; error: string }> {
  if (resend) {
    const { data, error } = await resend.emails.send({
      from: FROM,
      to: email,
      subject: 'Your CodeNode verification code',
      text: `Your verification code is: ${otp}\n\nThis code expires in 5 minutes.`,
      html: buildOtpEmailHtml(otp),
    });
    if (error) {
      console.error('[EMAIL] Resend error:', error);
      return { success: false, error: error.message };
    }
    console.log('[EMAIL] OTP sent via Resend (id:', data?.id, ')');
    return { success: true };
  }

  try {
    const transporter = await createTransporter();
    const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@codenode.app';

    const info = await transporter.sendMail({
      from: FROM_EMAIL,
      to: email,
      subject: 'Your CodeNode verification code',
      text: `Your verification code is: ${otp}\n\nThis code expires in 5 minutes.`,
      html: buildOtpEmailHtml(otp),
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

export async function sendWelcomeEmail(
  email: string,
  name: string
): Promise<{ success: true; previewUrl?: string } | { success: false; error: string }> {
  if (resend) {
    const { data, error } = await resend.emails.send({
      from: FROM,
      to: email,
      subject: 'Welcome to CodeNode!',
      text: `Hi ${name},\n\nYour account has been created successfully. You can now sign in and start solving coding challenges.\n\n${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/login`,
      html: buildWelcomeEmailHtml(name),
    });
    if (error) {
      console.error('[EMAIL] Resend welcome error:', error);
      return { success: false, error: error.message };
    }
    return { success: true };
  }

  try {
    const transporter = await createTransporter();
    const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@codenode.app';

    const info = await transporter.sendMail({
      from: FROM_EMAIL,
      to: email,
      subject: 'Welcome to CodeNode!',
      text: `Hi ${name},\n\nYour account has been created successfully. You can now sign in and start solving coding challenges.\n\n${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/login`,
      html: buildWelcomeEmailHtml(name),
    });

    let previewUrl: string | undefined;
    if (info.messageId) {
      const url = nodemailer.getTestMessageUrl(info);
      if (url) previewUrl = url;
    }

    return { success: true, previewUrl };
  } catch (err: any) {
    console.error('[EMAIL] Welcome email error:', err.message);
    return { success: false, error: err.message || 'Unknown email error' };
  }
}
