import { NextRequest, NextResponse } from 'next/server';
import { verifyOtp } from '@/src/lib/otp-store';
import { saveUser } from '@/src/lib/user-store';

export async function POST(request: NextRequest) {
  try {
    const { email, otp, type } = await request.json();

    if (!email || !otp || !type) {
      return NextResponse.json({ error: 'Email, OTP, and type are required' }, { status: 400 });
    }

    if (!/^\d{6}$/.test(otp)) {
      return NextResponse.json({ error: 'OTP must be a 6-digit code' }, { status: 400 });
    }

    const result = verifyOtp(email, otp, type);

    if (!result.valid) {
      return NextResponse.json({ error: result.reason }, { status: 400 });
    }

    if (type === 'registration' && result.tempData) {
      saveUser(email, result.tempData.password, result.tempData.name);
    }

    return NextResponse.json({ message: 'OTP verified successfully' });
  } catch (err) {
    console.error('[VERIFY-OTP] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
