import { NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'
import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null
const FROM = process.env.RESEND_FROM ?? 'onboarding@resend.dev'
const APP_URL = process.env.APP_URL ?? 'http://localhost:3000'

export async function GET() {
  if (!resend) {
    return NextResponse.json({ ok: false, reason: 'RESEND_API_KEY not set' })
  }

  const now = new Date()
  const inOneHour = new Date(now.getTime() + 60 * 60 * 1000)
  const in45Min = new Date(now.getTime() + 45 * 60 * 1000)

  const contests = await prisma.contest.findMany({
    where: {
      isPublished: true,
      reminderSent: false,
      startsAt: { gte: in45Min, lte: inOneHour },
    },
  })

  if (contests.length === 0) {
    return NextResponse.json({ ok: true, sent: 0, message: 'No contests starting within 1 hour' })
  }

  const profiles = await prisma.profile.findMany({
    select: { email: true, name: true },
  })
  const emails = profiles.map((p) => p.email).filter(Boolean) as string[]

  if (emails.length === 0) {
    return NextResponse.json({ ok: true, sent: 0, message: 'No user emails found' })
  }

  let totalSent = 0
  for (const contest of contests) {
    const body = [
      `Reminder: "${contest.title}" starts in about 1 hour!`,
      '',
      `Duration: ${contest.durationMins} minutes`,
      `Max Points: ${contest.maxPoints}`,
      contest.startsAt ? `Starts at: ${contest.startsAt.toLocaleString()}` : null,
      '',
      `Visit ${APP_URL}/test-arena to join!`,
    ].filter(Boolean).join('\n')

    const { error } = await resend.emails.send({
      from: FROM,
      to: emails,
      subject: `Reminder: "${contest.title}" starts in 1 hour`,
      text: body,
    })

    if (error) {
      console.error('[CRON] Failed to send reminder:', error)
    } else {
      await prisma.contest.update({
        where: { id: contest.id },
        data: { reminderSent: true },
      })
      totalSent++
    }
  }

  return NextResponse.json({ ok: true, sent: totalSent, totalContests: contests.length })
}
