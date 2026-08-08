import { NextRequest, NextResponse } from 'next/server';
import { getUserInterviewHistory, getUserInterviewReports } from '@/src/lib/interview/reportService';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const type = searchParams.get('type') || 'sessions';

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    let data;
    if (type === 'reports') {
      data = await getUserInterviewReports(userId);
    } else {
      data = await getUserInterviewHistory(userId);
    }

    return NextResponse.json({ data });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch history';
    console.error('Interview history error:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
