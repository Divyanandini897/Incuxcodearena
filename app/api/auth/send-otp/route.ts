import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { sendOtpEmail } from '@/src/lib/email';
import { supabaseAdmin } from '@/src/utils/supabaseAdmin';

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

    const otpType = type || 'signup';
    const otp = generateOtp();
    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');

    const { error: insertError } = await supabaseAdmin.from('otps').insert({
      email: email.toLowerCase(),
      otp_hash: otpHash,
      type: otpType,
      expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      used: false,
    });

    if (insertError) {
      console.error('[SEND-OTP] DB insert error:', insertError);
      return NextResponse.json({ error: 'Failed to create verification code' }, { status: 500 });
    }

    const result = await sendOtpEmail(email, otp);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to send verification email. Please check server logs for details.' },
        { status: 502 }
      );
    }

    if (result.success && result.previewUrl) {
      console.log('[SEND-OTP] Email preview:', result.previewUrl);
    }

    return NextResponse.json({ success: true, message: 'OTP sent successfully.' });
  } catch (err) {
    console.error('[SEND-OTP] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
