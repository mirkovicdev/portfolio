'use client'

import { useState } from 'react'
import { site } from '@/lib/site'
import { formatRangeIn, friendlyZoneName } from '@/lib/booking/zones'

export interface AdminBooking {
  id: string
  start: string
  end: string
  name: string
  email: string
  topic: string
  background: string
  message: string | null
  meetUrl: string | null
  paid: string
  clientTimeZone: string | null
  refundUrl: string | null
}

interface Props {
  bookings: AdminBooking[]
  onCancelled: (booking: AdminBooking, emailed: boolean) => void
}

const host = site.booking.hostTimeZone
const linkClass = 'text-[13px] text-zinc-50 underline decoration-white/30 underline-offset-4 hover:decoration-zinc-50'

// Paid calls from now on, soonest first. Cancel = refund in Stripe (normal) or cancel here without a refund.
export default function UpcomingBookings({ bookings, onCancelled }: Props) {
  const [confirming, setConfirming] = useState<string | null>(null)
  const [notify, setNotify] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function cancel(b: AdminBooking) {
    setBusy(true)
    setError(null)
    const res = await fetch('/api/admin/bookings/cancel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId: b.id, notifyClient: notify }),
    }).catch(() => null)
    const data = await res?.json().catch(() => ({}))
    setBusy(false)
    if (!res?.ok) {
      return setError(res?.status === 401 ? 'Your session expired. Reload the page and sign in again.' : data?.error ?? 'Could not cancel.')
    }
    setConfirming(null)
    onCancelled(b, Boolean(data.emailed))
  }

  if (bookings.length === 0) return <p className="mt-4 text-[14px] text-zinc-400">No upcoming bookings.</p>

  return (
    <ul className="mt-4 space-y-3">
      {bookings.map((b) => (
        <li key={b.id} className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-[15px] font-medium text-zinc-50">{formatRangeIn(b.start, b.end, host, false, 'short')}</p>
            <p className="shrink-0 text-[13px] text-zinc-400">{b.paid}</p>
          </div>
          <p className="mt-1 text-[14px] text-zinc-50">
            {b.name}, {b.topic}
          </p>
          <p className="mt-0.5 text-[13px] text-zinc-400">
            {b.background}
            {b.clientTimeZone && b.clientTimeZone !== host
              ? `. Their time: ${formatRangeIn(b.start, b.end, b.clientTimeZone, false, 'short')} ${friendlyZoneName(b.clientTimeZone)}`
              : ''}
          </p>
          {b.message && <p className="mt-3 line-clamp-4 whitespace-pre-line text-[13px] leading-relaxed text-zinc-300">{b.message}</p>}

          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
            {b.meetUrl && (
              <a href={b.meetUrl} target="_blank" rel="noopener noreferrer" className={linkClass}>
                Join Meet
              </a>
            )}
            <a href={`mailto:${b.email}`} className={linkClass}>
              Email {b.email}
            </a>
            {b.refundUrl && (
              <a href={b.refundUrl} target="_blank" rel="noopener noreferrer" className="text-[13px] text-red-400 underline decoration-red-400/30 underline-offset-4 hover:decoration-red-400">
                Refund to cancel
              </a>
            )}
            <button
              type="button"
              onClick={() => {
                setConfirming(b.id)
                setNotify(true)
                setError(null)
              }}
              className="text-[13px] text-zinc-400 underline decoration-white/20 underline-offset-4 hover:text-zinc-50"
            >
              Cancel without refund
            </button>
          </div>

          {confirming === b.id && (
            <div className="mt-4 rounded-xl border border-red-400/20 bg-red-400/[0.06] p-3">
              <p className="text-[13px] leading-relaxed text-zinc-200">
                Cancel {b.name}&apos;s call without refunding the payment? The calendar event is removed and the time can be booked again.
              </p>
              <label className="mt-3 flex items-center gap-2 text-[13px] text-zinc-300">
                <input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} className="size-4 accent-zinc-50" />
                Email {b.name.split(' ')[0]} that the call is cancelled
              </label>
              {error && (
                <p role="alert" className="mt-2 text-[13px] text-red-400">
                  {error}
                </p>
              )}
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => cancel(b)}
                  className="h-10 rounded-xl bg-red-500 px-4 text-[13px] font-medium text-white transition-colors hover:bg-red-400 disabled:opacity-50"
                >
                  {busy ? 'Cancelling…' : 'Cancel booking'}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirming(null)}
                  className="h-10 rounded-xl border border-white/[0.08] px-4 text-[13px] text-zinc-50 transition-colors hover:border-white/25"
                >
                  Keep it
                </button>
              </div>
            </div>
          )}
        </li>
      ))}
    </ul>
  )
}
