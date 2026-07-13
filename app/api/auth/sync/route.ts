import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { id, email, name, avatar_url } = body

  if (!id || !email) {
    return NextResponse.json({ error: 'Missing required fields: id, email' }, { status: 400 })
  }

  const profile = await prisma.profile.upsert({
    where: { id },
    update: {
      email,
      name: name ?? email.split('@')[0],
      avatar_url: avatar_url ?? null,
    },
    create: {
      id,
      email,
      name: name ?? email.split('@')[0],
      avatar_url: avatar_url ?? null,
    },
  })

  return NextResponse.json({ profile }, { status: 201 })
}
