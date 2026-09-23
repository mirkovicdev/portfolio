import type { Metadata } from 'next'
import { site, formatPrice } from '@/lib/site'
import { getAdminSession } from '@/lib/admin/session'
import { signInConfigured } from '@/lib/admin/google-signin'
import { getOpenedDays, getUpcomingBookings } from '@/lib/booking/db'
import { getTopic } from '@/lib/booking/catalog'
import { stripeDashboardUrl } from '@/lib/booking/stripe'
import { zonedDayKey } from '@/lib/booking/slots'
import AdminLogin from './components/AdminLogin'
import AdminApp from './components/AdminApp'
import type { AdminBooking } from './components/UpcomingBookings'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Admin', robots: { index: false, follow: false } }

// The session is checked on the server before any data is loaded; signed out you only get the sign-in screen
export default async function AdminPage({ searchParams }: { searchParams: Promise<{ denied?: string }> }) {
  const session = await getAdminSession()
  if (!session) return <AdminLogin denied={(await searchParams).denied === '1'} configured={signInConfigured()} />

  const tz = site.booking.hostTimeZone
  const today = zonedDayKey(new Date(), tz)
  const [opened, bookings] = await Promise.all([
    getOpenedDays(today, zonedDayKey(new Date(Date.now() + 130 * 864e5), tz)),
    getUpcomingBookings(new Date()),
  ])

  // Only what the page needs goes to the browser
  const upcoming: AdminBooking[] = bookings.map((b) => ({
    id: b.id,
    start: b.start_at,
    end: b.end_at,
    name: b.name,
    email: b.email,
    topic: getTopic(b.topic)?.label ?? b.topic,
    background: site.booking.backgrounds.find((x) => x.id === b.background)?.label ?? b.background,
    message: b.message,
    meetUrl: b.meet_url,
    paid: formatPrice(b.amount_cents / 100, b.currency),
    clientTimeZone: b.visitor_time_zone,
    refundUrl: b.stripe_payment_intent_id ? stripeDashboardUrl(`payments/${b.stripe_payment_intent_id}`) : null,
  }))

  return <AdminApp email={session.email} today={today} initialOpened={opened} bookings={upcoming} />
}
