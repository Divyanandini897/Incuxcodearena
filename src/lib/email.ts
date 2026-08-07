import { Resend } from 'resend'
import nodemailer from 'nodemailer'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null
const FROM = process.env.RESEND_FROM ?? 'onboarding@resend.dev'

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

async function createEtherealTransport() {
  const testAccount = await nodemailer.createTestAccount()
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: { user: testAccount.user, pass: testAccount.pass },
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

async function sendViaResend(payload: MailPayload): Promise<{ ok: true; id?: string } | { ok: false; error: string }> {
  if (!resend) return { ok: false, error: 'RESEND_API_KEY not set' }
  try {
    const { data, error } = await withTimeout(
      resend.emails.send({
        from: FROM,
        to: payload.to,
        subject: payload.subject,
        text: payload.text,
        html: payload.html,
      }),
      SEND_TIMEOUT_MS,
      'Resend API',
    )
    if (error) return { ok: false, error: error.message }
    return { ok: true, id: data?.id }
  } catch (err: any) {
    return { ok: false, error: err?.message || String(err) }
  }
}

async function sendViaSmtp(payload: MailPayload): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    if (!hasRealCredentials()) return { ok: false, error: 'SMTP credentials not configured' }
    const transporter = createSmtpTransport()
    const FROM_EMAIL = process.env.FROM_EMAIL || process.env.SMTP_USER || 'noreply@codenode.app'
    await withTimeout(transporter.sendMail({ from: FROM_EMAIL, ...payload }), SEND_TIMEOUT_MS, 'SMTP send')
    return { ok: true }
  } catch (err: any) {
    return { ok: false, error: err?.message || String(err) }
  }
}

async function sendViaEthereal(payload: MailPayload): Promise<{ ok: true; previewUrl?: string } | { ok: false; error: string }> {
  try {
    const transporter = await withTimeout(createEtherealTransport(), SEND_TIMEOUT_MS, 'Ethereal connect')
    const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@codenode.app'
    const info = await withTimeout(
      transporter.sendMail({ from: FROM_EMAIL, ...payload }),
      SEND_TIMEOUT_MS,
      'Ethereal send',
    )
    const previewUrl = nodemailer.getTestMessageUrl(info) || undefined
    return { ok: true, previewUrl }
  } catch (err: any) {
    return { ok: false, error: err?.message || String(err) }
  }
}

async function deliverMail(
  payload: MailPayload,
  kind: 'OTP' | 'welcome',
): Promise<{ success: true; previewUrl?: string } | { success: false; error: string }> {
  const resendResult = await sendViaResend(payload)
  if (resendResult.ok) {
    console.log(
      `[EMAIL] ${kind} email sent to ${payload.to} via Resend${resendResult.id ? ` (id: ${resendResult.id})` : ''}`,
    )
    return { success: true }
  }
  console.error(`[EMAIL] Resend failed: ${resendResult.error}`)

  const smtp = await sendViaSmtp(payload)
  if (smtp.ok) {
    console.log(`[EMAIL] ${kind} email sent to ${payload.to} via SMTP`)
    return { success: true }
  }
  console.error(`[EMAIL] SMTP failed: ${smtp.error}`)

  if (process.env.NODE_ENV === 'production') {
    console.error(`[EMAIL] All delivery paths failed for ${payload.to} in production`)
    return {
      success: false,
      error: `Email delivery failed. Resend: ${resendResult.error}; SMTP: ${smtp.error}`,
    }
  }

  const ethereal = await sendViaEthereal(payload)
  if (ethereal.ok) {
    console.log(`[EMAIL] ${kind} email sent to ${payload.to} via Ethereal test account`)
    return { success: true, previewUrl: ethereal.previewUrl }
  }
  console.error(`[EMAIL] All delivery paths failed for ${payload.to}: ${ethereal.error}`)
  return { success: false, error: ethereal.error || 'Unknown email error' }
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
  return deliverMail(payload, 'OTP')
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
  return deliverMail(payload, 'welcome')
}
