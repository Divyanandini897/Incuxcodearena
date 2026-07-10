import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/utils/supabaseAdmin';
import { sendWelcomeEmail } from '@/src/lib/email';

const APP_URL = process.env.APP_URL || 'http://localhost:3000';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  const loginUrl = new URL('/auth/login', APP_URL);

  if (!code) {
    loginUrl.searchParams.set('oauth_error', 'Google OAuth failed: no authorization code received.');
    return NextResponse.redirect(loginUrl);
  }

  try {
    const { data, error } = await supabaseAdmin.auth.exchangeCodeForSession(code);

    if (error || !data.session) {
      loginUrl.searchParams.set('oauth_error', 'Google OAuth session exchange failed.');
      return NextResponse.redirect(loginUrl);
    }

    const { user } = data.session;
    const email = user.email || '';
    const name = user.user_metadata?.full_name || user.user_metadata?.name || email.split('@')[0];
    const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture || '';

    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle();

    if (!existingProfile) {
      const username = email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '');

      await supabaseAdmin.from('profiles').insert({
        id: user.id,
        email: email.toLowerCase(),
        name,
        username,
        avatar_url: avatarUrl,
      });

      const welcomeResult = await sendWelcomeEmail(email, name);
      if (welcomeResult.success && welcomeResult.previewUrl) {
        console.log('[GOOGLE-CALLBACK] Welcome email preview:', welcomeResult.previewUrl);
      }
    }

    return NextResponse.redirect(new URL('/', APP_URL));
  } catch (err) {
    console.error('[GOOGLE-CALLBACK] Error:', err);
    loginUrl.searchParams.set('oauth_error', 'Google OAuth failed due to a server error.');
    return NextResponse.redirect(loginUrl);
  }
}
