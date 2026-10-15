'use client'

import { useRef, useState } from 'react'
import { site, formatPrice } from '@/lib/site'
import { lowestPrice, priceForTopic } from '@/lib/booking/catalog'
import TopicPicker from './TopicPicker'
import TimePicker from './TimePicker'
import BookingForm from './BookingForm'
import BookingConfirmation, { type ConfirmationResult } from './BookingConfirmation'
import PaymentElements from './PaymentElements'
import { useOpenTimes } from './useOpenTimes'
import { describeSlot } from './format'

const { booking } = site

// Flow: topic (sets price) → day + time → quiz, details, payment → booked
export default function BookingSection() {
  const times = useOpenTimes()
  const { setDayKey, loadSlots } = times
  const [topicId, setTopicId] = useState<string | null>(null)
  const [slot, setSlot] = useState<Date | null>(null)
  const [formOpen, setFormOpen] = useState(false) // stays open once shown so typed details survive time changes
  const [notice, setNotice] = useState<string | null>(null)
  const [result, setResult] = useState<ConfirmationResult | null>(null)
  const timesRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLDivElement>(null)

  const price = topicId ? priceForTopic(topicId) : undefined
  const priceLabel = price ? formatPrice(price, booking.currency) : ''

  function selectTopic(id: string) {
    // Tapping the selected topic again deselects it and collapses the card back to the topic list
    if (id === topicId) {
      setTopicId(null)
      setDayKey(null)
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
          <BookingConfirmation result={result} receipt onReset={reset} />
        ) : (
          <>
            <TopicPicker selected={topicId} onSelect={selectTopic} />

            {topicId && (
              <div ref={timesRef} className="mt-5 scroll-mt-4 border-t border-white/[0.08] pt-5 animate-in fade-in duration-300 motion-reduce:animate-none">
                <TimePicker times={times} slot={slot} notice={notice} onSelectDay={selectDay} onSelectSlot={selectSlot} />
              </div>
            )}

            {topicId && formOpen && (
              <div ref={formRef} className="scroll-mt-4">
                {/* The payment form's amount follows the chosen topic */}
                <PaymentElements amount={price ?? lowestPrice}>
                  <BookingForm
                    topicId={topicId}
                    price={priceLabel}
                    slot={slot}
                    summary={slot && describeSlot(slot)}
                    onBooked={(r) => slot && setResult({ ...r, slot })}
                    onTaken={handleTaken}
                  />
                </PaymentElements>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}
