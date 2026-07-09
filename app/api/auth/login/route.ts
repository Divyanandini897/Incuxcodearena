import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { findUser } from '@/src/lib/user-store';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const user = findUser(email);
    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const token = 'tok_' + Buffer.from(`${email}:${Date.now()}`).toString('base64');

    return NextResponse.json({ token, email, name: user.name || email.split('@')[0] });
  } catch (err) {
    console.error('[LOGIN] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
