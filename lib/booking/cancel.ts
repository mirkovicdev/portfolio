// Reacts to money going back to the client, so you never have to clean up by hand:
// - full refund of an upcoming call → cancel it (you refunded because they asked, or you can't make it)
// - dispute on an upcoming call → cancel it; on a past call → only email you the evidence
// Called from the Stripe webhook, which can deliver the same event more than once, so every step is repeat-safe.
import 'server-only'
import { getBooking, getBookingByPaymentIntent, markCancelled } from './db'
import { deleteCalendarEvent, googleConfigured } from './google'
import { sendCancellationEmails, sendHostCancellationEmail, type DisputeInfo } from './notify'

// From the admin page: cancel a paid booking WITHOUT refunding it (test bookings, late cancellations).
// Frees the time, removes the calendar event silently, and optionally emails the client.
export async function cancelByHost(bookingId: string, notifyClient: boolean) {
  const booking = await getBooking(bookingId)
  if (!booking) return { status: 'not_found' as const }
  if (booking.status !== 'confirmed' || !(await markCancelled(booking.id, 'cancelled_by_host'))) {
    return { status: 'not_confirmed' as const }
  }

  let calendarRemoved = true
  if (booking.google_event_id && googleConfigured()) {
    try {
      await deleteCalendarEvent(booking.google_event_id)
    } catch (err) {
      calendarRemoved = false
      console.error('❌ [admin] Could not remove the calendar event', booking.id, err)
    }
  }
  const upcoming = new Date(booking.start_at) > new Date()
  const emailed = notifyClient && upcoming ? await sendHostCancellationEmail(booking) : false

  console.log(`🚫 [admin] Cancelled without refund`, booking.id, emailed ? '(client emailed)' : '(no email)')
  return { status: 'cancelled' as const, calendarRemoved, emailed }
}

// Returns false when something should be retried (the webhook then answers 500 and Stripe tries again)
export async function cancelForPayment(paymentIntentId: string, reason: 'refunded' | 'disputed', dispute?: DisputeInfo): Promise<boolean> {
  const booking = await getBookingByPaymentIntent(paymentIntentId)
  if (!booking) return true // not a booking payment (e.g. QuantFrame)

  const callHappened = new Date(booking.start_at) <= new Date()
  if (reason === 'refunded' && callHappened) return true // refund after the call (goodwill): nothing to cancel

  if (!callHappened) {
    const retryOfThis = booking.status === 'cancelled' && booking.cancel_reason === reason
    // e.g. our own refund when the time was taken while paying: already handled, nothing to announce
    if (booking.status !== 'confirmed' && !retryOfThis) return true
    // Another delivery of this same event won the race and is doing the work
    if (booking.status === 'confirmed' && !(await markCancelled(booking.id, reason))) return true

    if (booking.google_event_id && googleConfigured()) await deleteCalendarEvent(booking.google_event_id)
    console.log(`🚫 [booking] Cancelled (${reason})`, booking.id)
  }

  return sendCancellationEmails(booking, reason, callHappened, dispute)
}
