import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { Prisma } from '@/src/generated/prisma/client';
import { sendWelcomeEmail } from '@/src/lib/email';

function makeUsername(base: string, suffix?: string): string {
  const cleaned = base.toLowerCase().replace(/[^a-z0-9_-]/g, '');
  if (!cleaned) return `user_${Date.now()}`;
  return suffix ? `${cleaned}_${suffix}` : cleaned;
}

export async function POST(request: NextRequest) {
  try {
    const { userId, email, name, username, avatarUrl } = await request.json();

    if (!userId || !email) {
      return NextResponse.json({ error: 'userId and email are required' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase();
    const displayName = name || normalizedEmail.split('@')[0];

    const maxAttempts = 5;
    let lastError: string | null = null;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const candidateUsername = attempt === 0
        ? makeUsername(username || normalizedEmail.split('@')[0])
        : makeUsername(normalizedEmail.split('@')[0], `${Date.now()}_${attempt}`);

      try {
        const p = await prisma.profile.upsert({
          where: { id: userId },
          update: {
            email: normalizedEmail,
            name: displayName,
            username: candidateUsername,
            avatar_url: avatarUrl || null,
          },
          create: {
            id: userId,
            email: normalizedEmail,
            name: displayName,
            username: candidateUsername,
            avatar_url: avatarUrl || null,
          },
        });

        const isNewProfile = p.created_at === p.updated_at;
        if (isNewProfile) {
          const welcomeResult = await sendWelcomeEmail(normalizedEmail, displayName);
          if (welcomeResult.success && 'previewUrl' in welcomeResult && welcomeResult.previewUrl) {
            console.log('[HANDLE-OAUTH] Welcome email preview:', welcomeResult.previewUrl);
          }
        }

        return NextResponse.json({
          message: 'Profile created successfully',
          profile: { id: p.id, name: p.name, email: p.email },
        });
      } catch (err) {
        if (
          err instanceof Prisma.PrismaClientKnownRequestError &&
          err.code === 'P2002' &&
          (err.meta?.target as string[])?.includes('username')
        ) {
          lastError = 'Username conflict';
          continue;
        }
        throw err;
      }
    }

    return NextResponse.json(
      { error: `Unable to create profile — ${lastError || 'unknown error'}. Please try again.` },
      { status: 409 },
    );
  } catch (err) {
    const error = err as Error;
    console.error('[HANDLE-OAUTH] Unexpected error:', {
      name: error.name,
      message: error.message,
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
