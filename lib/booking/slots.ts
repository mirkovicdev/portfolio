// Slot generation + time zone helpers. Pure functions, shared by the server (booking) and the admin page (preview).

// Minutes that `timeZone` is ahead of UTC at `date` (e.g. +120 for Oslo in summer)
export function tzOffsetMinutes(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(date)
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value)
  const asUtc = Date.UTC(get('year'), get('month') - 1, get('day'), get('hour'), get('minute'), get('second'))
  return Math.round((asUtc - date.getTime()) / 60000)
}

// Wall-clock time in `timeZone` → absolute instant (DST-safe for normal hours)
export function zonedToUtc(y: number, m: number, d: number, h: number, min: number, timeZone: string) {
  const guess = Date.UTC(y, m, d, h, min)
  return new Date(guess - tzOffsetMinutes(new Date(guess), timeZone) * 60000)
}

// Calendar date (y, m, d) of `date` as seen in `timeZone`
function zonedDate(date: Date, timeZone: string) {
  const [y, m, d] = new Intl.DateTimeFormat('en-CA', { timeZone }).format(date).split('-').map(Number)
  return { y, m: m - 1, d }
}

// "2026-10-06": the date of `date` in `timeZone` (the key used for opened days)
export const zonedDayKey = (date: Date, timeZone: string) => new Intl.DateTimeFormat('en-CA', { timeZone }).format(date)

export type Window = [string, string] // ["17:00", "20:00"], wall-clock in the host time zone

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

// Start times (minutes after midnight) that fit in a window.
// E.g. 17:00–20:00 with 45-min calls every 60 min → 17:00, 18:00, 19:00
export function startsInWindow([start, end]: Window, durationMin: number, stepMin: number) {
  const starts: number[] = []
  for (let t = toMinutes(start); t + durationMin <= toMinutes(end); t += stepMin) starts.push(t)
  return starts
}

interface GenerateOptions {
  now: Date
  daysAhead: number
  timeZone: string
  windowsByDay: Record<string, Window[]> // opened days, keyed "YYYY-MM-DD" in the host time zone
  durationMin: number
  stepMin?: number // gap between start times; defaults to durationMin (use duration + buffer)
  minNoticeHours: number
}

// All bookable start times in the booking window, as absolute instants
export function generateSlots(opts: GenerateOptions): Date[] {
  const { now, daysAhead, timeZone, windowsByDay, durationMin, minNoticeHours } = opts
  const stepMin = opts.stepMin ?? durationMin
  const earliest = now.getTime() + minNoticeHours * 3600_000
  const today = zonedDate(now, timeZone)
  const slots: Date[] = []

  for (let i = 0; i < daysAhead; i++) {
    // Date-only arithmetic in UTC avoids DST edge cases
    const day = new Date(Date.UTC(today.y, today.m, today.d + i))
    const windows = windowsByDay[day.toISOString().slice(0, 10)] ?? []

    for (const window of windows) {
      for (const t of startsInWindow(window, durationMin, stepMin)) {
        const slot = zonedToUtc(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), Math.floor(t / 60), t % 60, timeZone)
        if (slot.getTime() >= earliest) slots.push(slot)
      }
    }
  }
  return slots
}

export interface Interval {
  start: Date
  end: Date
}

// True if [start, end) padded by `paddingMs` on both sides overlaps any busy interval
export function overlapsAny(start: Date, end: Date, busy: Interval[], paddingMs = 0) {
  const s = start.getTime() - paddingMs
  const e = end.getTime() + paddingMs
  return busy.some((b) => s < b.end.getTime() && e > b.start.getTime())
}

// Visitor-local day key, e.g. "2026-09-23"
export function localDayKey(date: Date) {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}
