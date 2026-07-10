import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/utils/supabaseAdmin';
import { sendWelcomeEmail } from '@/src/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { userId, email, name, avatarUrl } = await request.json();

    if (!userId || !email) {
      return NextResponse.json({ error: 'userId and email are required' }, { status: 400 });
    }

    const { data: existing } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ message: 'Profile already exists' });
    }

    const username = email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '');

    const { error: insertError } = await supabaseAdmin.from('profiles').insert({
      id: userId,
      email: email.toLowerCase(),
      name: name || email.split('@')[0],
      username,
      avatar_url: avatarUrl || '',
    });

    if (insertError) {
      console.error('[HANDLE-OAUTH] Profile insert error:', insertError);
      return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 });
    }

    const welcomeResult = await sendWelcomeEmail(email, name || email.split('@')[0]);
    if (welcomeResult.success && welcomeResult.previewUrl) {
      console.log('[HANDLE-OAUTH] Welcome email preview:', welcomeResult.previewUrl);
    }

    return NextResponse.json({ message: 'Profile created and welcome email sent' });
  } catch (err) {
    console.error('[HANDLE-OAUTH] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
