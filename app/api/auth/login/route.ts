import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/utils/supabaseAdmin';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email: email.toLowerCase(),
      password,
    });

    if (error) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .maybeSingle();

    return NextResponse.json({
      session: data.session,
      user: {
        id: data.user.id,
        email: data.user.email,
        name: profile?.name || email.split('@')[0],
        username: profile?.username || '',
      },
    });
  } catch (err) {
    console.error('[LOGIN] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
