'use client'

import { useMemo, type ReactNode } from 'react'
import { Elements } from '@stripe/react-stripe-js'
import type { StripeElementsOptions } from '@stripe/stripe-js'
import { site } from '@/lib/site'
import { getStripe, stripeAppearance, stripeFonts } from './stripe-client'

const { booking } = site

// Stripe around the payment form (card, Apple Pay, Google Pay). Render it only once the form opens:
// that's when Stripe.js loads. Shared by the public booking and paid personal links.
export default function PaymentElements({ amount, children }: { amount: number; children: ReactNode }) {
  const stripePromise = getStripe()
  // The form's amount follows the price shown (whole dollars → cents); the server charges its own price anyway
  const options = useMemo<StripeElementsOptions>(
    () => ({
      mode: 'payment',
      amount: amount * 100,
      currency: booking.currency.toLowerCase(),
      paymentMethodTypes: ['card'],
      appearance: stripeAppearance,
      fonts: stripeFonts,
    }),
    [amount]
  )

  if (!stripePromise) {
    return (
      <p className="mt-5 border-t border-white/[0.08] pt-5 text-[14px] text-zinc-400">
        Online payment isn&apos;t set up yet. Email {site.contactEmail} to book this time.
      </p>
    )
  }
  return (
    <Elements stripe={stripePromise} options={options}>
      {children}
    </Elements>
  )
}
