'use client'

import { Check, RotateCcw } from 'lucide-react'
import { site } from '@/lib/site'
import { describeSlot } from './format'

export interface ConfirmationResult {
  email: string
  slot: Date
  meetUrl?: string | null
  status?: 'confirmed' | 'cancelled' | 'pending' // paid bookings; pending = paid, server confirmation still in progress
}

// After booking: "You're booked", or (paid) the rare "time was taken while paying, refunded".
// `receipt` adds the Stripe receipt line for paid calls. Shared by the public booking and personal links.
export default function BookingConfirmation({ result, receipt, onReset }: { result: ConfirmationResult; receipt: boolean; onReset: () => void }) {
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
        {receipt && ' Your receipt comes separately from Stripe.'}
      </p>
      {result.meetUrl && (
        <a href={result.meetUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block text-[14px] text-zinc-50 underline decoration-white/30 underline-offset-4">
          Open the Meet link
        </a>
      )}
      <p className="mt-4 text-[13px] leading-relaxed text-zinc-500">
        Can&apos;t find the email? Check your spam or promotions folder, and mark it as not spam so the reminder before the call
        reaches your inbox.
      </p>
    </div>
  )
}
