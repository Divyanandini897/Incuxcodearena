import { Resend } from 'resend'
import { prisma } from '@/src/lib/prisma'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

const FROM = process.env.RESEND_FROM ?? 'onboarding@resend.dev'
const APP_URL = process.env.APP_URL ?? 'http://localhost:3000'

export async function notifyContestPublished(contest: {
  title: string
  description: string | null
  durationMins: number
  maxPoints: number
  startsAt: Date | null
  endsAt: Date | null
}) {
  if (!resend) {
    console.warn('[email] RESEND_API_KEY not set — skipping notification')
    return
  }

  const profiles = await prisma.profile.findMany({
    select: { email: true, name: true },
  })

  const emails = profiles
    .map((p) => p.email)
    .filter(Boolean) as string[]

  if (emails.length === 0) {
    console.warn('[email] No user emails found — skipping')
    return
  }

  const subject = `New Contest: ${contest.title} is now available on CodeNode!`
  const body = [
    `A new contest has been published on CodeNode!`,
    ``,
    `Title: ${contest.title}`,
    contest.description ? `Description: ${contest.description}` : null,
    `Duration: ${contest.durationMins} minutes`,
    `Max Points: ${contest.maxPoints}`,
    contest.startsAt ? `Starts: ${contest.startsAt.toLocaleString()}` : null,
    contest.endsAt ? `Ends: ${contest.endsAt.toLocaleString()}` : null,
    ``,
    `Visit ${APP_URL}/test-arena to participate!`,
  ]
    .filter(Boolean)
    .join('\n')

  const { data, error } = await resend.emails.send({
    from: FROM,
    to: emails,
    subject,
    text: body,
  })

  if (error) {
    console.error('[email] Failed to send:', error)
  } else {
    console.log(`[email] Notification sent to ${emails.length} users (id: ${data?.id})`)
  }

  return { sent: emails.length }
}
