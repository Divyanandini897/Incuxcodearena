import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const contest = await prisma.contest.findUnique({ where: { id } })
  if (!contest) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const updated = await prisma.contest.update({
    where: { id },
    data: { isPublished: !contest.isPublished },
    include: {
      problems: {
        include: { problem: true },
        orderBy: { sortOrder: 'asc' },
      },
    },
  })
  return NextResponse.json(updated)
}
