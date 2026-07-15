import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/utils/supabaseAdmin';

const APP_URL = process.env.APP_URL || 'http://localhost:3000';

export async function GET() {
  const { data, error } = await supabaseAdmin.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${APP_URL}/auth/callback`,
      queryParams: { access_type: 'offline', prompt: 'select_account' },
    },
  });

  if (error || !data.url) {
    const loginUrl = new URL('/auth/login', APP_URL);
    loginUrl.searchParams.set('oauth_error', 'Google OAuth setup incomplete. Configure it in Supabase Dashboard → Authentication → Providers → Google.');
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.redirect(data.url);
}
