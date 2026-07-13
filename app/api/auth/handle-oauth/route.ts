import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/utils/supabaseAdmin';
import { sendWelcomeEmail } from '@/src/lib/email';

const isDev = process.env.NODE_ENV === 'development';

export async function POST(request: NextRequest) {
  try {
    const { userId, email, name, username, avatarUrl } = await request.json();
    console.log('[HANDLE-OAUTH] Received request:', { userId, email, name, username, hasAvatar: !!avatarUrl });

    if (!userId || !email) {
      return NextResponse.json({ error: 'userId and email are required' }, { status: 400 });
    }

    const upsertData: Record<string, unknown> = {
      id: userId,
      email: email.toLowerCase(),
      name: name || email.split('@')[0],
      username: username || email.split('@')[0].toLowerCase().replace(/[^a-z0-9_-]/g, ''),
      avatar_url: avatarUrl || '',
    };

    console.log('[HANDLE-OAUTH] Running UPSERT with data:', upsertData);

    const { data: preProfile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle();
    const isNewProfile = !preProfile;

    const { error: upsertError } = await supabaseAdmin
      .from('profiles')
      .upsert(upsertData, { onConflict: 'id', ignoreDuplicates: false });

    if (upsertError) {
      console.error('[HANDLE-OAUTH] UPSERT error:', {
        code: upsertError.code,
        message: upsertError.message,
        details: upsertError.details,
        hint: upsertError.hint,
      });
      const message = isDev
        ? `Profile upsert failed: ${upsertError.message}${upsertError.details ? ` (${upsertError.details})` : ''}`
        : 'Failed to create/update profile';
      return NextResponse.json({ error: message, code: upsertError.code }, { status: 500 });
    }

    console.log('[HANDLE-OAUTH] UPSERT succeeded, verifying profile...');

    const { data: verified, error: verifyError } = await supabaseAdmin
      .from('profiles')
      .select('id, name, email, username, avatar_url')
      .eq('id', userId)
      .maybeSingle();

    if (verifyError) {
      console.error('[HANDLE-OAUTH] Verification query error:', verifyError);
    }

    if (!verified) {
      console.error('[HANDLE-OAUTH] Profile NOT FOUND after UPSERT');
      return NextResponse.json({ error: 'Profile was not created after upsert — RLS policy may be blocking' }, { status: 500 });
    }

    console.log('[HANDLE-OAUTH] Profile verified:', verified);

    const displayName = (name || email.split('@')[0]) as string;
    if (isNewProfile) {
      const welcomeResult = await sendWelcomeEmail(email, displayName);
      if (welcomeResult.success && welcomeResult.previewUrl) {
        console.log('[HANDLE-OAUTH] Welcome email preview:', welcomeResult.previewUrl);
      }
    } else {
      console.log('[HANDLE-OAUTH] Skipping welcome email — returning user');
    }

    return NextResponse.json({ message: 'Profile created and welcome email sent' });
  } catch (err) {
    const error = err as Error;
    console.error('[HANDLE-OAUTH] Unexpected error:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });
    const message = isDev ? `Internal error: ${error.message}` : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
