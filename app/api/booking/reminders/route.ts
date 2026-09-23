import crypto from 'node:crypto'
import { NextResponse } from 'next/server'
import { site } from '@/lib/site'
import { getBookingsDueForReminder } from '@/lib/booking/db'
import { sendReminder } from '@/lib/booking/notify'

export const dynamic = 'force-dynamic'

// Constant-time comparison, so the secret can't be guessed character by character from response timing
function authorized(req: Request) {
  const secret = process.env.CRON_SECRET
  const given = req.headers.get('authorization') ?? ''
  const expected = `Bearer ${secret}`
  return Boolean(secret) && given.length === expected.length && crypto.timingSafeEqual(Buffer.from(given), Buffer.from(expected))
}

// Called every 10 minutes by the scheduler (Supabase Cron). Emails each client once, about an hour before their call.
// ?dryRun=1 lists who would get a reminder without sending anything.
export async function GET(req: Request) {
  if (!authorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const due = await getBookingsDueForReminder(new Date(), site.booking.reminderMinutesBefore)
    if (new URL(req.url).searchParams.get('dryRun') === '1') {
      return NextResponse.json({ due: due.map((b) => ({ id: b.id, start: b.start_at, email: b.email })) })
    }
    const results = await Promise.all(due.map((b) => sendReminder(b)))
    const failed = results.filter((ok) => !ok).length
    if (due.length) console.log(`⏰ [reminders] ${due.length - failed} sent, ${failed} failed`)
    return NextResponse.json({ sent: due.length - failed, failed }, { status: failed ? 500 : 200 })
  } catch (err) {
    console.error('❌ [reminders] Run failed', err)
    return NextResponse.json({ error: 'Run failed' }, { status: 500 })
  }
}
