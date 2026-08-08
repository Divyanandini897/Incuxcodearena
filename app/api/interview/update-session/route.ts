import { NextRequest, NextResponse } from 'next/server';
import { updateInterviewSession } from '@/src/lib/interview/interviewService';

export async function POST(req: NextRequest) {
  try {
    const { sessionId, updates } = await req.json();

    if (!sessionId || !updates) {
      return NextResponse.json({ error: 'Missing sessionId or updates' }, { status: 400 });
    }

    await updateInterviewSession(sessionId, updates);

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to update session';
    console.error('Update session error:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
