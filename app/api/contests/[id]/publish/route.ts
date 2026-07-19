import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'
import { isAdminEmail } from '@/src/lib/admin'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const adminEmail = request.headers.get('x-admin-email') || ''
  if (!isAdminEmail(adminEmail)) {
    return NextResponse.json({ error: 'Only admins can publish contests' }, { status: 403 })
  }
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
