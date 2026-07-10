import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabaseAdmin } from '@/src/utils/supabaseAdmin';

export async function POST(request: NextRequest) {
  try {
    const { email, otp, type } = await request.json();

    if (!email || !otp || !type) {
      return NextResponse.json({ error: 'Email, OTP, and type are required' }, { status: 400 });
    }

    if (!/^\d{6}$/.test(otp)) {
      return NextResponse.json({ error: 'OTP must be a 6-digit code' }, { status: 400 });
    }

    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');

    const { data: record, error: fetchError } = await supabaseAdmin
      .from('otps')
      .select('*')
      .eq('email', email.toLowerCase())
      .eq('type', type)
      .eq('used', false)
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (fetchError) {
      console.error('[VERIFY-OTP] Fetch error:', fetchError);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    if (!record) {
      return NextResponse.json({ error: 'OTP expired. Please request a new one.' }, { status: 400 });
    }

    if (record.otp_hash !== otpHash) {
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
    }

    await supabaseAdmin
      .from('otps')
      .update({ used: true })
      .eq('id', record.id);

    if (type === 'signup' && record.temp_data) {
      const { name, password } = record.temp_data as { name: string; password: string };
      const username = name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');

      const { data: authUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: email.toLowerCase(),
        password,
        email_confirm: true,
        user_metadata: { name, username, display_name: name },
      });

      if (createError) {
        console.error('[VERIFY-OTP] Auth create error:', createError);
        return NextResponse.json({ error: createError.message }, { status: 500 });
      }

      const userId = authUser.user.id;

      const { error: profileError } = await supabaseAdmin.from('profiles').insert({
        id: userId,
        email: email.toLowerCase(),
        name,
        username,
      });

      if (profileError) {
        console.error('[VERIFY-OTP] Profile insert error:', profileError);
        return NextResponse.json({ error: 'Account created but profile setup failed.' }, { status: 500 });
      }
    }

    return NextResponse.json({ message: 'OTP verified successfully' });
  } catch (err) {
    console.error('[VERIFY-OTP] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
