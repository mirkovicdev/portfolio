import { after, NextResponse } from 'next/server'
import { z } from 'zod'
import { site } from '@/lib/site'
import { isSlotAvailable, slotEnd } from '@/lib/booking/availability'
import {
  createHold,
  expireStaleHolds,
  getBooking,
  getInviteByToken,
  isInviteAlreadyUsed,
  markConfirmed,
  releaseHold,
} from '@/lib/booking/db'
import { addCalendarEvent } from '@/lib/booking/finalize'
import { sendBookingEmails } from '@/lib/booking/notify'

const { booking } = site

const schema = z.object({
  token: z.string().regex(/^[\w-]{22,64}$/),
  start: z.string().datetime(),
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(200),
  message: z.string().trim().max(2000).optional(),
  timeZone: z.string().max(100).optional(),
  hour12: z.boolean().optional(), // visitor's clock style, reused in their confirmation email
})

// Books a free call through a personal link (mirkovic.dev/meet/<token>). No payment, so it's confirmed right away.
// The link is checked here, never trusted from the page, and books one call only.
export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Invalid booking details' }, { status: 400 })
  const input = parsed.data
  console.log('🎟️ [invite] Request', { start: input.start })

  try {
    await expireStaleHolds()
    const link = await getInviteByToken(input.token)
    if (!link) return NextResponse.json({ error: 'invalid' }, { status: 404 })
    if (link.used) return NextResponse.json({ error: 'used' }, { status: 410 })

    const start = new Date(input.start)
    if (!(await isSlotAvailable(start))) {
      console.log('⛔ [invite] Time no longer available', input.start)
      return NextResponse.json({ error: 'taken' }, { status: 409 })
    }

    // Held first, so the time and the link stay reserved while the calendar event is created
    let hold
    try {
      hold = await createHold(
        {
          start_at: start.toISOString(),
          end_at: slotEnd(start).toISOString(),
          topic: 'meet',
          tier: 'free',
          background: null,
          message: input.message || null,
          name: input.name,
          email: input.email,
          visitor_time_zone: input.timeZone ?? null,
          visitor_hour12: input.hour12 ?? null,
          amount_cents: 0,
          currency: booking.currency.toLowerCase(),
          invite_id: link.invite.id,
        },
        booking.holdMinutes
      )
    } catch (err) {
      // Another tab booked with this same link a moment earlier
      if (isInviteAlreadyUsed(err)) return NextResponse.json({ error: 'used' }, { status: 410 })
      throw err
    }
    if (!hold) return NextResponse.json({ error: 'taken' }, { status: 409 }) // lost a race to another visitor

    try {
      await addCalendarEvent(hold)
    } catch (err) {
      await releaseHold(hold.id) // nothing booked, the link still works: the visitor can simply try again
      throw err
    }
    if (!(await markConfirmed(hold.id))) throw new Error(`Hold ${hold.id} was lost while booking`)

    const confirmed = (await getBooking(hold.id))!
    console.log('✅ [invite] Free call booked', confirmed.id, confirmed.start_at)
    // Emails go out after the response, so the visitor sees "You're booked" without waiting on them
    after(() => sendBookingEmails(confirmed).catch((err) => console.error('❌ [invite] Emails failed', err)))
    return NextResponse.json({ status: 'confirmed', meetUrl: confirmed.meet_url })
  } catch (err) {
    console.error('❌ [invite] Failed', err)
    return NextResponse.json({ error: 'Could not book the call' }, { status: 500 })
  }
}
