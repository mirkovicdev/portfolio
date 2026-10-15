'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { formatDayLong, formatMonth, formatWeekdayShort } from './format'
import { focusRing } from './styles'

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

const arrowClass = `grid size-9 place-items-center rounded-full border border-white/[0.08] text-zinc-400 transition-colors hover:border-white/25 hover:text-zinc-50 disabled:pointer-events-none disabled:opacity-30 ${focusRing}`

const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Horizontally scrolling days from today; days without times are disabled. Nothing is pre-selected.
// Phones swipe; the arrows are for mouse users, whose wheel only scrolls the page up and down.
export default function DateStrip({ days, selected, onSelect }: Props) {
  const stripRef = useRef<HTMLDivElement>(null)
  const current = days.find((d) => d.key === selected)
  // Whether the strip is scrolled to its start / end (both true = everything fits, no arrows)
  const [edges, setEdges] = useState({ start: true, end: true })

  const updateEdges = useCallback(() => {
    const strip = stripRef.current
    if (!strip) return
    setEdges({ start: strip.scrollLeft <= 1, end: strip.scrollLeft + strip.clientWidth >= strip.scrollWidth - 1 })
  }, [])

  useEffect(() => {
    updateEdges()
    window.addEventListener('resize', updateEdges)
    return () => window.removeEventListener('resize', updateEdges)
  }, [updateEdges, days])

  // A screenful of days per click, in whole days; the last day you saw stays in view so it's clear where you are
  function page(direction: 1 | -1) {
    const strip = stripRef.current
    if (!strip) return
    const stride = 60 // day width 52 + gap 8
    const step = Math.max(1, Math.floor(strip.clientWidth / stride) - 1) * stride
    strip.scrollBy({ left: direction * step, behavior: reduceMotion() ? 'auto' : 'smooth' })
  }

  // Bring the chosen day to the middle of the strip (also when picked via "First available").
  // Scrolls only the strip; scrollIntoView would also move the page, and the two scrolls interrupt each other.
  useEffect(() => {
    const strip = stripRef.current
    const chip = selected ? strip?.querySelector<HTMLElement>(`[data-day="${selected}"]`) : null
    if (!strip || !chip) return
    strip.scrollTo({ left: chip.offsetLeft - (strip.clientWidth - chip.offsetWidth) / 2, behavior: reduceMotion() ? 'auto' : 'smooth' })
  }, [selected])

  return (
    <div>
      {/* Fixed height, so the arrows appearing after the first measure don't shift the layout */}
      <div className="flex h-9 items-center justify-between gap-3">
        <p className="text-[13px] font-medium text-zinc-50">{monthLabel(days, current)}</p>
        {!(edges.start && edges.end) && (
          <div className="flex gap-1.5">
            <button type="button" aria-label="Earlier days" disabled={edges.start} onClick={() => page(-1)} className={arrowClass}>
              <ChevronLeft className="size-4" aria-hidden />
            </button>
            <button type="button" aria-label="Later days" disabled={edges.end} onClick={() => page(1)} className={arrowClass}>
              <ChevronRight className="size-4" aria-hidden />
            </button>
          </div>
        )}
      </div>
      <div
        ref={stripRef}
        onScroll={updateEdges}
        className={`relative -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
          // Fade on the right hints at more days; dropped at the end so the last day isn't dimmed
          edges.end ? '' : '[mask-image:linear-gradient(to_right,black_85%,transparent)]'
        }`}
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
