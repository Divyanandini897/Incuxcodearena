import nodemailer from 'nodemailer'

const CONNECT_TIMEOUT_MS = 15000
const SEND_TIMEOUT_MS = 25000

const PLACEHOLDER_VALUES = [
  'your.email@gmail.com',
  'your-16-char-app-password',
  'pasamformains@gmail.com',
  'PLEASE_GENERATE_APP_PASSWORD_AND_PASTE_HERE',
]

function hasRealCredentials(): boolean {
  const host = process.env.SMTP_HOST || ''
  const user = process.env.SMTP_USER || ''
  const pass = process.env.SMTP_PASSWORD || ''
  if (!host || !user || !pass) return false
  if (PLACEHOLDER_VALUES.includes(user) || PLACEHOLDER_VALUES.includes(pass)) return false
  return true
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
    promise.then(
      (value) => {
        clearTimeout(timer)
        resolve(value)
      },
      (error) => {
        clearTimeout(timer)
        reject(error)
      },
    )
  })
}

function createSmtpTransport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465',
    auth: { user: process.env.SMTP_USER!, pass: process.env.SMTP_PASSWORD! },
    connectionTimeout: CONNECT_TIMEOUT_MS,
    greetingTimeout: CONNECT_TIMEOUT_MS,
    socketTimeout: SEND_TIMEOUT_MS,
  })
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
  `
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
  `
}

interface MailPayload {
  to: string
  subject: string
  text: string
  html: string
}

async function sendMail(
  payload: MailPayload,
): Promise<{ success: true; previewUrl?: string } | { success: false; error: string }> {
  try {
    if (!hasRealCredentials()) {
      return { success: false, error: 'SMTP credentials not configured' }
    }

    const transporter = await withTimeout(createSmtpTransport(), SEND_TIMEOUT_MS, 'SMTP connect')
    const FROM_EMAIL = process.env.FROM_EMAIL || process.env.SMTP_USER || 'noreply@codenode.app'

    const info = await withTimeout(
      transporter.sendMail({ from: FROM_EMAIL, ...payload }),
      SEND_TIMEOUT_MS,
      'SMTP send',
    )

    const previewUrl = nodemailer.getTestMessageUrl(info) || undefined
    return { success: true, previewUrl }
  } catch (err: any) {
    console.error('[EMAIL] SMTP error:', err?.message || err)
    if (err?.code) console.error('[EMAIL] SMTP error code:', err.code)
    if (err?.command) console.error('[EMAIL] SMTP failed command:', err.command)
    if (err?.response) console.error('[EMAIL] SMTP server response:', err.response)
    return { success: false, error: err?.message || 'SMTP delivery failed' }
  }
}

export async function sendOtpEmail(
  email: string,
  otp: string,
): Promise<{ success: true; previewUrl?: string } | { success: false; error: string }> {
  const payload: MailPayload = {
    to: email,
    subject: 'Your CodeNode verification code',
    text: `Your verification code is: ${otp}\n\nThis code expires in 5 minutes.`,
    html: buildOtpEmailHtml(otp),
  }

  const result = await sendMail(payload)
  if (result.success) {
    console.log(`[EMAIL] OTP sent to ${email} via SMTP`)
  } else {
    console.error(`[EMAIL] OTP delivery failed for ${email}: ${result.error}`)
  }
  return result
}

export async function sendWelcomeEmail(
  email: string,
  name: string,
): Promise<{ success: true; previewUrl?: string } | { success: false; error: string }> {
  const payload: MailPayload = {
    to: email,
    subject: 'Welcome to CodeNode!',
    text: `Hi ${name},\n\nYour account has been created successfully. You can now sign in and start solving coding challenges.\n\n${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/login`,
    html: buildWelcomeEmailHtml(name),
  }

  const result = await sendMail(payload)
  if (result.success) {
    console.log(`[EMAIL] Welcome email sent to ${email} via SMTP`)
  } else {
    console.error(`[EMAIL] Welcome email delivery failed for ${email}: ${result.error}`)
  }
  return result
}
