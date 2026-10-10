'use client'

import { site } from '@/lib/site'
import DateStrip from './DateStrip'
import SlotGrid from './SlotGrid'
import { formatDayShort, formatTimeZone } from './format'
import type { OpenTimes } from './useOpenTimes'

const { booking } = site

interface Props {
  times: OpenTimes
  slot: Date | null
  notice: string | null // e.g. "Someone just booked that time"
  onSelectDay: (key: string) => void
  onSelectSlot: (slot: Date) => void
}

// Day strip, then that day's times in the visitor's time zone, with loading, error and empty states
export default function TimePicker({ times, slot, notice, onSelectDay, onSelectSlot }: Props) {
  const { slots, loadError, days, dayKey, timeZone } = times
  const daySlots = days.find((d) => d.key === dayKey)?.slots ?? []
  const firstOpenDay = days.find((d) => d.slots.length > 0)

  return (
    <>
      {notice && (
        <p role="alert" className="mb-4 rounded-xl border border-amber-400/20 bg-amber-400/10 px-3 py-2 text-[13px] text-amber-200">
          {notice}
        </p>
      )}
      {slots === null ? (
        // Same footprint as the date strip, avoids layout shift
        <div className="flex gap-2" aria-hidden>
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="h-[68px] w-[52px] animate-pulse rounded-xl bg-white/[0.04] motion-reduce:animate-none" />
          ))}
        </div>
      ) : loadError ? (
        <p className="text-[14px] text-zinc-400">
          Could not load open times. Refresh the page, or email {site.contactEmail} to book.
        </p>
      ) : days.length === 0 ? (
        <p className="text-[14px] text-zinc-400">
          No open times in the next {booking.daysAhead / 7} weeks. Email {site.contactEmail} and we will find a time.
        </p>
      ) : (
        <>
          <DateStrip days={days} selected={dayKey} onSelect={onSelectDay} />
          {dayKey ? (
            <>
              <SlotGrid slots={daySlots} selected={slot} onSelect={onSelectSlot} />
              <p className="mt-3 text-[12px] text-zinc-400">Times shown in your time zone: {formatTimeZone(timeZone)}</p>
            </>
          ) : (
            // Times appear only after a day is picked; point to the first open one
            <p className="mt-4 text-[14px] text-zinc-400">
              Pick a day to see times.
              {firstOpenDay && (
                <>
                  {' '}
                  First available:{' '}
                  <button
                    type="button"
                    onClick={() => onSelectDay(firstOpenDay.key)}
                    className="text-zinc-50 underline decoration-white/30 underline-offset-4 hover:decoration-zinc-50"
                  >
                    {formatDayShort(firstOpenDay.date)}
                  </button>
                </>
              )}
            </p>
          )}
        </>
      )}
    </>
  )
}
