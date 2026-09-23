'use client'

import { useEffect, useRef } from 'react'
import { formatDayLong, formatMonth, formatWeekdayShort } from './format'

export interface BookingDay {
  key: string // visitor-local "YYYY-MM-DD"
  date: Date
  slots: Date[]
}

interface Props {
  days: BookingDay[]
  selected: string | null
  onSelect: (key: string) => void
}

// "September – October 2026" when the strip spans two months and nothing is picked yet
function monthLabel(days: BookingDay[], selected: BookingDay | undefined) {
  if (selected) return formatMonth(selected.date)
  const first = days[0]?.date
  const last = days[days.length - 1]?.date
  if (!first || !last) return ''
  if (first.getMonth() === last.getMonth() && first.getFullYear() === last.getFullYear()) return formatMonth(first)
  return `${first.toLocaleDateString('en-GB', { month: 'long' })} – ${formatMonth(last)}`
}

// Horizontally scrolling days from today; days without times are disabled. Nothing is pre-selected.
export default function DateStrip({ days, selected, onSelect }: Props) {
  const stripRef = useRef<HTMLDivElement>(null)
  const current = days.find((d) => d.key === selected)

  // Bring the chosen day to the middle of the strip (also when picked via "First available").
  // Scrolls only the strip; scrollIntoView would also move the page, and the two scrolls interrupt each other.
  useEffect(() => {
    const strip = stripRef.current
    const chip = selected ? strip?.querySelector<HTMLElement>(`[data-day="${selected}"]`) : null
    if (!strip || !chip) return
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    strip.scrollTo({ left: chip.offsetLeft - (strip.clientWidth - chip.offsetWidth) / 2, behavior: reduceMotion ? 'auto' : 'smooth' })
  }, [selected])

  return (
    <div>
      <p className="text-[13px] font-medium text-zinc-50">{monthLabel(days, current)}</p>
      <div
        ref={stripRef}
        className="relative -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1 [mask-image:linear-gradient(to_right,black_85%,transparent)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {days.map((day) => {
          const active = day.key === selected
          const disabled = day.slots.length === 0
          return (
            <button
              key={day.key}
              data-day={day.key}
              type="button"
              disabled={disabled}
              aria-pressed={active}
              aria-label={formatDayLong(day.date)}
              onClick={() => onSelect(day.key)}
              className={`flex h-[68px] w-[52px] shrink-0 flex-col items-center justify-center gap-1.5 rounded-xl border transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-300 ${
                active
                  ? 'border-zinc-50 bg-zinc-50 text-zinc-950'
                  : disabled
                    ? 'cursor-not-allowed border-transparent text-zinc-700'
                    : 'border-white/[0.08] text-zinc-50 hover:border-white/25'
              }`}
            >
              <span className={`text-[11px] ${active ? 'text-zinc-950/60' : disabled ? '' : 'text-zinc-400'}`}>{formatWeekdayShort(day.date)}</span>
              <span className="text-[18px] font-medium leading-none">{day.date.getDate()}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
