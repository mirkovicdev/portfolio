import { NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { BOOKING_SOURCE, stripe } from '@/lib/booking/stripe'
import { finalizeBooking } from '@/lib/booking/finalize'
import { sendBookingEmails } from '@/lib/booking/notify'
import { cancelForPayment } from '@/lib/booking/cancel'
import { releaseHold } from '@/lib/booking/db'

// Stripe tells us about payments here:
// - succeeded: backup confirmation, in case the visitor closed the tab right after paying
// - canceled: frees the held time
// - charge refunded (in full) / dispute opened: cancels the call automatically
// Only messages signed with STRIPE_WEBHOOK_SECRET are accepted. Stripe retries on any non-2xx response,
// which is how a failed calendar change or email gets another try.
const retry = (reason: string) => NextResponse.json({ error: reason }, { status: 500 })
const paymentIntentId = (pi: string | Stripe.PaymentIntent | null) => (typeof pi === 'string' ? pi : pi?.id)

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret) {
    console.error('❌ [webhook] STRIPE_WEBHOOK_SECRET is not set')
    return NextResponse.json({ error: 'Not configured' }, { status: 500 })
  }

  let event: Stripe.Event
  try {
    event = stripe().webhooks.constructEvent(await req.text(), req.headers.get('stripe-signature') ?? '', secret)
  } catch {
    console.error('❌ [webhook] Invalid signature')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    if (event.type === 'payment_intent.succeeded') {
      const result = await finalizeBooking(event.data.object.id)
      if (result.status !== 'ignored') console.log('🔔 [webhook] payment_intent.succeeded', event.data.object.id, result.status)
      if (result.status === 'confirmed') {
        // Each email is claimed in the database, so this never duplicates what the page already sent
        const done = result.calendarReady && (await sendBookingEmails(result.booking))
        if (!done) return retry('Calendar event or emails pending')
      }
    }

    if (event.type === 'payment_intent.canceled') {
      const { metadata } = event.data.object
      if (metadata?.source === BOOKING_SOURCE && metadata.booking_id) await releaseHold(metadata.booking_id)
    }

    if (event.type === 'charge.refunded') {
      const charge = event.data.object
      const pi = paymentIntentId(charge.payment_intent)
      // Only a full refund cancels; a partial refund is just money back
      if (pi && charge.refunded) {
        console.log('🔔 [webhook] charge.refunded (full)', pi)
        if (!(await cancelForPayment(pi, 'refunded'))) return retry('Cancellation pending')
      }
    }

    if (event.type === 'charge.dispute.created') {
      const dispute = event.data.object
      const pi = paymentIntentId(dispute.payment_intent)
      if (pi) {
        console.log('🔔 [webhook] charge.dispute.created', pi, dispute.reason)
        const info = { id: dispute.id, reason: dispute.reason, dueBy: dispute.evidence_details?.due_by ?? null }
        if (!(await cancelForPayment(pi, 'disputed', info))) return retry('Dispute handling pending')
      }
    }
  } catch (err) {
    console.error('❌ [webhook] Handling failed', event.type, err)
    return NextResponse.json({ error: 'Handler failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
