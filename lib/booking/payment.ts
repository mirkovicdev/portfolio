// Stripe payments for held times. Shared by the public checkout (/api/booking/checkout) and paid
// personal links (/api/booking/invite), so both are confirmed, refunded and disputed the same way.
import 'server-only'
import { site } from '@/lib/site'
import { BOOKING_SOURCE, stripe } from './stripe'
import { getBooking, getPendingInviteHolds, releaseHold, updateBooking, type BookingRow } from './db'

const { booking } = site

// "Wed 23 Sept, 17:00" in the host's time zone, for the Stripe payment description
const hostTime = (d: Date) =>
  new Intl.DateTimeFormat('en-GB', {
    timeZone: booking.hostTimeZone,
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)

// Creates the payment for a held time (amount from the hold, never from the browser).
// If Stripe fails, the time is released so it isn't blocked for nothing.
export async function createBookingPayment(hold: BookingRow, label: string) {
  try {
    const pi = await stripe().paymentIntents.create(
      {
        amount: hold.amount_cents,
        currency: hold.currency,
        payment_method_types: ['card'], // includes Apple Pay and Google Pay; nothing that leaves the page
        receipt_email: hold.email,
        description: `${label}, ${booking.durationMin}-min call, ${hostTime(new Date(hold.start_at))} (${booking.hostTimeZone})`,
        metadata: { source: BOOKING_SOURCE, booking_id: hold.id, topic: hold.topic, start: hold.start_at },
      },
      { idempotencyKey: `booking-${hold.id}` }
    )
    await updateBooking(hold.id, { stripe_payment_intent_id: pi.id })
    return pi
  } catch (err) {
    await releaseHold(hold.id)
    throw err
  }
}

// Frees a held time whose payment never went through and voids that payment. Paid (or paying) holds are left alone.
export async function releaseUnpaidHold(id: string) {
  const prev = await getBooking(id)
  if (!prev || prev.status !== 'pending') return
  if (prev.stripe_payment_intent_id) {
    const pi = await stripe().paymentIntents.retrieve(prev.stripe_payment_intent_id)
    if (pi.status === 'succeeded' || pi.status === 'processing') return // already paid: leave it alone
    await stripe().paymentIntents.cancel(pi.id).catch(() => {})
  }
  await releaseHold(id)
}

// A paid link's earlier, unfinished checkout (closed tab, changed their mind): cleared so they can book again
export async function releaseUnpaidInviteHolds(inviteId: string) {
  for (const hold of await getPendingInviteHolds(inviteId)) await releaseUnpaidHold(hold.id)
}
