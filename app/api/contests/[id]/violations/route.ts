import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'
import { isAdminEmail } from '@/src/lib/admin'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { userId, type } = body

    if (!userId || !type) {
      return NextResponse.json({ error: 'userId and type required' }, { status: 400 })
    }

    if (!['fullscreen_exit', 'tab_switch', 'paste_attempt'].includes(type)) {
      return NextResponse.json({ error: 'Invalid violation type' }, { status: 400 })
    }

    const violation = await prisma.contestViolation.create({
      data: { contestId: id, userId, type },
    })
    return NextResponse.json(violation, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const adminEmail = request.headers.get('x-admin-email') || ''
    if (!isAdminEmail(adminEmail)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const userId = request.nextUrl.searchParams.get('userId')
    const summary = request.nextUrl.searchParams.get('summary') === 'true'

    const where: Record<string, unknown> = { contestId: id }
    if (userId) where.userId = userId

    if (summary) {
      const rows = await prisma.contestViolation.groupBy({
        by: ['type'],
        where,
        _count: { type: true },
      })
      const violations = rows.map((r) => ({ type: r.type, count: r._count.type }))
      const total = violations.reduce((sum, v) => sum + v.count, 0)
      return NextResponse.json({ violations, total })
    }

    const violations = await prisma.contestViolation.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(violations)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
