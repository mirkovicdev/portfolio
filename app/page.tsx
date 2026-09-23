import Link from 'next/link'
import ProfileHeader from './components/ProfileHeader'
import { QuantFrameCard, DiscordCard } from './components/LinkCards'
import BookingSection from './components/booking/BookingSection'
import { site } from '@/lib/site'

export default function Home() {
  return (
    // Phone-width column: full-bleed on mobile, a framed "screen" on larger displays
    <main className="min-h-screen bg-zinc-950 sm:bg-black sm:py-10">
      <div className="mx-auto w-full max-w-[440px] overflow-hidden bg-zinc-950 pb-10 sm:rounded-[32px] sm:border sm:border-white/[0.08]">
        <ProfileHeader />

        <div className="mt-8 space-y-3 px-5">
          <QuantFrameCard />
          <DiscordCard />
        </div>

        <div className="mt-12 px-5">
          <BookingSection />
        </div>

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
