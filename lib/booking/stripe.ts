// Server-side Stripe client (secret key)
import 'server-only'
import Stripe from 'stripe'

// Tags our PaymentIntents so the webhook ignores other payments on the same Stripe account (e.g. QuantFrame)
export const BOOKING_SOURCE = 'mirkovic.dev-call'

// Link into the Stripe dashboard, test or live depending on the key in use
export const stripeDashboardUrl = (path: string) =>
  `https://dashboard.stripe.com/${process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_') ? 'test/' : ''}${path}`

let client: Stripe | null = null
export function stripe() {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY is not set')
  client ??= new Stripe(process.env.STRIPE_SECRET_KEY)
  return client
}
