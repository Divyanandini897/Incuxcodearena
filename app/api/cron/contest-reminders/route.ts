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
  const contests = await prisma.contest.findMany({
    where: {
      isPublished: true,
      reminderSent: false,
      startsAt: { not: null },
    },
    include: { registrations: { include: { user: { select: { email: true, name: true } } } } },
  })

  let totalSent = 0
  for (const contest of contests) {
    const reminderMins = contest.reminderMinutes ?? 10
    const startsAt = contest.startsAt!
    const reminderTime = new Date(startsAt.getTime() - reminderMins * 60 * 1000)
    const windowEnd = new Date(reminderTime.getTime() + 60 * 1000) // 1 min window

    if (now < reminderTime || now > windowEnd) continue

    const recipients = contest.registrations.length > 0
      ? contest.registrations.map((r) => r.user.email).filter(Boolean) as string[]
      : (await prisma.profile.findMany({ select: { email: true } })).map((p) => p.email).filter(Boolean) as string[]

    if (recipients.length === 0) continue

    const body = [
      `Reminder: "${contest.title}" starts in ${reminderMins} minutes!`,
      '',
      `Duration: ${contest.durationMins} minutes`,
      `Max Points: ${contest.maxPoints}`,
      `Starts at: ${startsAt.toLocaleString()}`,
      '',
      `Visit ${APP_URL}/test-arena to join!`,
    ].join('\n')

    const { error } = await resend.emails.send({
      from: FROM,
      to: recipients,
      subject: `Reminder: "${contest.title}" starts in ${reminderMins} minutes`,
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

  return NextResponse.json({ ok: true, sent: totalSent })
}
