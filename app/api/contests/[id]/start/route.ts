import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'
import { isAdminUserId } from '@/src/lib/admin'

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await _request.json()
  const { userId } = body
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

  if (await isAdminUserId(userId)) {
    return NextResponse.json({ error: 'Admins cannot participate in contests' }, { status: 403 })
  }

  const contest = await prisma.contest.findUnique({ where: { id } })
  if (!contest) return NextResponse.json({ error: 'Contest not found' }, { status: 404 })
  if (!contest.isPublished) return NextResponse.json({ error: 'Contest is not published' }, { status: 403 })

  const now = new Date()
  if (contest.startsAt && now < contest.startsAt) {
    return NextResponse.json({ error: 'Contest has not started yet' }, { status: 403 })
  }
  if (contest.endsAt && now > contest.endsAt) {
    return NextResponse.json({ error: 'Contest has already ended' }, { status: 403 })
  }

  const existing = await prisma.contestAttempt.findUnique({
    where: { contestId_userId: { contestId: id, userId } },
  })
  if (existing) {
    if (existing.status === 'completed') {
      return NextResponse.json({ error: 'You have already completed this contest' }, { status: 403 })
    }
    return NextResponse.json(existing)
  }

  const attempt = await prisma.contestAttempt.create({
    data: { contestId: id, userId },
  })
  return NextResponse.json(attempt, { status: 201 })
}
