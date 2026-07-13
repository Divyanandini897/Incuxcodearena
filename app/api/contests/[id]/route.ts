import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const contest = await prisma.contest.findUnique({
    where: { id },
    include: {
      problems: {
        include: { problem: true },
        orderBy: { sortOrder: 'asc' },
      },
    },
  })
  if (!contest) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(contest)
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()
  const { title, description, durationMins, maxPoints, startsAt, endsAt, isPublished, problemIds } = body

  const updateData: Record<string, unknown> = {}
  if (title !== undefined) updateData.title = title
  if (description !== undefined) updateData.description = description
  if (durationMins !== undefined) updateData.durationMins = durationMins
  if (maxPoints !== undefined) updateData.maxPoints = maxPoints
  if (startsAt !== undefined) updateData.startsAt = startsAt ? new Date(startsAt) : null
  if (endsAt !== undefined) updateData.endsAt = endsAt ? new Date(endsAt) : null
  if (isPublished !== undefined) updateData.isPublished = isPublished

  if (problemIds !== undefined) {
    await prisma.contestProblem.deleteMany({ where: { contestId: id } })
    if (problemIds.length > 0) {
      await prisma.contestProblem.createMany({
        data: problemIds.map((pid: string, i: number) => ({
          contestId: id,
          problemId: pid,
          sortOrder: i,
          points: 0,
        })),
      })
    }
  }

  const contest = await prisma.contest.update({
    where: { id },
    data: updateData,
    include: {
      problems: {
        include: { problem: true },
        orderBy: { sortOrder: 'asc' },
      },
    },
  })
  return NextResponse.json(contest)
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.contest.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
