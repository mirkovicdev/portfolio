import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { site } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Privacy policy | Antonije Mirkovic',
  description: 'How mirkovic.dev handles your data when you book a call.',
}

const UPDATED = '23 September 2026'

// Plain-language privacy policy; kept in sync with what the booking system actually stores and who processes it
export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-zinc-950 px-5 py-14">
      <article className="mx-auto max-w-[600px] text-[15px] leading-relaxed text-zinc-400">
        <Link href="/" className="inline-flex items-center gap-2 text-[14px] text-zinc-400 transition-colors hover:text-zinc-50">
          <ArrowLeft className="size-4" aria-hidden /> Back to mirkovic.dev
        </Link>

        <h1 className="mt-10 font-mono text-[28px] font-semibold leading-tight tracking-[-0.03em] text-zinc-50">Privacy policy</h1>
        <p className="mt-2 text-[13px] text-zinc-500">Last updated {UPDATED}</p>

        <Section title="Who is responsible">
          <p>
            {site.name}, Norway, is responsible for the personal data described here. Questions or requests:{' '}
            <a href={`mailto:${site.contactEmail}`} className="text-zinc-50 underline decoration-white/30 underline-offset-4">
              {site.contactEmail}
            </a>
            .
          </p>
        </Section>

        <Section title="What I collect when you book a call">
          <ul className="list-disc space-y-1 pl-5">
            <li>Your name and email address</li>
            <li>The type of call, your answer to &ldquo;Where are you now?&rdquo; and your optional message</li>
            <li>The time you book and your time zone (detected by your browser)</li>
            <li>Payment confirmation and amount</li>
          </ul>
          <p className="mt-3">
            Card details go straight to Stripe, the payment provider. They never reach this website and are never stored by me.
          </p>
        </Section>

        <Section title="Why">
          <p>
            To schedule and hold your call, send you the calendar invite and receipt, prepare for the call, handle cancellations
            and refunds, and keep the records bookkeeping rules require. The legal basis is the agreement you enter when you
            book, and my legal obligations for accounting.
          </p>
        </Section>

        <Section title="Who processes it">
          <ul className="list-disc space-y-1 pl-5">
            <li>Stripe: payments and receipts</li>
            <li>Supabase: the database that stores your booking</li>
            <li>Google: the calendar invite, the Google Meet call and the booking notification email I receive</li>
            <li>Vercel: hosting, and anonymous page-view statistics without cookies</li>
          </ul>
          <p className="mt-3">
            Some of these providers process data outside the EEA, including in the United States, under their own data
            protection terms such as the EU Standard Contractual Clauses.
          </p>
        </Section>

        <Section title="Google Calendar">
          <p>
            This website connects only to my own Google Calendar, to see when I am busy and to create the event for your call.
            It never accesses your Google account.
          </p>
        </Section>

        <Section title="Cookies">
          <p>
            This website does not use tracking cookies. When the payment form loads, Stripe may set cookies it needs to prevent
            fraud.
          </p>
        </Section>

        <Section title="How long I keep it">
          <p>
            As long as needed to deliver the call and to meet bookkeeping requirements. After that it is deleted.
          </p>
        </Section>

        <Section title="Your rights">
          <p>
            You can ask to see, correct or delete your data, restrict or object to how it is used, or get a copy of it. Email{' '}
            {site.contactEmail} and I will reply within 30 days. You can also complain to Datatilsynet, the Norwegian Data
            Protection Authority.
          </p>
        </Section>

        <Section title="Other websites">
          <p>Links to QuantFrame, Discord and social media go to services with their own privacy policies.</p>
        </Section>
      </article>
    </main>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-9">
      <h2 className="font-mono text-[16px] font-semibold tracking-[-0.02em] text-zinc-50">{title}</h2>
      <div className="mt-2">{children}</div>
    </section>
  )
}
