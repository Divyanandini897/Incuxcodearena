import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { isStrongPassword } from '@/src/lib/password-validator';
import { saveOtp } from '@/src/lib/otp-store';
import { sendOtpEmail } from '@/src/lib/email';

function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    if (!isStrongPassword(password)) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters with 1 uppercase, 1 lowercase, 1 number, and 1 special character' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const otp = generateOtp();
    saveOtp(email, otp, 'registration', { name, password: hashedPassword });

    const result = await sendOtpEmail(email, otp);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to send verification email. Please check server logs for details.' },
        { status: 502 }
      );
    }

    if (result.previewUrl) {
      console.log('[REGISTER] Email preview:', result.previewUrl);
    }

    return NextResponse.json({ success: true, message: 'OTP sent successfully.' });
  } catch (err) {
    console.error('[REGISTER] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
