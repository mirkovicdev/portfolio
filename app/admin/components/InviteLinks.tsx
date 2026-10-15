'use client'

import { useState, type FormEvent } from 'react'
import { Check, Copy } from 'lucide-react'
import { site, formatPrice } from '@/lib/site'

export interface AdminInvite {
  id: string
  label: string | null
  createdAt: string
  url: string
  price: number // whole dollars; 0 = free call
}

const inputClass =
  'h-11 w-full rounded-xl border border-white/[0.08] bg-zinc-950 px-4 text-[15px] text-zinc-50 placeholder:text-zinc-600 outline-none transition-colors focus:border-white/25'
const created = (iso: string) =>
  new Intl.DateTimeFormat('en-GB', { timeZone: site.booking.hostTimeZone, day: 'numeric', month: 'short' }).format(new Date(iso))

// Personal one-time links, free or paid: create, copy, send. A booked link leaves this list (the call shows
// under Upcoming bookings); cancelling that call makes the link work again.
export default function InviteLinks({ initialInvites }: { initialInvites: AdminInvite[] }) {
  const [invites, setInvites] = useState(initialInvites)
  const [label, setLabel] = useState('')
  const [paid, setPaid] = useState(false)
  const [price, setPrice] = useState('') // whole dollars, as typed
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  const failed = (status?: number) => (status === 401 ? 'Your session expired. Reload the page and sign in again.' : null)

  async function copy(invite: AdminInvite) {
    try {
      await navigator.clipboard.writeText(invite.url)
      setCopied(invite.id)
      setTimeout(() => setCopied((id) => (id === invite.id ? null : id)), 2000)
    } catch {
      // Some browsers block copying after an await; the Copy button still works
    }
  }

  async function create(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const amount = Number(price)
    if (paid && !(Number.isInteger(amount) && amount >= 1 && amount <= 10000)) {
      return setError('Enter a whole-dollar price between $1 and $10,000.')
    }
    setBusy(true)
    setError(null)
    const res = await fetch('/api/admin/invites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ label: label.trim() || undefined, price: paid ? amount : 0 }),
    }).catch(() => null)
    const data = (await res?.json().catch(() => null)) as AdminInvite | null
    setBusy(false)
    if (!res?.ok || !data) return setError(failed(res?.status) ?? 'Could not create the link.')
    setInvites((list) => [data, ...list])
    // Back to a free link, so the next one is never paid by accident
    setLabel('')
    setPaid(false)
    setPrice('')
    copy(data)
  }

  async function revoke(invite: AdminInvite) {
    if (!window.confirm(`Revoke the link${invite.label ? ` for ${invite.label}` : ''}? It stops working right away.`)) return
    setError(null)
    const res = await fetch('/api/admin/invites', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: invite.id }),
    }).catch(() => null)
    if (!res?.ok) return setError(failed(res?.status) ?? 'Could not revoke the link.')
    setInvites((list) => list.filter((x) => x.id !== invite.id))
  }

  return (
    <>
      <form onSubmit={create} className="mt-4 space-y-2">
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          maxLength={100}
          placeholder="Who is it for? (only you see this)"
          aria-label="Who is the link for"
          className={inputClass}
        />
        <div className="flex gap-2">
          {/* Off = free call; on = they pay this price by card when booking */}
          <button
            type="button"
            role="switch"
            aria-checked={paid}
            onClick={() => {
              setPaid(!paid)
              setError(null)
            }}
            className="flex h-11 shrink-0 items-center gap-2.5 rounded-xl border border-white/[0.08] px-3 text-[14px] text-zinc-50 transition-colors hover:border-white/25"
          >
            <span className={`relative h-5 w-9 rounded-full transition-colors ${paid ? 'bg-phthalo-500' : 'bg-zinc-700'}`} aria-hidden>
              <span className={`absolute top-0.5 size-4 rounded-full bg-zinc-50 transition-transform ${paid ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
            </span>
            Paid
          </button>
          {paid ? (
            <label className="relative min-w-0 flex-1">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[15px] text-zinc-400">$</span>
              <input
                type="number"
                inputMode="numeric"
                min={1}
                max={10000}
                step={1}
                required
                autoFocus
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Price"
                aria-label="Price in US dollars"
                className={`${inputClass} pl-8`}
              />
            </label>
          ) : (
            <p className="flex min-w-0 flex-1 items-center text-[13px] text-zinc-500">Free call</p>
          )}
          <button
            type="submit"
            disabled={busy}
            className="h-11 shrink-0 rounded-xl bg-zinc-50 px-4 text-[14px] font-medium text-zinc-950 transition-colors hover:bg-white disabled:opacity-60"
          >
            {busy ? 'Creating…' : 'Create link'}
          </button>
        </div>
      </form>

      {error && (
        <p role="alert" className="mt-3 text-[13px] text-red-400">
          {error}
        </p>
      )}

      {invites.length === 0 ? (
        <p className="mt-4 text-[14px] text-zinc-400">No unused links.</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {invites.map((invite) => (
            <li key={invite.id} className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
              <div className="flex items-baseline justify-between gap-3">
                <p className="truncate text-[14px] text-zinc-50">{invite.label || 'No name'}</p>
                <p className="shrink-0 text-[12px] text-zinc-500">
                  <span className="text-zinc-300">{invite.price ? formatPrice(invite.price, site.booking.currency) : 'Free'}</span> · Created{' '}
                  {created(invite.createdAt)}
                </p>
              </div>
              <p className="mt-1 truncate font-mono text-[12px] text-zinc-400">{invite.url}</p>
              <div className="mt-3 flex gap-4">
                <button
                  type="button"
                  onClick={() => copy(invite)}
                  className="inline-flex items-center gap-1.5 text-[13px] text-zinc-50 underline decoration-white/30 underline-offset-4 hover:decoration-zinc-50"
                >
                  {copied === invite.id ? <Check className="size-3.5 text-phthalo-300" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
                  {copied === invite.id ? 'Copied' : 'Copy link'}
                </button>
                <button
                  type="button"
                  onClick={() => revoke(invite)}
                  className="text-[13px] text-zinc-400 underline decoration-white/20 underline-offset-4 hover:text-zinc-50"
                >
                  Revoke
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
