// How a booking is named in emails, the calendar and on /admin.
// Public calls are named after their topic; calls through a personal /meet link after site.booking.invite,
// whether the link is free or paid.
import { site } from '@/lib/site'
import { getTopic } from './catalog'
import type { BookingRow } from './db'

type Named = Pick<BookingRow, 'topic' | 'amount_cents' | 'invite_id'>

// $0 is only possible through a personal link (the database enforces it)
export const isFree = (b: Pick<BookingRow, 'amount_cents'>) => b.amount_cents === 0

// Booked through a personal link (free or paid)
export const isLinkCall = (b: Pick<BookingRow, 'invite_id'>) => b.invite_id !== null

// For you: "Study plan" / "Free call" / "Paid call"
export const hostLabel = (b: Named) =>
  isLinkCall(b) ? (isFree(b) ? 'Free call' : 'Paid call') : getTopic(b.topic)?.label ?? b.topic

// For the client, inside a sentence: "your Study plan call" / "your call"
export const callNoun = (b: Named) => (isLinkCall(b) ? 'call' : `${hostLabel(b)} call`)

// For the client, as a title: "Study plan with Antonije Mirkovic" / "Call with Antonije"
export const callTitle = (b: Named) => (isLinkCall(b) ? site.booking.invite.title : `${hostLabel(b)} with ${site.name}`)

// "Student", or null when the question wasn't asked (personal links)
export const backgroundLabel = (b: Pick<BookingRow, 'background'>) =>
  b.background ? site.booking.backgrounds.find((x) => x.id === b.background)?.label ?? b.background : null

// What the client is told about cancelling: paid calls (public or link) have the 24-hour rule
export const cancellationText = (b: Pick<BookingRow, 'amount_cents'>) =>
  isFree(b) ? site.booking.invite.policy : site.booking.cancellationPolicy
