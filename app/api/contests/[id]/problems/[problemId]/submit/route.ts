import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'
import { isAdminUserId } from '@/src/lib/admin'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string; problemId: string }> }) {
  try {
    const { id, problemId } = await params
    const body = await request.json()
    const { userId, verdict, score } = body

    if (!userId || !verdict) {
      return NextResponse.json({ error: 'userId and verdict required' }, { status: 400 })
    }

    if (await isAdminUserId(userId)) {
      return NextResponse.json({ error: 'Admins cannot participate in contests' }, { status: 403 })
    }

    const problemNum = parseInt(problemId, 10)
    if (isNaN(problemNum)) {
      return NextResponse.json({ error: 'Invalid problemId' }, { status: 400 })
    }

    // Verify contest is running
    const contest = await prisma.contest.findUnique({ where: { id } })
    if (!contest) return NextResponse.json({ error: 'Contest not found' }, { status: 404 })
    const now = new Date()
    if (contest.endsAt && now > contest.endsAt) {
      return NextResponse.json({ error: 'Contest has ended' }, { status: 403 })
    }

    // Verify attempt exists
    const attempt = await prisma.contestAttempt.findUnique({
      where: { contestId_userId: { contestId: id, userId } },
    })
    if (!attempt) return NextResponse.json({ error: 'No active attempt' }, { status: 404 })
    if (attempt.status === 'completed') {
      return NextResponse.json({ error: 'Contest already completed' }, { status: 403 })
    }

    // Upsert submission
    const submission = await prisma.contestSubmission.upsert({
      where: { contestId_userId_problemId: { contestId: id, userId, problemId: problemNum } },
      create: { contestId: id, userId, problemId: problemNum, verdict, score: score ?? 0 },
      update: { verdict, score: score ?? 0, submittedAt: new Date() },
    })

    // Recalculate total score from all submissions
    const allSubs = await prisma.contestSubmission.findMany({
      where: { contestId: id, userId },
    })
    const totalScore = allSubs.reduce((sum, s) => sum + s.score, 0)

    await prisma.contestAttempt.update({
      where: { contestId_userId: { contestId: id, userId } },
      data: { score: totalScore },
    })

    return NextResponse.json({ submission, totalScore })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
