import { NextResponse } from 'next/server'
import { z } from 'zod'
import { site } from '@/lib/site'
import { getTier, getTopic, isBackground } from '@/lib/booking/catalog'
import { isSlotAvailable, slotEnd } from '@/lib/booking/availability'
import { createHold, expireStaleHolds } from '@/lib/booking/db'
import { createBookingPayment, releaseUnpaidHold } from '@/lib/booking/payment'

const { booking } = site

const schema = z.object({
  topicId: z.string(),
  start: z.string().datetime(),
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(200),
  background: z.string(),
  message: z.string().trim().max(2000).optional(),
  timeZone: z.string().max(100).optional(),
  hour12: z.boolean().optional(), // visitor's clock style, reused in their confirmation email
  releaseBookingId: z.string().uuid().optional(), // this visitor's earlier hold, replaced by this one
})

// Holds the time for a few minutes and creates the Stripe payment for the chosen topic's price
export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null))
  const input = parsed.success ? parsed.data : null
  const topic = input && getTopic(input.topicId)
  const tier = topic && getTier(topic.tier)
  if (!input || !topic || !tier || !isBackground(input.background)) {
    return NextResponse.json({ error: 'Invalid booking details' }, { status: 400 })
  }
  console.log('💳 [checkout] Request', { topic: topic.id, start: input.start })

  try {
    // Frees the visitor's earlier hold (e.g. they edited their details) and voids its unpaid payment
    if (input.releaseBookingId) await releaseUnpaidHold(input.releaseBookingId)
    await expireStaleHolds()

    const start = new Date(input.start)
    if (!(await isSlotAvailable(start))) {
      console.log('⛔ [checkout] Time no longer available', input.start)
      return NextResponse.json({ error: 'taken' }, { status: 409 })
    }

    const hold = await createHold(
      {
        start_at: start.toISOString(),
        end_at: slotEnd(start).toISOString(),
        topic: topic.id,
        tier: tier.id,
        background: input.background,
        message: input.message || null,
        name: input.name,
        email: input.email,
        visitor_time_zone: input.timeZone ?? null,
        visitor_hour12: input.hour12 ?? null,
        amount_cents: tier.price * 100, // price comes from the config, never from the browser
        currency: booking.currency.toLowerCase(),
      },
      booking.holdMinutes
    )
    if (!hold) return NextResponse.json({ error: 'taken' }, { status: 409 }) // lost a race to another visitor

    const pi = await createBookingPayment(hold, topic.label)
    console.log('✅ [checkout] Time held and payment created', hold.id)
    return NextResponse.json({ bookingId: hold.id, clientSecret: pi.client_secret })
  } catch (err) {
    console.error('❌ [checkout] Failed', err)
    return NextResponse.json({ error: 'Could not start the payment' }, { status: 500 })
  }
}
