import type { Metadata } from 'next'
import Link from 'next/link'
import { site } from '@/lib/site'
import { expireStaleHolds, getInviteByToken } from '@/lib/booking/db'
import ProfileHeader from '@/app/components/ProfileHeader'
import InviteBooking from '@/app/components/booking/InviteBooking'
import InviteLinkNotice from '@/app/components/booking/InviteLinkNotice'

const { booking } = site

export const dynamic = 'force-dynamic'

// Private page: kept out of search engines, and the link never leaks to other sites through the Referer header.
// The preview card (Instagram, WhatsApp, iMessage) shows the call, not the site tagline.
export const metadata: Metadata = {
  title: booking.invite.title,
  description: `Pick a time for a ${booking.durationMin}-minute video call.`,
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
  openGraph: {
    type: 'website',
    siteName: site.name,
    title: booking.invite.title,
    description: `Pick a time for a ${booking.durationMin}-minute video call.`,
  },
}

type LinkState = 'open' | 'used' | 'invalid' | 'error'

// Checked on the server, so a wrong or used link never shows the booking flow
async function linkState(token: string): Promise<LinkState> {
  if (!/^[\w-]{22,64}$/.test(token)) return 'invalid'
  try {
    await expireStaleHolds()
    const link = await getInviteByToken(token)
    return !link ? 'invalid' : link.used ? 'used' : 'open'
  } catch (err) {
    console.error('❌ [meet] Could not check the link', err)
    return 'error'
  }
}

export default async function MeetPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const state = await linkState(token)

  return (
    // Same phone-width column as the home page
    <main className="min-h-screen bg-zinc-950 sm:bg-black sm:py-10">
      <div className="mx-auto w-full max-w-[440px] overflow-hidden bg-zinc-950 pb-10 sm:rounded-[32px] sm:border sm:border-white/[0.08]">
        <ProfileHeader />

        <section aria-labelledby="meet-heading" className="mt-10 px-5">
          <div className="flex items-baseline justify-between gap-4">
            <h2 id="meet-heading" className="font-mono text-[24px] font-semibold leading-none tracking-[-0.03em] text-zinc-50">
              {booking.invite.title}
            </h2>
            <span className="text-[15px] font-medium text-zinc-50">Free</span>
          </div>
          {state === 'open' && (
            <p className="mt-3 max-w-[38ch] text-[14px] leading-relaxed text-zinc-400">
              A {booking.durationMin}-minute 1:1 video call. Pick a time that suits you.
            </p>
          )}

          <div className="mt-5 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
            {state === 'open' ? (
              <InviteBooking token={token} />
            ) : state === 'error' ? (
              <p className="py-2 text-[14px] leading-relaxed text-zinc-400">
                Something went wrong loading this page. Refresh it, or email {site.contactEmail}.
              </p>
            ) : (
              <InviteLinkNotice reason={state} />
            )}
          </div>
        </section>

        <footer className="mt-12 px-5 text-center text-[13px] text-zinc-500">
          Questions?{' '}
          <a href={`mailto:${site.contactEmail}`} className="text-zinc-50 underline decoration-white/30 underline-offset-4 hover:decoration-zinc-50">
            {site.contactEmail}
          </a>
          <Link href="/privacy" className="mt-3 block transition-colors hover:text-zinc-300">
            Privacy policy
          </Link>
        </footer>
      </div>
    </main>
  )
}
