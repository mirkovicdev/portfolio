import type { Metadata } from 'next'
import { site, formatPrice } from '@/lib/site'
import { getAdminSession } from '@/lib/admin/session'
import { signInConfigured } from '@/lib/admin/google-signin'
import { getOpenedDays, getOpenInvites, getUpcomingBookings } from '@/lib/booking/db'
import { inviteUrl } from '@/lib/booking/catalog'
import { backgroundLabel, hostLabel, isFree } from '@/lib/booking/labels'
import { stripeDashboardUrl } from '@/lib/booking/stripe'
import { zonedDayKey } from '@/lib/booking/slots'
import AdminLogin from './components/AdminLogin'
import AdminApp from './components/AdminApp'
import type { AdminBooking } from './components/UpcomingBookings'
import type { AdminInvite } from './components/InviteLinks'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Admin', robots: { index: false, follow: false } }

// The session is checked on the server before any data is loaded; signed out you only get the sign-in screen
export default async function AdminPage({ searchParams }: { searchParams: Promise<{ denied?: string }> }) {
  const session = await getAdminSession()
  if (!session) return <AdminLogin denied={(await searchParams).denied === '1'} configured={signInConfigured()} />

  const tz = site.booking.hostTimeZone
  const today = zonedDayKey(new Date(), tz)
  const [opened, bookings, openInvites] = await Promise.all([
    getOpenedDays(today, zonedDayKey(new Date(Date.now() + 130 * 864e5), tz)),
    getUpcomingBookings(new Date()),
    getOpenInvites(),
  ])

  // Only what the page needs goes to the browser
  const upcoming: AdminBooking[] = bookings.map((b) => ({
    id: b.id,
    start: b.start_at,
    end: b.end_at,
    name: b.name,
    email: b.email,
    topic: hostLabel(b),
    background: backgroundLabel(b),
    message: b.message,
    meetUrl: b.meet_url,
    paid: isFree(b) ? 'Free' : formatPrice(b.amount_cents / 100, b.currency),
    free: isFree(b),
    clientTimeZone: b.visitor_time_zone,
    refundUrl: b.stripe_payment_intent_id ? stripeDashboardUrl(`payments/${b.stripe_payment_intent_id}`) : null,
  }))

  // Unused free call links; the token only reaches this page as part of the full link
  const invites: AdminInvite[] = openInvites.map((i) => ({ id: i.id, label: i.label, createdAt: i.created_at, url: inviteUrl(i.token) }))

  return <AdminApp email={session.email} today={today} initialOpened={opened} bookings={upcoming} invites={invites} />
}
