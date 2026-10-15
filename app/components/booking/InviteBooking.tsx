'use client'

import { useRef, useState } from 'react'
import { site, formatPrice } from '@/lib/site'
import TimePicker from './TimePicker'
import InviteForm from './InviteForm'
import BookingForm from './BookingForm'
import BookingConfirmation, { type ConfirmationResult } from './BookingConfirmation'
import InviteLinkNotice from './InviteLinkNotice'
import PaymentElements from './PaymentElements'
import { useOpenTimes } from './useOpenTimes'
import { describeSlot } from './format'

// Call through a personal link: day + time → details (+ payment when the link has a price) → booked.
// Same open times as public calls. `price` is whole dollars from the link; 0 = free.
export default function InviteBooking({ token, price }: { token: string; price: number }) {
  const times = useOpenTimes()
  const [slot, setSlot] = useState<Date | null>(null)
  const [formOpen, setFormOpen] = useState(false) // stays open once shown so typed details survive time changes
  const [notice, setNotice] = useState<string | null>(null)
  const [result, setResult] = useState<ConfirmationResult | null>(null)
  const [linkGone, setLinkGone] = useState<'used' | 'invalid' | null>(null)
  const timesRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLDivElement>(null)

  function selectDay(key: string) {
    times.setDayKey(key)
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
    times.loadSlots(true)
    timesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }

  // Paid only: the time was taken while paying and the payment was refunded; the link still works
  function reset() {
    setResult(null)
    setSlot(null)
    times.loadSlots(true)
  }

  if (result) return <BookingConfirmation result={result} receipt={price > 0} onReset={reset} />
  if (linkGone) return <InviteLinkNotice reason={linkGone} />

  const formProps = {
    slot,
    summary: slot && describeSlot(slot),
    onBooked: (r: Omit<ConfirmationResult, 'slot'>) => slot && setResult({ ...r, slot }),
    onTaken: handleTaken,
  }

  return (
    <>
      <div ref={timesRef} className="scroll-mt-4">
        <TimePicker times={times} slot={slot} notice={notice} onSelectDay={selectDay} onSelectSlot={selectSlot} />
      </div>

      {formOpen && (
        <div ref={formRef} className="scroll-mt-4">
          {price > 0 ? (
            <PaymentElements amount={price}>
              <BookingForm link={{ token, onGone: setLinkGone }} price={formatPrice(price, site.booking.currency)} {...formProps} />
            </PaymentElements>
          ) : (
            <InviteForm token={token} onLinkGone={setLinkGone} {...formProps} />
          )}
        </div>
      )}
    </>
  )
}
