'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Window } from '@/lib/booking/slots'

interface Props {
  today: string // "YYYY-MM-DD" in Oslo
  opened: Record<string, Window[]>
  bookingCount: Record<string, number>
  selected: string[]
  onToggle: (day: string) => void
}

const MONTHS_AHEAD = 4
const pad = (n: number) => String(n).padStart(2, '0')
const dayKey = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

// Month grid (Monday first). Tap days to select several; green = open, dot = has a booking.
export default function AvailabilityCalendar({ today, opened, bookingCount, selected, onToggle }: Props) {
  const [ty, tm] = today.split('-').map(Number)
  const [offset, setOffset] = useState(0) // months after the current one

  // Date-only math in UTC, so the grid never shifts with time zones
  const first = new Date(Date.UTC(ty, tm - 1 + offset, 1))
  const y = first.getUTCFullYear()
  const m = first.getUTCMonth()
  const daysInMonth = new Date(Date.UTC(y, m + 1, 0)).getUTCDate()
  const leading = (first.getUTCDay() + 6) % 7
  const title = first.toLocaleDateString('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' })

  const navButton =
    'grid size-9 place-items-center rounded-xl border border-white/[0.08] text-zinc-50 transition-colors hover:border-white/25 disabled:opacity-30 disabled:hover:border-white/[0.08]'

  return (
    <div className="mt-5 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
      <div className="flex items-center justify-between">
        <button type="button" aria-label="Previous month" disabled={offset === 0} onClick={() => setOffset(offset - 1)} className={navButton}>
          <ChevronLeft className="size-4" />
        </button>
        <p className="text-[15px] font-medium text-zinc-50">{title}</p>
        <button type="button" aria-label="Next month" disabled={offset === MONTHS_AHEAD} onClick={() => setOffset(offset + 1)} className={navButton}>
          <ChevronRight className="size-4" />
        </button>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-1 text-center text-[11px] text-zinc-500">
        {WEEKDAYS.map((w) => (
          <span key={w}>{w}</span>
        ))}
      </div>

      <div className="mt-2 grid grid-cols-7 gap-1">
        {Array.from({ length: leading }, (_, i) => (
          <span key={`pad-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const key = dayKey(y, m, i + 1)
          const past = key < today
          const isOpen = Boolean(opened[key])
          const isSelected = selected.includes(key)
          const booked = bookingCount[key] ?? 0
          return (
            <button
              key={key}
              type="button"
              disabled={past}
              aria-pressed={isSelected}
              aria-label={`${key}${isOpen ? ', open' : ''}${booked ? `, ${booked} booking${booked > 1 ? 's' : ''}` : ''}`}
              onClick={() => onToggle(key)}
              className={`relative flex h-11 flex-col items-center justify-center rounded-xl border text-[14px] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-300 ${
                isSelected
                  ? 'border-zinc-50 bg-zinc-50 text-zinc-950'
                  : past
                    ? 'cursor-not-allowed border-transparent text-zinc-700'
                    : isOpen
                      ? 'border-phthalo-500/50 bg-phthalo-950 text-zinc-50 hover:border-phthalo-400'
                      : 'border-white/[0.06] text-zinc-300 hover:border-white/25'
              }`}
            >
              {i + 1}
              {booked > 0 && (
                <span className={`absolute bottom-1.5 size-1 rounded-full ${isSelected ? 'bg-zinc-950' : 'bg-zinc-50'}`} aria-hidden />
              )}
            </button>
          )
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-zinc-400">
        <span className="flex items-center gap-1.5">
          <span className="size-3 rounded border border-phthalo-500/50 bg-phthalo-950" aria-hidden /> Open
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-zinc-50" aria-hidden /> Has a booking
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-3 rounded bg-zinc-50" aria-hidden /> Selected
        </span>
      </div>
    </div>
  )
}
