import { NextRequest, NextResponse } from 'next/server';

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const APP_URL = process.env.APP_URL || 'http://localhost:3000';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  const loginUrl = new URL('/auth/login', APP_URL);

  if (error) {
    loginUrl.searchParams.set('oauth_error', `GitHub authorization failed: ${error}`);
    return NextResponse.redirect(loginUrl);
  }

  if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
    loginUrl.searchParams.set('oauth_error', 'GitHub OAuth is not configured. Set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in .env.local and restart the server.');
    return NextResponse.redirect(loginUrl);
  }

  if (!code) {
    loginUrl.searchParams.set('oauth_error', 'GitHub OAuth failed: no authorization code received.');
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
    const tokenResponse = await fetch(
      'https://github.com/login/oauth/access_token',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          client_id: GITHUB_CLIENT_ID,
          client_secret: GITHUB_CLIENT_SECRET,
          code,
        }),
      }
    );

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      loginUrl.searchParams.set('oauth_error', `GitHub OAuth token exchange failed: ${tokenData.error_description || tokenData.error}`);
      return NextResponse.redirect(loginUrl);
    }

    const accessToken = tokenData.access_token;

    const userResponse = await fetch('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!userResponse.ok) {
      loginUrl.searchParams.set('oauth_error', 'GitHub OAuth failed to fetch user profile.');
      return NextResponse.redirect(loginUrl);
    }

    const userData = await userResponse.json();

    const emailsResponse = await fetch('https://api.github.com/user/emails', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const emailsData = await emailsResponse.json();
    const primaryEmail = Array.isArray(emailsData)
      ? emailsData.find((e: any) => e.primary)?.email || emailsData[0]?.email
      : '';

    const authToken =
      'tok_gh_' +
      Buffer.from(`${userData.login}:${Date.now()}`).toString('base64');

    const redirectUrl = new URL(redirectTarget, APP_URL);
    redirectUrl.searchParams.set('token', authToken);
    redirectUrl.searchParams.set('provider', 'github');
    redirectUrl.searchParams.set('email', primaryEmail || '');
    redirectUrl.searchParams.set('name', userData.name || userData.login);

    return NextResponse.redirect(redirectUrl);
  } catch (err: any) {
    loginUrl.searchParams.set('oauth_error', 'GitHub OAuth failed due to a server error.');
    return NextResponse.redirect(loginUrl);
  }
}
