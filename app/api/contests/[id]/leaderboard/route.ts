import { NextResponse } from 'next/server'
import { isAdminEmail } from '@/src/lib/admin'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { prisma } = await import('@/src/lib/prisma')

  const attempts = await prisma.contestAttempt.findMany({
    where: { contestId: id, submittedAt: { not: null } },
    include: {
      user: { select: { name: true, avatar_url: true, email: true } },
      submissions: true,
    },
    orderBy: [{ score: 'desc' }, { timeTakenMs: 'asc' }, { submittedAt: 'asc' }],
    take: 50,
  })

  // Filter out admin users
  const studentAttempts = attempts.filter((a) => !isAdminEmail(a.user.email))

  const ranked = studentAttempts.map((a, i) => {
    const timeTaken = a.submittedAt && a.startedAt
      ? Math.round((a.submittedAt.getTime() - a.startedAt.getTime()) / 1000)
      : null
    const solvedCount = a.submissions.filter((s) => s.verdict === 'accepted').length
    return {
      rank: i + 1,
      name: a.user.name,
      avatar: a.user.avatar_url,
      score: a.score,
      solved: solvedCount,
      submittedAt: a.submittedAt,
      timeTaken,
    }
  })

  return NextResponse.json(ranked)
}
