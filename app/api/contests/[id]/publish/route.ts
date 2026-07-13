import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'
import { notifyContestPublished } from '@/src/lib/email'

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const contest = await prisma.contest.findUnique({ where: { id } })
  if (!contest) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const isPublishing = !contest.isPublished

  const updated = await prisma.contest.update({
    where: { id },
    data: { isPublished: isPublishing },
    include: {
      problems: {
        include: { problem: true },
        orderBy: { sortOrder: 'asc' },
      },
    },
  })

  if (isPublishing) {
    notifyContestPublished({
      title: updated.title,
      description: updated.description,
      durationMins: updated.durationMins,
      maxPoints: updated.maxPoints,
      startsAt: updated.startsAt,
      endsAt: updated.endsAt,
    }).catch((err) => console.error('[publish] Email notification failed:', err))
  }

  return NextResponse.json(updated)
}
