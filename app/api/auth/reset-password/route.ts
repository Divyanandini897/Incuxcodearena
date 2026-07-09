import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { isStrongPassword } from '@/src/lib/password-validator';
import { saveUser, findUser } from '@/src/lib/user-store';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    if (!isStrongPassword(password)) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters with 1 uppercase, 1 lowercase, 1 number, and 1 special character' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const existing = findUser(email);
    if (existing) {
      saveUser(email, hashedPassword, existing.name);
    } else {
      saveUser(email, hashedPassword);
    }

    return NextResponse.json({ message: 'Password reset successful' });
  } catch (err) {
    console.error('[RESET-PASSWORD] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
