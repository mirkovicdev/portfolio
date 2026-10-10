import { site } from '@/lib/site'

// Shown instead of the booking flow when a personal link can't book (checked on load, or when booking)
export default function InviteLinkNotice({ reason }: { reason: 'used' | 'invalid' }) {
  const [title, body] =
    reason === 'used'
      ? ['This link has already been used', `A call is booked with it, and the details are in your confirmation email. Need a different time? Email ${site.contactEmail}.`]
      : ["This link doesn't work", `It may be mistyped or no longer active. Email ${site.contactEmail} for a new one.`]

  return (
    <div className="py-2" role="status">
      <p className="text-[18px] font-semibold text-zinc-50">{title}</p>
      <p className="mt-1 text-[15px] leading-relaxed text-zinc-400">{body}</p>
    </div>
  )
}
