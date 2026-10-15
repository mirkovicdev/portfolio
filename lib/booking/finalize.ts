// Turns a successful payment into a confirmed booking + Google Calendar event with a Meet link.
// Emails are sent separately (sendBookingEmails in ./notify) once the Meet link exists.
// Called by both /api/booking/confirm (right after paying) and the Stripe webhook (backup), so it is idempotent.
import 'server-only'
import { site, formatPrice } from '@/lib/site'
import { backgroundLabel, hostLabel, isFree, isLinkCall } from './labels'
import { stripe, BOOKING_SOURCE } from './stripe'
import { getBooking, markConfirmed, updateBooking, type BookingRow } from './db'
import { createCalendarEvent, googleConfigured } from './google'

export type FinalizeResult =
  | { status: 'ignored' } // not a booking payment (e.g. a QuantFrame subscription)
  | { status: 'unpaid' }
  | { status: 'cancelled' } // time was taken while paying and the payment was refunded
  | { status: 'confirmed'; booking: BookingRow; calendarReady: boolean }

// Shown in your calendar event (Google sends the client nothing; they get our email)
function eventDescription(b: BookingRow) {
  const background = backgroundLabel(b)
  return [
    `${site.booking.durationMin}-minute 1:1 video call booked on mirkovic.dev.`,
    '',
    `Topic: ${hostLabel(b)}`,
    background ? `Background: ${background}` : null,
    `Paid: ${isFree(b) ? 'free' : formatPrice(b.amount_cents / 100, b.currency)}${isLinkCall(b) ? ' (personal link)' : ''}`,
    `Client time zone: ${b.visitor_time_zone ?? 'unknown'}`,
    '',
    'What to talk about:',
    b.message?.trim() || 'Nothing added.',
  ]
    .filter((line) => line !== null)
    .join('\n')
}

// Creates the Google Calendar event with a Meet link and stores both on the booking. Throws if Google fails.
// Repeat-safe: the event id is derived from the booking id. Also used for free calls (/api/booking/invite).
export async function addCalendarEvent(booking: BookingRow): Promise<BookingRow> {
  if (booking.google_event_id || !googleConfigured()) return booking
  const { eventId, meetUrl } = await createCalendarEvent({
    bookingId: booking.id,
    start: booking.start_at,
    end: booking.end_at,
    timeZone: site.booking.hostTimeZone,
    summary: `${hostLabel(booking)}: ${booking.name} and ${site.name}`,
    description: eventDescription(booking),
    guestName: booking.name,
    guestEmail: booking.email,
  })
  await updateBooking(booking.id, { google_event_id: eventId, meet_url: meetUrl })
  console.log('📅 [booking] Calendar event created', booking.id)
  return { ...booking, google_event_id: eventId, meet_url: meetUrl }
}

export async function finalizeBooking(paymentIntentId: string): Promise<FinalizeResult> {
  const pi = await stripe().paymentIntents.retrieve(paymentIntentId)
  const bookingId = pi.metadata?.booking_id
  if (pi.metadata?.source !== BOOKING_SOURCE || !bookingId) return { status: 'ignored' }
  if (pi.status !== 'succeeded') return { status: 'unpaid' }

  let booking = await getBooking(bookingId)
  if (!booking) throw new Error(`Booking ${bookingId} not found for ${pi.id}`)

  if (booking.status === 'pending' || booking.status === 'expired') {
    if (!(await markConfirmed(booking.id))) {
      // The hold ran out during a slow payment and someone else booked the time: refund in full
      await stripe().refunds.create({ payment_intent: pi.id }, { idempotencyKey: `refund-${booking.id}` })
      await updateBooking(booking.id, { status: 'cancelled', cancelled_at: new Date().toISOString(), cancel_reason: 'taken_while_paying' })
      console.warn('↩️ [booking] Time was taken while paying, refunded', booking.id)
      return { status: 'cancelled' }
    }
    booking = (await getBooking(booking.id))!
    console.log('✅ [booking] Confirmed', booking.id, booking.start_at)
  }
  if (booking.status === 'cancelled') return { status: 'cancelled' }

  if (!booking.google_event_id && googleConfigured()) {
    try {
      booking = await addCalendarEvent(booking)
    } catch (err) {
      // Payment is safe; the webhook retries this until it works
      console.error('❌ [booking] Calendar event failed', booking.id, err)
    }
  }

  return { status: 'confirmed', booking, calendarReady: Boolean(booking.google_event_id) || !googleConfigured() }
}
