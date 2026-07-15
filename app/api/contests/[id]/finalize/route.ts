import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'
import { isAdminUserId } from '@/src/lib/admin'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { userId } = body

    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

    if (await isAdminUserId(userId)) {
      return NextResponse.json({ error: 'Admins cannot participate in contests' }, { status: 403 })
    }

    const attempt = await prisma.contestAttempt.findUnique({
      where: { contestId_userId: { contestId: id, userId } },
      include: { submissions: true },
    })
    if (!attempt) return NextResponse.json({ error: 'Attempt not found' }, { status: 404 })
    if (attempt.status === 'completed') {
      return NextResponse.json({ error: 'Already completed' }, { status: 400 })
    }

    const contest = await prisma.contest.findUnique({ where: { id } })
    if (!contest) return NextResponse.json({ error: 'Contest not found' }, { status: 404 })
    const now = new Date()
    if (contest.startsAt && now < contest.startsAt) {
      return NextResponse.json({ error: 'Contest has not started yet' }, { status: 403 })
    }

    const totalScore = attempt.submissions.reduce((sum, s) => sum + s.score, 0)
    const timeTakenMs = attempt.startedAt ? Date.now() - attempt.startedAt.getTime() : 0

    await prisma.contestAttempt.update({
      where: { contestId_userId: { contestId: id, userId } },
      data: {
        score: totalScore,
        status: 'completed',
        timeTakenMs,
        submittedAt: new Date(),
      },
    })

    const activeProbCount = await prisma.contestProblem.count({ where: { contestId: id } })
    const acceptedCount = attempt.submissions.filter((s) => s.verdict === 'accepted').length

    // Calculate rank
    const higherRanked = await prisma.contestAttempt.count({
      where: {
        contestId: id,
        status: 'completed',
        OR: [
          { score: { gt: totalScore } },
          { score: totalScore, timeTakenMs: { lt: timeTakenMs } },
        ],
      },
    })

    return NextResponse.json({
      score: totalScore,
      totalProblems: activeProbCount,
      solved: acceptedCount,
      failed: activeProbCount - acceptedCount,
      timeTakenMs,
      rank: higherRanked + 1,
      submissions: attempt.submissions,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
