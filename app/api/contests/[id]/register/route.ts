import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'
import { isAdminUserId } from '@/src/lib/admin'

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await _request.json()
  const { userId } = body
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

  if (await isAdminUserId(userId)) {
    return NextResponse.json({ error: 'Admins cannot register for contests' }, { status: 403 })
  }

  const existing = await prisma.contestRegistration.findUnique({
    where: { contestId_userId: { contestId: id, userId } },
  })
  if (existing) return NextResponse.json(existing)

  const registration = await prisma.contestRegistration.create({
    data: { contestId: id, userId },
  })
  return NextResponse.json(registration, { status: 201 })
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await _request.json()
  const { userId } = body
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

  await prisma.contestRegistration.deleteMany({
    where: { contestId: id, userId },
  })
  return NextResponse.json({ success: true })
}
