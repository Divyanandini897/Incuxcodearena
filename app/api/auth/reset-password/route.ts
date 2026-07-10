import { NextRequest, NextResponse } from 'next/server';
import { isStrongPassword } from '@/src/lib/password-validator';
import { supabaseAdmin } from '@/src/utils/supabaseAdmin';

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

    const { data: user, error: findError } = await supabaseAdmin.auth.admin.listUsers();

    const target = user?.users.find((u) => u.email === email.toLowerCase());

    if (!target) {
      return NextResponse.json({ error: 'No account found with this email' }, { status: 404 });
    }

    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(target.id, {
      password,
    });

    if (updateError) {
      console.error('[RESET-PASSWORD] Update error:', updateError);
      return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Password reset successful' });
  } catch (err) {
    console.error('[RESET-PASSWORD] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
