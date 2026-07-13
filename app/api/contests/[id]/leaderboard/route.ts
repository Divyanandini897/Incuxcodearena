import { NextResponse } from 'next/server'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { prisma } = await import('@/src/lib/prisma')

  const attempts = await prisma.contestAttempt.findMany({
    where: { contestId: id, submittedAt: { not: null } },
    include: { user: { select: { name: true, avatar_url: true } } },
    orderBy: [{ score: 'desc' }, { submittedAt: 'asc' }],
    take: 50,
  })

  const ranked = attempts.map((a, i) => ({
    rank: i + 1,
    name: a.user.name,
    avatar: a.user.avatar_url,
    score: a.score,
    submittedAt: a.submittedAt,
  }))

  return NextResponse.json(ranked)
}
