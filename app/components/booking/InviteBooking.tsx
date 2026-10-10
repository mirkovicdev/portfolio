'use client'

import { useRef, useState } from 'react'
import { Check } from 'lucide-react'
import TimePicker from './TimePicker'
import InviteForm, { type InviteBooked } from './InviteForm'
import InviteLinkNotice from './InviteLinkNotice'
import { useOpenTimes } from './useOpenTimes'
import { describeSlot } from './format'

// Free call through a personal link: day + time → name, email, message → booked. Same open times as paid calls.
export default function InviteBooking({ token }: { token: string }) {
  const times = useOpenTimes()
  const [slot, setSlot] = useState<Date | null>(null)
  const [formOpen, setFormOpen] = useState(false) // stays open once shown so typed details survive time changes
  const [notice, setNotice] = useState<string | null>(null)
  const [result, setResult] = useState<(InviteBooked & { slot: Date }) | null>(null)
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

  if (result) return <Booked result={result} />
  if (linkGone) return <InviteLinkNotice reason={linkGone} />

  return (
    <>
      <div ref={timesRef} className="scroll-mt-4">
        <TimePicker times={times} slot={slot} notice={notice} onSelectDay={selectDay} onSelectSlot={selectSlot} />
      </div>

      {formOpen && (
        <div ref={formRef} className="scroll-mt-4">
          <InviteForm
            token={token}
            slot={slot}
            summary={slot && describeSlot(slot)}
            onBooked={(r) => slot && setResult({ ...r, slot })}
            onTaken={handleTaken}
            onLinkGone={setLinkGone}
          />
        </div>
      )}
    </>
  )
}

function Booked({ result }: { result: InviteBooked & { slot: Date } }) {
  return (
    <div className="py-2" role="status">
      <span className="grid size-10 place-items-center rounded-full bg-phthalo-950 text-phthalo-300">
        <Check className="size-5" aria-hidden />
      </span>
      <p className="mt-4 text-[18px] font-semibold text-zinc-50">You&apos;re booked</p>
      <p className="mt-1 text-[15px] leading-relaxed text-zinc-400">
        {describeSlot(result.slot)}. A confirmation with your Google Meet link and a calendar invite is on its way to {result.email}.
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
