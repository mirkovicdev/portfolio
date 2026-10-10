// How a booking is named in emails, the calendar and on /admin.
// Paid calls are named after their topic; free calls (personal /meet links) after site.booking.invite.
import { site } from '@/lib/site'
import { getTopic } from './catalog'
import type { BookingRow } from './db'

type Named = Pick<BookingRow, 'topic' | 'amount_cents'>

// $0 is only possible through a personal link (the database enforces it)
export const isFree = (b: Pick<BookingRow, 'amount_cents'>) => b.amount_cents === 0

// For you: "Study plan" / "Free call"
export const hostLabel = (b: Named) => (isFree(b) ? 'Free call' : getTopic(b.topic)?.label ?? b.topic)

// For the client, inside a sentence: "your Study plan call" / "your call"
export const callNoun = (b: Named) => (isFree(b) ? 'call' : `${hostLabel(b)} call`)

// For the client, as a title: "Study plan with Antonije Mirkovic" / "Call with Antonije"
export const callTitle = (b: Named) => (isFree(b) ? site.booking.invite.title : `${hostLabel(b)} with ${site.name}`)

// "Student", or null when the question wasn't asked (free calls)
export const backgroundLabel = (b: Pick<BookingRow, 'background'>) =>
  b.background ? site.booking.backgrounds.find((x) => x.id === b.background)?.label ?? b.background : null

// What the client is told about cancelling
export const cancellationText = (b: Pick<BookingRow, 'amount_cents'>) =>
  isFree(b) ? site.booking.invite.policy : site.booking.cancellationPolicy
