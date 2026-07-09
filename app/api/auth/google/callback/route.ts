import { NextRequest, NextResponse } from 'next/server';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const APP_URL = process.env.APP_URL || 'http://localhost:3000';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  const loginUrl = new URL('/auth/login', APP_URL);

  if (error) {
    loginUrl.searchParams.set('oauth_error', `Google authorization failed: ${error}`);
    return NextResponse.redirect(loginUrl);
  }

  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    loginUrl.searchParams.set('oauth_error', 'Google OAuth is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env.local and restart the server.');
    return NextResponse.redirect(loginUrl);
  }

  if (!code) {
    loginUrl.searchParams.set('oauth_error', 'Google OAuth failed: no authorization code received.');
    return NextResponse.redirect(loginUrl);
  }

  let redirectTarget = '/';
  if (state) {
    try {
      const parsed = JSON.parse(state);
      redirectTarget = parsed.redirect || '/';
    } catch {}
  }

  try {
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: `${APP_URL}/api/auth/google/callback`,
        grant_type: 'authorization_code',
      }).toString(),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      loginUrl.searchParams.set('oauth_error', `Google OAuth token exchange failed: ${tokenData.error_description || tokenData.error}`);
      return NextResponse.redirect(loginUrl);
    }

    const accessToken = tokenData.access_token;

    const userResponse = await fetch(
      'https://www.googleapis.com/oauth2/v2/userinfo',
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (!userResponse.ok) {
      loginUrl.searchParams.set('oauth_error', 'Google OAuth failed to fetch user profile.');
      return NextResponse.redirect(loginUrl);
    }

    const userData = await userResponse.json();

    const authToken =
      'tok_gl_' +
      Buffer.from(`${userData.email}:${Date.now()}`).toString('base64');

    const redirectUrl = new URL(redirectTarget, APP_URL);
    redirectUrl.searchParams.set('token', authToken);
    redirectUrl.searchParams.set('provider', 'google');
    redirectUrl.searchParams.set('email', userData.email || '');
    redirectUrl.searchParams.set('name', userData.name || '');

    return NextResponse.redirect(redirectUrl);
  } catch (err: any) {
    loginUrl.searchParams.set('oauth_error', 'Google OAuth failed due to a server error.');
    return NextResponse.redirect(loginUrl);
  }
}
