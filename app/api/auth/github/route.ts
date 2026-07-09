import { NextRequest, NextResponse } from 'next/server';

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const APP_URL = process.env.APP_URL || 'http://localhost:3000';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const redirect = searchParams.get('redirect') || '/';

  if (!GITHUB_CLIENT_ID) {
    const loginUrl = new URL('/auth/login', APP_URL);
    loginUrl.searchParams.set(
      'oauth_error',
      'GitHub OAuth is not configured. ' +
      'To set it up: ' +
      '1. Go to https://github.com/settings/developers ' +
      '2. Create a new OAuth App ' +
      '3. Set callback URL to http://localhost:3000/api/auth/github/callback ' +
      '4. Copy Client ID and generate a Client Secret ' +
      '5. Add them to .env.local as GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET ' +
      '6. Restart the server'
    );
    return NextResponse.redirect(loginUrl);
  }

  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    redirect_uri: `${APP_URL}/api/auth/github/callback`,
    scope: 'read:user user:email',
    state: JSON.stringify({ redirect }),
  });

  return NextResponse.redirect(`https://github.com/login/oauth/authorize?${params}`);
}
