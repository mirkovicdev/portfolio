import { after, NextResponse } from 'next/server'
import { z } from 'zod'
import { finalizeBooking } from '@/lib/booking/finalize'
import { sendBookingEmails } from '@/lib/booking/notify'

const schema = z.object({ paymentIntentId: z.string().startsWith('pi_') })

// Called by the page right after a successful payment. Verifies the payment with Stripe itself,
// so knowing a payment id is not enough to confirm anything.
export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ status: 'error' }, { status: 400 })

  try {
    const result = await finalizeBooking(parsed.data.paymentIntentId)
    console.log('🧾 [confirm]', parsed.data.paymentIntentId, result.status)
    if (result.status === 'confirmed') {
      // Emails go out after the response, so the visitor sees "You're booked" without waiting on them.
      // If the calendar event isn't ready, the Stripe webhook retries both later.
      if (result.calendarReady) {
        after(() => sendBookingEmails(result.booking).catch((err) => console.error('❌ [confirm] Emails failed', err)))
      }
      return NextResponse.json({ status: 'confirmed', meetUrl: result.booking.meet_url })
    }
    return NextResponse.json({ status: result.status })
  } catch (err) {
    console.error('❌ [confirm] Failed', err)
    return NextResponse.json({ status: 'error' }, { status: 500 })
  }
}
