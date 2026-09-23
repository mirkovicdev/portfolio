// Shared Tailwind class strings for the booking UI
export const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-300'

// Selectable pill (topics, background); selected = inverted.
// Compact + flex-1 so a row of three fits on one line on phones and stretches evenly when there's room.
export const chipClass = (active: boolean) =>
  `h-10 flex-1 whitespace-nowrap rounded-xl border px-2 text-[13px] transition-colors ${focusRing} ${
    active ? 'border-zinc-50 bg-zinc-50 text-zinc-950' : 'border-white/[0.08] text-zinc-50 hover:border-white/25'
  }`

export const inputClass =
  'w-full rounded-xl border border-white/[0.08] bg-zinc-950 px-4 text-[16px] text-zinc-50 placeholder:text-zinc-600 outline-none transition-colors focus:border-white/25'
