import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'
import { isAdminEmail } from '@/src/lib/admin'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const adminEmail = request.headers.get('x-admin-email') || ''

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

  // Non-admin users can only view published contests
  if (!isAdminEmail(adminEmail) && !contest.isPublished) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json(contest)
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()

  const adminEmail = request.headers.get('x-admin-email') || ''
  if (!isAdminEmail(adminEmail)) {
    return NextResponse.json({ error: 'Only admins can update contests' }, { status: 403 })
  }

  const { title, description, durationMins, maxPoints, maxViolations, startsAt, endsAt, isPublished, problemIds, reminderMinutes } = body

  if (startsAt && endsAt && new Date(startsAt) >= new Date(endsAt)) {
    return NextResponse.json({ error: 'endsAt must be after startsAt' }, { status: 400 })
  }

  const updateData: Record<string, unknown> = {}
  if (title !== undefined) updateData.title = title
  if (description !== undefined) updateData.description = description
  if (durationMins !== undefined) updateData.durationMins = durationMins
  if (maxPoints !== undefined) updateData.maxPoints = maxPoints
  if (maxViolations !== undefined) updateData.maxViolations = maxViolations
  if (startsAt !== undefined) updateData.startsAt = startsAt ? new Date(startsAt) : null
  if (endsAt !== undefined) updateData.endsAt = endsAt ? new Date(endsAt) : null
  if (isPublished !== undefined) updateData.isPublished = isPublished
  if (reminderMinutes !== undefined) updateData.reminderMinutes = reminderMinutes

  if (problemIds !== undefined) {
    await prisma.contestProblem.deleteMany({ where: { contestId: id } })
    if (problemIds.length > 0) {
      const perProblemPoints = Math.floor((maxPoints ?? 0) / problemIds.length)
      await prisma.contestProblem.createMany({
        data: problemIds.map((pid: string, i: number) => ({
          contestId: id,
          problemId: pid,
          sortOrder: i,
          points: perProblemPoints,
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

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const adminEmail = request.headers.get('x-admin-email') || ''
  if (!isAdminEmail(adminEmail)) {
    return NextResponse.json({ error: 'Only admins can delete contests' }, { status: 403 })
  }
  await prisma.contest.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
