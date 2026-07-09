import { NextRequest, NextResponse } from 'next/server';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const APP_URL = process.env.APP_URL || 'http://localhost:3000';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const redirect = searchParams.get('redirect') || '/';

  if (!GOOGLE_CLIENT_ID) {
    const loginUrl = new URL('/auth/login', APP_URL);
    loginUrl.searchParams.set(
      'oauth_error',
      'Google OAuth is not configured. ' +
      'To set it up: ' +
      '1. Go to https://console.cloud.google.com/apis/credentials ' +
      '2. Create an OAuth 2.0 Client ID (Web application) ' +
      '3. Add redirect URI: http://localhost:3000/api/auth/google/callback ' +
      '4. Copy Client ID and Client Secret ' +
      '5. Add them to .env.local as GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET ' +
      '6. Restart the server'
    );
    return NextResponse.redirect(loginUrl);
  }

  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: `${APP_URL}/api/auth/google/callback`,
    response_type: 'code',
    scope: 'openid email profile',
    state: JSON.stringify({ redirect }),
  });

  return NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
}
