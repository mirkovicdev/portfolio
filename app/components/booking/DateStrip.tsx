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

// Horizontally scrolling row of the next two weeks; days without times are disabled
export default function DateStrip({ days, selected, onSelect }: Props) {
  const current = days.find((d) => d.key === selected)?.date ?? days[0]?.date

  return (
    <div>
      <p className="text-[13px] font-medium text-zinc-50">
        {current && formatMonth(current)}
      </p>
      <div className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1 [mask-image:linear-gradient(to_right,black_85%,transparent)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {days.map((day) => {
          const active = day.key === selected
          const disabled = day.slots.length === 0
          return (
            <button
              key={day.key}
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
              <span className={`text-[11px] ${active ? 'text-zinc-950/60' : disabled ? '' : 'text-zinc-400'}`}>
                {formatWeekdayShort(day.date)}
              </span>
              <span className="text-[18px] font-medium leading-none">{day.date.getDate()}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
