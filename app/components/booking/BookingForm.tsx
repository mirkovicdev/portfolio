'use client'

import { useRef, useState, type FormEvent } from 'react'
import { PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import { site } from '@/lib/site'
import { chipClass, focusRing, inputClass } from './styles'
import { visitorUses12h } from './format'

const { booking } = site

export interface BookedResult {
  email: string
  status: 'confirmed' | 'cancelled' | 'pending' // pending = paid, server confirmation still in progress
  meetUrl?: string | null
}

interface Props {
  topicId: string
  price: string
  slot: Date | null
  summary: string | null
  onBooked: (result: BookedResult) => void
  onTaken: () => void
}

// Steps 3 + 4 on one screen: quick quiz, details, card / Apple Pay / Google Pay, one button.
// Must be rendered inside <Elements>.
export default function BookingForm({ topicId, price, slot, summary, onBooked, onTaken }: Props) {
  const stripe = useStripe()
  const elements = useElements()
  const [background, setBackground] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  // The current time hold + payment. Reused when retrying with identical details (e.g. after a declined card).
  const hold = useRef<{ key: string; bookingId: string; clientSecret: string } | null>(null)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!slot) return
    if (!background) return setError('Pick where you are now.')
    if (!stripe || !elements) return
    setError(null)
    setPending(true)

    try {
      const { error: fieldError } = await elements.submit() // Stripe shows card errors next to the fields
      if (fieldError) return

      const details = {
        topicId,
        start: slot.toISOString(),
        name: name.trim(),
        email: email.trim(),
        background,
        message: message.trim(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        hour12: visitorUses12h(),
      }
      const key = JSON.stringify(details)

      let current = hold.current
      if (current?.key !== key) {
        // New or changed details: hold the time + create the payment (and free any earlier hold)
        const res = await fetch('/api/booking/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...details, releaseBookingId: current?.bookingId }),
        })
        if (res.status === 409) {
          hold.current = null
          return onTaken()
        }
        const data = await res.json().catch(() => ({}))
        if (!res.ok || !data.clientSecret) {
          return setError(`Could not start the payment and nothing was charged. Try again, or email ${site.contactEmail}.`)
        }
        current = { key, bookingId: data.bookingId, clientSecret: data.clientSecret }
        hold.current = current
      }

      const { error: payError, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret: current.clientSecret,
        redirect: 'if_required',
        confirmParams: {
          return_url: window.location.href,
          payment_method_data: { billing_details: { name: details.name, email: details.email } },
        },
      })
      if (payError) return setError(payError.message ?? 'The payment did not go through, so nothing was charged.')

      // Paid: the server confirms the booking and sends the calendar invite
      const res = await fetch('/api/booking/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentIntentId: paymentIntent.id }),
      })
      const data = await res.json().catch(() => ({}))
      onBooked({
        email: details.email,
        status: data.status === 'confirmed' || data.status === 'cancelled' ? data.status : 'pending',
        meetUrl: data.meetUrl,
      })
    } finally {
      setPending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-5 border-t border-white/[0.08] pt-5 animate-in fade-in slide-in-from-top-1 duration-300 motion-reduce:animate-none">
      <p className="text-[15px] font-medium text-zinc-50">{summary ?? 'Pick a time above'}</p>

      <div className="mt-4">
        <p className="text-[13px] text-zinc-400">Where are you now?</p>
        <div className="mt-2 flex flex-wrap gap-1" role="group" aria-label="Where are you now?">
          {booking.backgrounds.map((b) => (
            <button
              key={b.id}
              type="button"
              aria-pressed={background === b.id}
              onClick={() => {
                setBackground(b.id)
                setError(null)
              }}
              className={chipClass(background === b.id)}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <label className="block">
          <span className="text-[13px] text-zinc-400">Name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} required maxLength={100} autoComplete="name" className={`${inputClass} mt-1.5 h-12`} />
        </label>
        <label className="block">
          <span className="text-[13px] text-zinc-400">Email</span>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required maxLength={200} autoComplete="email" className={`${inputClass} mt-1.5 h-12`} />
        </label>
        <label className="block">
          <span className="text-[13px] text-zinc-400">What do you want to talk about? (optional)</span>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            maxLength={2000}
            placeholder="The more context, the better I can prepare."
            className={`${inputClass} mt-1.5 resize-none py-3`}
          />
        </label>
      </div>

      <div className="mt-4">
        <PaymentElement options={{ layout: 'tabs' }} />
      </div>

      <p className="mt-4 text-[12px] leading-relaxed text-zinc-400">{booking.cancellationPolicy}</p>

      {error && (
        <p role="alert" className="mt-3 text-[13px] text-red-400">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending || !slot || !stripe}
        className={`mt-4 h-12 w-full rounded-xl bg-zinc-50 text-[15px] font-medium text-zinc-950 transition-colors hover:bg-white disabled:opacity-60 ${focusRing}`}
      >
        {pending ? 'Processing…' : `Pay ${price} and book`}
      </button>
      <p className="mt-3 text-center text-[12px] leading-relaxed text-zinc-400">
        Secure payment by Stripe. Your confirmation and Google Meet link arrive by email.
      </p>
    </form>
  )
}
