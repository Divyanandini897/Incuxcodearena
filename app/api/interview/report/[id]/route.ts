import { NextRequest, NextResponse } from 'next/server';
import { getInterviewReport } from '@/src/lib/interview/reportService';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'Missing report id' }, { status: 400 });
    }

    const report = await getInterviewReport(id);

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    return NextResponse.json({ report });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch report';
    console.error('Interview report error:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
