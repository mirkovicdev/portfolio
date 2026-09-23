'use client'

import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { site } from '@/lib/site'
import { startsInWindow, type Window } from '@/lib/booking/slots'
import { formatRangeIn } from '@/lib/booking/zones'
import type { AdminBooking } from './UpcomingBookings'

interface Props {
  days: string[]
  draft: Window[]
  onDraftChange: (windows: Window[]) => void
  anyOpen: boolean // at least one selected day is currently open
  bookings: AdminBooking[] // bookings on the selected days
  onSaved: (days: string[], windows: Window[]) => void
  onCancel: () => void
}

const { durationMin, bufferMin, hostTimeZone } = site.booking
const PRESETS: { label: string; window: Window }[] = [
  { label: 'Morning', window: ['09:00', '12:00'] },
  { label: 'Afternoon', window: ['13:00', '17:00'] },
  { label: 'Evening', window: ['17:00', '20:00'] },
]
const fmtMinutes = (t: number) => `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`
const dayLabel = (day: string, weekday: 'long' | 'short') =>
  new Date(`${day}T12:00:00Z`).toLocaleDateString('en-GB', { timeZone: 'UTC', weekday, day: 'numeric', month: weekday === 'long' ? 'long' : 'short' })

// Problems with the draft, or null when it can be saved
function validate(windows: Window[]) {
  const sorted = [...windows].sort((a, b) => a[0].localeCompare(b[0]))
  if (sorted.some(([s, e]) => !s || !e || s >= e)) return 'Each range must end after it starts.'
  if (sorted.some(([s], i) => i > 0 && s < sorted[i - 1][1])) return 'Ranges overlap. Merge or move them.'
  return null
}

const timeInput =
  'h-11 w-[104px] rounded-xl border border-white/[0.08] bg-zinc-950 px-3 text-[15px] text-zinc-50 outline-none [color-scheme:dark] focus:border-white/25'

export default function DayEditor({ days, draft, onDraftChange, anyOpen, bookings, onSaved, onCancel }: Props) {
  const [status, setStatus] = useState<'idle' | 'saving' | 'error'>('idle')
  const [serverError, setServerError] = useState<string | null>(null)
  const problem = validate(draft)

  const update = (i: number, part: 0 | 1, value: string) =>
    onDraftChange(draft.map((w, j) => (j === i ? ((part === 0 ? [value, w[1]] : [w[0], value]) as Window) : w)))

  async function save(windows: Window[]) {
    setStatus('saving')
    setServerError(null)
    const res = await fetch('/api/admin/availability', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ days, windows }),
    }).catch(() => null)
    const data = await res?.json().catch(() => ({}))
    if (!res?.ok) {
      setStatus('error')
      setServerError(res?.status === 401 ? 'Your session expired. Reload the page and sign in again.' : data?.error ?? 'Could not save.')
      return
    }
    setStatus('idle')
    onSaved(days, data.windows)
  }

  return (
    <div className="mt-4 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
      <p className="text-[15px] font-medium text-zinc-50">{days.length === 1 ? dayLabel(days[0], 'long') : `${days.length} days selected`}</p>
      {days.length > 1 && <p className="mt-1 text-[12px] leading-relaxed text-zinc-400">{days.map((d) => dayLabel(d, 'short')).join(', ')}</p>}

      {bookings.length > 0 && (
        <div className="mt-3 rounded-xl border border-amber-400/20 bg-amber-400/10 px-3 py-2 text-[12px] leading-relaxed text-amber-200">
          Booked:{' '}
          {bookings.map((b) => `${formatRangeIn(b.start, b.end, hostTimeZone, false, 'short')} (${b.name})`).join(', ')}.
          Changing hours never cancels a booking; refund it in Stripe to cancel.
        </div>
      )}

      <div className="mt-4 space-y-2">
        {draft.length === 0 && <p className="text-[13px] text-zinc-400">Closed. Add a time range to open {days.length > 1 ? 'these days' : 'this day'}.</p>}
        {draft.map((w, i) => {
          const starts = startsInWindow(w, durationMin, durationMin + bufferMin)
          return (
            <div key={i}>
              <div className="flex items-center gap-2">
                <input type="time" step={900} value={w[0]} onChange={(e) => update(i, 0, e.target.value)} aria-label="From" className={timeInput} />
                <span className="text-zinc-500">to</span>
                <input type="time" step={900} value={w[1]} onChange={(e) => update(i, 1, e.target.value)} aria-label="To" className={timeInput} />
                <button
                  type="button"
                  aria-label="Remove range"
                  onClick={() => onDraftChange(draft.filter((_, j) => j !== i))}
                  className="grid size-11 place-items-center rounded-xl text-zinc-400 transition-colors hover:text-zinc-50"
                >
                  <X className="size-4" />
                </button>
              </div>
              <p className="mt-1 text-[12px] text-zinc-500">
                {w[0] < w[1]
                  ? starts.length
                    ? `Bookable at ${starts.map(fmtMinutes).join(', ')}`
                    : `Too short for a ${durationMin}-minute call`
                  : ''}
              </p>
            </div>
          )
        })}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => onDraftChange([...draft, p.window].sort((a, b) => a[0].localeCompare(b[0])))}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-white/[0.08] px-3 text-[13px] text-zinc-50 transition-colors hover:border-white/25"
          >
            <Plus className="size-3.5" aria-hidden /> {p.label} {p.window[0]}–{p.window[1]}
          </button>
        ))}
      </div>

      {(problem || serverError) && (
        <p role="alert" className="mt-3 text-[13px] text-red-400">
          {problem ?? serverError}
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={Boolean(problem) || status === 'saving' || (draft.length === 0 && !anyOpen)}
          onClick={() => save(draft)}
          className="h-11 flex-1 rounded-xl bg-zinc-50 px-4 text-[14px] font-medium text-zinc-950 transition-colors hover:bg-white disabled:opacity-50"
        >
          {status === 'saving' ? 'Saving…' : draft.length === 0 ? `Close ${days.length > 1 ? 'these days' : 'this day'}` : `Save ${days.length > 1 ? `${days.length} days` : 'day'}`}
        </button>
        <button type="button" onClick={onCancel} className="h-11 rounded-xl border border-white/[0.08] px-4 text-[14px] text-zinc-50 transition-colors hover:border-white/25">
          Cancel
        </button>
      </div>
    </div>
  )
}
