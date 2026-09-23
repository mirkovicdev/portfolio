import { formatTime } from './format'

interface Props {
  slots: Date[]
  selected: Date | null
  onSelect: (slot: Date) => void
}

// Start times for the selected day, in the visitor's own time zone
export default function SlotGrid({ slots, selected, onSelect }: Props) {
  if (slots.length === 0) {
    return <p className="mt-4 text-[14px] text-zinc-400">No open times on this day. Pick another date.</p>
  }

  return (
    <div className="mt-4 grid grid-cols-3 gap-2">
      {slots.map((slot) => {
        const active = selected?.getTime() === slot.getTime()
        return (
          <button
            key={slot.getTime()}
            type="button"
            aria-pressed={active}
            onClick={() => onSelect(slot)}
            className={`h-11 rounded-xl border text-[15px] font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-300 ${
              active ? 'border-zinc-50 bg-zinc-50 text-zinc-950' : 'border-white/[0.08] text-zinc-50 hover:border-white/25'
            }`}
          >
            {formatTime(slot)}
          </button>
        )
      })}
    </div>
  )
}
