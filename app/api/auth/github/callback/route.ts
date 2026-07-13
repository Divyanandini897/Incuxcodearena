import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/utils/supabaseAdmin';
import { sendWelcomeEmail } from '@/src/lib/email';

const APP_URL = process.env.APP_URL || 'http://localhost:3000';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  const loginUrl = new URL('/auth/login', APP_URL);

  if (!code) {
    loginUrl.searchParams.set('oauth_error', 'GitHub OAuth failed: no authorization code received.');
    return NextResponse.redirect(loginUrl);
  }

  try {
    const { data, error } = await supabaseAdmin.auth.exchangeCodeForSession(code);

    if (error || !data.session) {
      loginUrl.searchParams.set('oauth_error', 'GitHub OAuth session exchange failed.');
      return NextResponse.redirect(loginUrl);
    }

    const { user } = data.session;
    const email = user.email || '';
    const name = user.user_metadata?.full_name || user.user_metadata?.name || user.user_metadata?.user_name || email.split('@')[0];
    const username = user.user_metadata?.user_name || email.split('@')[0].toLowerCase().replace(/[^a-z0-9_-]/g, '');
    const avatarUrl = user.user_metadata?.avatar_url || '';

    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle();

    const isNewUser = !existingProfile;

    const { error: upsertError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: user.id,
        email: email.toLowerCase(),
        name,
        username,
        avatar_url: avatarUrl,
      }, { onConflict: 'id', ignoreDuplicates: false });

    if (upsertError) {
      console.error('[GITHUB-CALLBACK] Profile upsert error:', upsertError);
    }

    if (isNewUser) {
      const welcomeResult = await sendWelcomeEmail(email, name);
      if (welcomeResult.success && welcomeResult.previewUrl) {
        console.log('[GITHUB-CALLBACK] Welcome email preview:', welcomeResult.previewUrl);
      }
    }

    return NextResponse.redirect(new URL('/', APP_URL));
  } catch (err) {
    console.error('[GITHUB-CALLBACK] Error:', err);
    loginUrl.searchParams.set('oauth_error', 'GitHub OAuth failed due to a server error.');
    return NextResponse.redirect(loginUrl);
  }
}