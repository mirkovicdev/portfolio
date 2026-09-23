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

const host = site.booking.hostTimeZone
const linkClass = 'text-[13px] text-zinc-50 underline decoration-white/30 underline-offset-4 hover:decoration-zinc-50'

// Paid calls from now on, soonest first
export default function UpcomingBookings({ bookings }: { bookings: AdminBooking[] }) {
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
          </div>
        </li>
      ))}
    </ul>
  )
}
