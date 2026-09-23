import { NextResponse } from 'next/server'
import { z } from 'zod'
import { site } from '@/lib/site'
import { requireAdmin } from '@/lib/admin/session'
import { setOpenedDays } from '@/lib/booking/db'
import { zonedDayKey, type Window } from '@/lib/booking/slots'

const hhmm = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/)
const schema = z.object({
  days: z.array(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).min(1).max(62),
  windows: z.array(z.tuple([hhmm, hhmm])).max(6), // empty = close the days
})

const isRealDate = (day: string) => new Date(`${day}T00:00:00Z`).toISOString().slice(0, 10) === day

// Opens (or closes) the given days with the same time ranges. Admin only.
export async function PUT(req: Request) {
  if (!(await requireAdmin(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Invalid days or times' }, { status: 400 })
  const { days } = parsed.data

  // Ranges: start before end, sorted, no overlaps
  const windows = [...parsed.data.windows].sort((a, b) => a[0].localeCompare(b[0])) as Window[]
  const badRange = windows.some(([start, end], i) => start >= end || (i > 0 && start < windows[i - 1][1]))
  if (badRange) return NextResponse.json({ error: 'Each range must end after it starts, and ranges must not overlap' }, { status: 400 })

  // Days: real dates from today (Oslo) up to a year ahead
  const today = zonedDayKey(new Date(), site.booking.hostTimeZone)
  const maxDay = zonedDayKey(new Date(Date.now() + 366 * 864e5), site.booking.hostTimeZone)
  if (days.some((d) => !isRealDate(d) || d < today || d > maxDay)) {
    return NextResponse.json({ error: 'Days must be between today and a year from now' }, { status: 400 })
  }

  try {
    await setOpenedDays(days, windows)
    console.log(`🗓️ [admin] ${windows.length ? 'Opened' : 'Closed'} ${days.join(', ')}`, windows)
    return NextResponse.json({ days, windows })
  } catch (err) {
    console.error('❌ [admin] Saving availability failed', err)
    return NextResponse.json({ error: 'Could not save' }, { status: 500 })
  }
}
