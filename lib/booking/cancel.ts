// Reacts to money going back to the client, so you never have to clean up by hand:
// - full refund of an upcoming call → cancel it (you refunded because they asked, or you can't make it)
// - dispute on an upcoming call → cancel it; on a past call → only email you the evidence
// Called from the Stripe webhook, which can deliver the same event more than once, so every step is repeat-safe.
import 'server-only'
import { getBookingByPaymentIntent, markCancelled } from './db'
import { deleteCalendarEvent, googleConfigured } from './google'
import { sendCancellationEmails, type DisputeInfo } from './notify'

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
