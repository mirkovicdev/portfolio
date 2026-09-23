// Which start times can actually be booked: the days you opened (admin page) minus calendar busy times
// minus existing bookings.
import 'server-only'
import { site } from '@/lib/site'
import { generateSlots, overlapsAny, zonedDayKey, type Interval } from './slots'
import { getGoogleBusy } from './google'
import { getActiveBookings, getOpenedDays } from './db'

const { booking } = site
const slotMs = booking.durationMin * 60000
const bufferMs = booking.bufferMin * 60000

// Start times allowed by the opened days, the notice period and the booking window
async function candidateSlots(now: Date) {
  const windowsByDay = await getOpenedDays(
    zonedDayKey(now, booking.hostTimeZone),
    zonedDayKey(new Date(now.getTime() + booking.daysAhead * 864e5), booking.hostTimeZone)
  )
  return generateSlots({
    now,
    daysAhead: booking.daysAhead,
    timeZone: booking.hostTimeZone,
    windowsByDay,
    durationMin: booking.durationMin,
    stepMin: booking.durationMin + booking.bufferMin,
    minNoticeHours: booking.minNoticeHours,
  })
}

// Everything that blocks a time in [from, to), widened by the buffer
async function busyBetween(from: Date, to: Date): Promise<Interval[]> {
  const padFrom = new Date(from.getTime() - bufferMs)
  const padTo = new Date(to.getTime() + bufferMs)
  const [calendar, bookings] = await Promise.all([getGoogleBusy(padFrom, padTo), getActiveBookings(padFrom, padTo)])
  return [...calendar, ...bookings]
}

const isFree = (start: Date, busy: Interval[]) => !overlapsAny(start, new Date(start.getTime() + slotMs), busy, bufferMs)

export async function getAvailableSlots(now = new Date()): Promise<Date[]> {
  const candidates = await candidateSlots(now)
  if (candidates.length === 0) return []
  const busy = await busyBetween(candidates[0], new Date(candidates[candidates.length - 1].getTime() + slotMs))
  return candidates.filter((slot) => isFree(slot, busy))
}

// Server-side re-check of one requested start time; never trust what the browser sends
export async function isSlotAvailable(start: Date, now = new Date()): Promise<boolean> {
  const allowed = (await candidateSlots(now)).some((s) => s.getTime() === start.getTime())
  if (!allowed) return false
  return isFree(start, await busyBetween(start, new Date(start.getTime() + slotMs)))
}

export const slotEnd = (start: Date) => new Date(start.getTime() + slotMs)
