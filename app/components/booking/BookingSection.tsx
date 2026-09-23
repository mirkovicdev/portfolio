'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Elements } from '@stripe/react-stripe-js'
import type { StripeElementsOptions } from '@stripe/stripe-js'
import { Check, RotateCcw } from 'lucide-react'
import { site, formatPrice } from '@/lib/site'
import { lowestPrice, priceForTopic } from '@/lib/booking/catalog'
import { localDayKey } from '@/lib/booking/slots'
import DateStrip, { type BookingDay } from './DateStrip'
import SlotGrid from './SlotGrid'
import TopicPicker from './TopicPicker'
import BookingForm, { type BookedResult } from './BookingForm'
import { formatDayShort, formatTime, formatTimeZone } from './format'
import { getStripe, stripeAppearance, stripeFonts } from './stripe-client'

const { booking } = site

// "Wed 23 Sept, 17:00 – 17:45"
function describeSlot(slot: Date) {
  const end = new Date(slot.getTime() + booking.durationMin * 60000)
  return `${formatDayShort(slot)}, ${formatTime(slot)} – ${formatTime(end)}`
}

// Flow: topic (sets price) → day + time → quiz, details, payment → booked
export default function BookingSection() {
  const [topicId, setTopicId] = useState<string | null>(null)
  const [slots, setSlots] = useState<Date[] | null>(null)
  const [loadError, setLoadError] = useState(false)
  const [timeZone, setTimeZone] = useState('')
  const [dayKey, setDayKey] = useState<string | null>(null)
  const [slot, setSlot] = useState<Date | null>(null)
  const [formOpen, setFormOpen] = useState(false) // stays open once shown so typed details survive time changes
  const [notice, setNotice] = useState<string | null>(null)
  const [result, setResult] = useState<(BookedResult & { slot: Date }) | null>(null)
  const timesRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLDivElement>(null)

  // `fresh` skips the 30s CDN cache, used after someone else took a time
  const loadSlots = useCallback(async (fresh = false) => {
    setLoadError(false)
    try {
      const res = await fetch(`/api/booking/slots${fresh ? `?t=${Date.now()}` : ''}`, { cache: 'no-store' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const list = ((await res.json()) as { slots: string[] }).slots.map((s) => new Date(s))
      setSlots(list)
      setDayKey((key) => (key && list.some((s) => localDayKey(s) === key) ? key : list[0] ? localDayKey(list[0]) : null))
    } catch {
      setLoadError(true)
      setSlots([])
    }
  }, [])

  useEffect(() => {
    setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone)
    loadSlots()
  }, [loadSlots])

  // Visitor-local days from today until the last open time
  const days = useMemo<BookingDay[]>(() => {
    if (!slots?.length) return []
    const byDay = new Map<string, Date[]>()
    for (const s of slots) byDay.set(localDayKey(s), [...(byDay.get(localDayKey(s)) ?? []), s])

    const result: BookingDay[] = []
    const cursor = new Date()
    cursor.setHours(0, 0, 0, 0)
    const last = slots[slots.length - 1]
    while (cursor <= last) {
      const key = localDayKey(cursor)
      result.push({ key, date: new Date(cursor), slots: byDay.get(key) ?? [] })
      cursor.setDate(cursor.getDate() + 1)
    }
    return result
  }, [slots])

  const daySlots = days.find((d) => d.key === dayKey)?.slots ?? []
  const price = topicId ? priceForTopic(topicId) : undefined
  const priceLabel = price ? formatPrice(price, booking.currency) : ''

  // The payment form's amount follows the chosen topic
  const stripePromise = formOpen ? getStripe() : null
  const elementsOptions = useMemo<StripeElementsOptions>(
    () => ({
      mode: 'payment',
      amount: (price ?? lowestPrice) * 100,
      currency: booking.currency.toLowerCase(),
      paymentMethodTypes: ['card'],
      appearance: stripeAppearance,
      fonts: stripeFonts,
    }),
    [price]
  )

  function selectTopic(id: string) {
    // Tapping the selected topic again deselects it and collapses the card back to the topic list
    if (id === topicId) {
      setTopicId(null)
      setSlot(null)
      setFormOpen(false)
      setNotice(null)
      return
    }
    const first = topicId === null
    setTopicId(id)
    if (first) requestAnimationFrame(() => timesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }))
  }

  function selectDay(key: string) {
    setDayKey(key)
    setSlot(null)
  }

  function selectSlot(s: Date) {
    setSlot(s)
    setNotice(null)
    setFormOpen(true)
    requestAnimationFrame(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }))
  }

  // Someone else booked the time while this visitor was filling in the form
  function handleTaken() {
    setSlot(null)
    setNotice('Someone just booked that time. Pick another one.')
    loadSlots(true)
    timesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }

  function reset() {
    setResult(null)
    setSlot(null)
    loadSlots(true)
  }

  return (
    <section aria-labelledby="book-heading">
      <div className="flex items-baseline justify-between gap-4">
        <h2 id="book-heading" className="font-mono text-[24px] font-semibold leading-none tracking-[-0.03em] text-zinc-50">
          Book a call
        </h2>
        <span className="text-[15px] font-medium text-zinc-50">from {formatPrice(lowestPrice, booking.currency)}</span>
      </div>
      <p className="mt-3 max-w-[38ch] text-[14px] leading-relaxed text-zinc-400">
        A {booking.durationMin}-minute 1:1 video call. Pick what you need, then a time that suits you.
      </p>

      <div className="mt-5 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
        {result ? (
          <Confirmation result={result} onReset={reset} />
        ) : (
          <>
            <TopicPicker selected={topicId} onSelect={selectTopic} />

            {topicId && (
              <div ref={timesRef} className="mt-5 scroll-mt-4 border-t border-white/[0.08] pt-5 animate-in fade-in duration-300 motion-reduce:animate-none">
                {notice && (
                  <p role="alert" className="mb-4 rounded-xl border border-amber-400/20 bg-amber-400/10 px-3 py-2 text-[13px] text-amber-200">
                    {notice}
                  </p>
                )}
                {slots === null ? (
                  // Same footprint as the date strip, avoids layout shift
                  <div className="flex gap-2" aria-hidden>
                    {Array.from({ length: 6 }, (_, i) => (
                      <div key={i} className="h-[68px] w-[52px] animate-pulse rounded-xl bg-white/[0.04] motion-reduce:animate-none" />
                    ))}
                  </div>
                ) : loadError ? (
                  <p className="text-[14px] text-zinc-400">
                    Could not load open times. Refresh the page, or email {site.contactEmail} to book.
                  </p>
                ) : days.length === 0 ? (
                  <p className="text-[14px] text-zinc-400">
                    No open times in the next {booking.daysAhead / 7} weeks. Email {site.contactEmail} and we will find a time.
                  </p>
                ) : (
                  <>
                    <DateStrip days={days} selected={dayKey} onSelect={selectDay} />
                    <SlotGrid slots={daySlots} selected={slot} onSelect={selectSlot} />
                    <p className="mt-3 text-[12px] text-zinc-400">Times shown in your time zone: {formatTimeZone(timeZone)}</p>
                  </>
                )}
              </div>
            )}

            {topicId && formOpen && (
              <div ref={formRef} className="scroll-mt-4">
                {stripePromise ? (
                  <Elements stripe={stripePromise} options={elementsOptions}>
                    <BookingForm
                      topicId={topicId}
                      price={priceLabel}
                      slot={slot}
                      summary={slot && describeSlot(slot)}
                      onBooked={(r) => slot && setResult({ ...r, slot })}
                      onTaken={handleTaken}
                    />
                  </Elements>
                ) : (
                  <p className="mt-5 border-t border-white/[0.08] pt-5 text-[14px] text-zinc-400">
                    Online payment isn&apos;t set up yet. Email {site.contactEmail} to book this time.
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}

function Confirmation({ result, onReset }: { result: BookedResult & { slot: Date }; onReset: () => void }) {
  if (result.status === 'cancelled') {
    return (
      <div className="py-2" role="status">
        <p className="text-[18px] font-semibold text-zinc-50">That time was taken while you were paying</p>
        <p className="mt-1 text-[15px] leading-relaxed text-zinc-400">
          Your payment has been refunded in full. Pick another time, or email {site.contactEmail}.
        </p>
        <button type="button" onClick={onReset} className="mt-4 inline-flex items-center gap-2 text-[14px] text-zinc-50 underline decoration-white/30 underline-offset-4">
          <RotateCcw className="size-4" aria-hidden /> Pick another time
        </button>
      </div>
    )
  }

  return (
    <div className="py-2" role="status">
      <span className="grid size-10 place-items-center rounded-full bg-phthalo-950 text-phthalo-300">
        <Check className="size-5" aria-hidden />
      </span>
      <p className="mt-4 text-[18px] font-semibold text-zinc-50">You&apos;re booked</p>
      <p className="mt-1 text-[15px] leading-relaxed text-zinc-400">
        {describeSlot(result.slot)}. A confirmation with your Google Meet link and a calendar invite is on its way to {result.email}.
        Your receipt comes separately from Stripe.
      </p>
      {result.meetUrl && (
        <a href={result.meetUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block text-[14px] text-zinc-50 underline decoration-white/30 underline-offset-4">
          Open the Meet link
        </a>
      )}
    </div>
  )
}
