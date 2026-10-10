'use client'

import { useState, type FormEvent } from 'react'
import { site } from '@/lib/site'
import { focusRing, inputClass } from './styles'
import { visitorUses12h } from './format'

const { booking } = site

export interface InviteBooked {
  email: string
  meetUrl: string | null
}

interface Props {
  token: string
  slot: Date | null
  summary: string | null
  onBooked: (result: InviteBooked) => void
  onTaken: () => void
  onLinkGone: (reason: 'used' | 'invalid') => void
}

// Free call: name, email, optional message, one button. No payment; the server books it right away.
export default function InviteForm({ token, slot, summary, onBooked, onTaken, onLinkGone }: Props) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!slot) return
    setError(null)
    setPending(true)

    try {
      const res = await fetch('/api/booking/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          start: slot.toISOString(),
          name: name.trim(),
          email: email.trim(),
          message: message.trim(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          hour12: visitorUses12h(),
        }),
      })
      if (res.status === 409) return onTaken()
      if (res.status === 404 || res.status === 410) return onLinkGone(res.status === 410 ? 'used' : 'invalid')

      const data = await res.json().catch(() => ({}))
      if (!res.ok || data.status !== 'confirmed') {
        return setError(`Could not book the call. Try again, or email ${site.contactEmail}.`)
      }
      onBooked({ email: email.trim(), meetUrl: data.meetUrl ?? null })
    } catch {
      setError(`Could not reach the server. Check your connection and try again.`)
    } finally {
      setPending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-5 border-t border-white/[0.08] pt-5 animate-in fade-in slide-in-from-top-1 duration-300 motion-reduce:animate-none">
      <p className="text-[15px] font-medium text-zinc-50">{summary ?? 'Pick a time above'}</p>

      <div className="mt-4 space-y-3">
        <label className="block">
          <span className="text-[13px] text-zinc-400">Name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} required maxLength={100} autoComplete="name" className={`${inputClass} mt-1.5 h-12`} />
        </label>
        <label className="block">
          <span className="text-[13px] text-zinc-400">Email</span>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required maxLength={200} autoComplete="email" className={`${inputClass} mt-1.5 h-12`} />
        </label>
        <label className="block">
          <span className="text-[13px] text-zinc-400">What do you want to talk about? (optional)</span>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            maxLength={2000}
            placeholder="The more context, the better I can prepare."
            className={`${inputClass} mt-1.5 resize-none py-3`}
          />
        </label>
      </div>

      <p className="mt-4 text-[12px] leading-relaxed text-zinc-400">{booking.invite.policy}</p>

      {error && (
        <p role="alert" className="mt-3 text-[13px] text-red-400">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending || !slot}
        className={`mt-4 h-12 w-full rounded-xl bg-zinc-50 text-[15px] font-medium text-zinc-950 transition-colors hover:bg-white disabled:opacity-60 ${focusRing}`}
      >
        {pending ? 'Booking…' : 'Book call'}
      </button>
      <p className="mt-3 text-center text-[12px] leading-relaxed text-zinc-400">Your confirmation and Google Meet link arrive by email.</p>
    </form>
  )
}
