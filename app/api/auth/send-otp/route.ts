import { NextRequest, NextResponse } from 'next/server';
import { saveOtp } from '@/src/lib/otp-store';
import { sendOtpEmail } from '@/src/lib/email';

function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function POST(request: NextRequest) {
  try {
    const { email, type } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    const otp = generateOtp();
    saveOtp(email, otp, type || 'registration');

    const result = await sendOtpEmail(email, otp);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to send verification email. Please check server logs for details.' },
        { status: 502 }
      );
    }

    if (result.previewUrl) {
      console.log('[SEND-OTP] Email preview:', result.previewUrl);
    }

    return NextResponse.json({ success: true, message: 'OTP sent successfully.' });
  } catch (err) {
    console.error('[SEND-OTP] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
