'use client'

import { useEffect, useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { site, formatPrice } from '@/lib/site'
import { chipClass, focusRing } from './styles'

const { booking } = site

// Clipboard API first; textarea fallback for in-app browsers that block it (e.g. Instagram)
async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    const el = document.createElement('textarea')
    el.value = text
    el.setAttribute('readonly', '')
    el.style.position = 'fixed'
    el.style.opacity = '0'
    document.body.appendChild(el)
    el.select()
    const ok = document.execCommand('copy')
    el.remove()
    return ok
  }
}

interface Props {
  selected: string | null
  onSelect: (topicId: string) => void
}

// Step 1: the topic decides the price (grouped by tier), or copy my email for anything bigger
export default function TopicPicker({ selected, onSelect }: Props) {
  const [copied, setCopied] = useState(false)

  // "Copied" confirmation disappears after 2s
  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(timer)
  }, [copied])

  return (
    <div>
      <p className="text-[13px] font-medium text-zinc-50">What do you need help with?</p>

      {booking.tiers.map((tier) => {
        const price = formatPrice(tier.price, booking.currency)
        return (
          <div key={tier.id} role="group" aria-label={`${tier.label}, ${price}`} className="mt-4">
            <div className="flex items-baseline justify-between gap-3 text-[13px] text-zinc-400">
              <span>{tier.label}</span>
              <span>
                {price} for {booking.durationMin} min
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {booking.topics
                .filter((t) => t.tier === tier.id)
                .map((t) => (
                  <button key={t.id} type="button" aria-pressed={selected === t.id} onClick={() => onSelect(t.id)} className={chipClass(selected === t.id)}>
                    {t.label}
                  </button>
                ))}
            </div>
          </div>
        )
      })}

      <button
        type="button"
        onClick={async () => setCopied(await copyText(site.contactEmail))}
        aria-label={`${booking.custom.label}: copy my email address, ${site.contactEmail}`}
        className={`mt-4 flex w-full items-center gap-3 rounded-xl border border-dashed border-white/15 px-4 py-3 text-left transition-colors hover:border-white/30 ${focusRing}`}
      >
        <span className="min-w-0 flex-1">
          <span className="block text-[14px] text-zinc-50">{booking.custom.label}</span>
          <span className="mt-0.5 block text-[12px] text-zinc-400">{booking.custom.description}</span>
          <span className="mt-2 block font-mono text-[13px] text-zinc-50">{site.contactEmail}</span>
        </span>
        {/* Fixed width so swapping Copy/Copied doesn't shift the text */}
        <span className="flex w-16 shrink-0 items-center justify-end gap-1.5 text-[12px] text-zinc-400">
          {copied ? <Check className="size-4 text-phthalo-300" aria-hidden /> : <Copy className="size-4" aria-hidden />}
          {copied ? 'Copied' : 'Copy'}
        </span>
      </button>
      <span aria-live="polite" className="sr-only">
        {copied ? 'Email address copied' : ''}
      </span>
    </div>
  )
}
