// import { NextRequest, NextResponse } from 'next/server';
// import crypto from 'crypto';
// import { isStrongPassword } from '@/src/lib/password-validator';
// import { sendOtpEmail } from '@/src/lib/email';
// import { supabaseAdmin } from '@/src/utils/supabaseAdmin';
// import { checkRateLimit } from '@/src/lib/rate-limit';

// function generateOtp(): string {
//   return String(Math.floor(100000 + Math.random() * 900000));
// }

// export async function POST(request: NextRequest) {
//   try {
//     const { name, email, password } = await request.json();

//     if (!name || !email || !password) {
//       return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
//     }

//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(email)) {
//       return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
//     }

//     if (!isStrongPassword(password)) {
//       return NextResponse.json(
//         { error: 'Password must be at least 8 characters with 1 uppercase, 1 lowercase, 1 number, and 1 special character' },
//         { status: 400 }
//       );
//     }

//     const { allowed, retryAfter } = checkRateLimit(`register:${email.toLowerCase()}`);
//     if (!allowed) {
//       return NextResponse.json(
//         { error: `Too many requests. Please wait ${retryAfter} seconds.` },
//         { status: 429 }
//       );
//     }

//     const { data: existing } = await supabaseAdmin
//       .from('profiles')
//       .select('id')
//       .eq('email', email.toLowerCase())
//       .maybeSingle();

//     if (existing) {
//       return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
//     }

//     const otp = generateOtp();
//     const otpHash = crypto.createHash('sha256').update(otp).digest('hex');

//     const { error: insertError } = await supabaseAdmin.from('otps').insert({
//       email: email.toLowerCase(),
//       otp_hash: otpHash,
//       type: 'signup',
//       temp_data: { name, password },
//       expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
//       used: false,
//     });

//     if (insertError) {
//       console.error('[REGISTER] DB insert error:', insertError);
//       return NextResponse.json({ error: 'Failed to create verification code' }, { status: 500 });
//     }

//     console.log(`\n[DEV] OTP for ${email}: ${otp}\n`);

//     const result = await sendOtpEmail(email, otp);

//     if (!result.success) {
//       return NextResponse.json(
//         { success: true, dev_otp: otp, warning: 'Email delivery failed, using dev mode OTP.' },
//         { status: 200 }
//       );
//     }

//     if (result.success && result.previewUrl) {
//       console.log('[REGISTER] Email preview:', result.previewUrl);
//     }

//     return NextResponse.json({ success: true, dev_otp: otp, message: 'OTP sent successfully.' });
//   } catch (err) {
//     console.error('[REGISTER] Error:', err);
//     return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
//   }
// }



import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { isStrongPassword } from '@/src/lib/password-validator';
import { sendOtpEmail } from '@/src/lib/email';
import { supabaseAdmin } from '@/src/utils/supabaseAdmin';
import { checkRateLimit } from '@/src/lib/rate-limit';

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

    const { allowed, retryAfter } = checkRateLimit(`register:${email.toLowerCase()}`);
    if (!allowed) {
      return NextResponse.json(
        { error: `Too many requests. Please wait ${retryAfter} seconds.` },
        { status: 429 }
      );
    }

    const { data: existing } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('email', email.toLowerCase())
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
    }

    const otp = generateOtp();
    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');

    const { error: insertError } = await supabaseAdmin.from('otps').insert({
      email: email.toLowerCase(),
      otp_hash: otpHash,
      type: 'signup',
      temp_data: { name, password },
      expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      used: false,
    });

    if (insertError) {
      console.error('[REGISTER] DB insert error:', insertError);
      return NextResponse.json({ error: 'Failed to create verification code' }, { status: 500 });
    }

    console.log(`\n[DEV] OTP for ${email}: ${otp}\n`);

    const result = await sendOtpEmail(email, otp);

    // If the email fails to deliver, we only return the dev_otp in local development
    if (!result.success) {
      console.error('[REGISTER] Email delivery failed:', result.error || 'Unknown error');
      
      if (process.env.NODE_ENV === 'development') {
        return NextResponse.json(
          { success: true, dev_otp: otp, warning: 'Email delivery failed, using dev mode OTP.' },
          { status: 200 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to send verification email.', emailError: result.error },
        { status: 500 }
      );
    }

    if (result.success && result.previewUrl) {
      console.log('[REGISTER] Email preview:', result.previewUrl);
    }

    // ✅ SUCCESS PATH: Remove dev_otp so the yellow box stays hidden!
    return NextResponse.json({ 
      success: true, 
      message: 'OTP sent successfully.' 
    });
    
  } catch (err) {
    console.error('[REGISTER] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}