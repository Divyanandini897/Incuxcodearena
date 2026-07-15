import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'
import { isAdminUserId } from '@/src/lib/admin'

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await _request.json()
  const { userId, score } = body
  if (!userId || score === undefined) return NextResponse.json({ error: 'userId and score required' }, { status: 400 })

  if (await isAdminUserId(userId)) {
    return NextResponse.json({ error: 'Admins cannot participate in contests' }, { status: 403 })
  }

  const contest = await prisma.contest.findUnique({ where: { id } })
  if (!contest) return NextResponse.json({ error: 'Contest not found' }, { status: 404 })

  const now = new Date()
  if (contest.startsAt && now < contest.startsAt) {
    return NextResponse.json({ error: 'Contest has not started yet' }, { status: 403 })
  }
  if (contest.endsAt && now > contest.endsAt) {
    return NextResponse.json({ error: 'Contest has already ended' }, { status: 403 })
  }

  const attempt = await prisma.contestAttempt.upsert({
    where: { contestId_userId: { contestId: id, userId } },
    update: { score, submittedAt: new Date() },
    create: { contestId: id, userId, score, submittedAt: new Date() },
  })
  return NextResponse.json(attempt)
}
