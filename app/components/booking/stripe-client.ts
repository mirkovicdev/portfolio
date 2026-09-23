// Browser-side Stripe setup: lazy Stripe.js loading + a payment form styled like the page
import { loadStripe, type Appearance, type CssFontSource, type Stripe } from '@stripe/stripe-js'

let stripePromise: Promise<Stripe | null> | null = null

// Stripe.js loads only when the payment step first appears; null when no publishable key is set
export function getStripe() {
  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  if (!key) return null
  stripePromise ??= loadStripe(key)
  return stripePromise
}

export const stripeFonts: CssFontSource[] = [{ cssSrc: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500&display=swap' }]

// Matches the zinc palette: near-black inputs, hairline borders, white as the "selected" colour
export const stripeAppearance: Appearance = {
  theme: 'night',
  variables: {
    colorPrimary: '#fafafa',
    colorBackground: '#09090b',
    colorText: '#fafafa',
    colorTextSecondary: '#a1a1aa',
    colorTextPlaceholder: '#52525b',
    colorDanger: '#f87171',
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSizeBase: '15px',
    borderRadius: '12px',
  },
  rules: {
    '.Input': { border: '1px solid rgba(255, 255, 255, 0.08)', boxShadow: 'none' },
    '.Input:focus': { border: '1px solid rgba(255, 255, 255, 0.25)', boxShadow: 'none' },
    '.Label': { color: '#a1a1aa', fontSize: '13px', fontWeight: '400' },
    '.Tab': { border: '1px solid rgba(255, 255, 255, 0.08)', backgroundColor: '#09090b', boxShadow: 'none' },
    '.Tab:hover': { border: '1px solid rgba(255, 255, 255, 0.25)' },
    '.Tab--selected': { border: '1px solid #fafafa', boxShadow: 'none' },
  },
}
