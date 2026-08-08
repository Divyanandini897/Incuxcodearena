import { NextRequest, NextResponse } from 'next/server';
import { saveInterviewReport } from '@/src/lib/interview/reportService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      sessionId, userId, overallScore, technicalScore,
      communicationScore, confidenceScore, accuracyScore,
      strengths, weaknesses, topicsToImprove,
      learningRecommendations, timeline,
    } = body;

    if (!sessionId || !userId) {
      return NextResponse.json({ error: 'Missing sessionId or userId' }, { status: 400 });
    }

    const report = await saveInterviewReport({
      sessionId,
      userId,
      overallScore,
      technicalScore,
      communicationScore,
      confidenceScore,
      accuracyScore,
      strengths: strengths || [],
      weaknesses: weaknesses || [],
      topicsToImprove: topicsToImprove || [],
      learningRecommendations: learningRecommendations || [],
      timeline: timeline || [],
    });

    return NextResponse.json({ reportId: report.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to save report';
    console.error('Save report error:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
