'use client'

import { useMemo, useState } from 'react'
import { site } from '@/lib/site'
import { zonedDayKey, type Window } from '@/lib/booking/slots'
import AvailabilityCalendar from './AvailabilityCalendar'
import DayEditor from './DayEditor'
import UpcomingBookings, { type AdminBooking } from './UpcomingBookings'

interface Props {
  email: string
  today: string
  initialOpened: Record<string, Window[]>
  bookings: AdminBooking[]
}

const { durationMin, bufferMin, daysAhead, minNoticeHours, hostTimeZone } = site.booking

// Signed-in view: pick days on the calendar, set their hours, save. Upcoming bookings below.
export default function AdminApp({ email, today, initialOpened, bookings }: Props) {
  const [opened, setOpened] = useState(initialOpened)
  const [selected, setSelected] = useState<string[]>([])
  const [draft, setDraft] = useState<Window[]>([])
  const [savedNote, setSavedNote] = useState<string | null>(null)

  // Bookings grouped by their Oslo day
  const bookingsByDay = useMemo(() => {
    const map: Record<string, AdminBooking[]> = {}
    for (const b of bookings) (map[zonedDayKey(new Date(b.start), hostTimeZone)] ??= []).push(b)
    return map
  }, [bookings])
  const bookingCount = useMemo(() => Object.fromEntries(Object.entries(bookingsByDay).map(([d, list]) => [d, list.length])), [bookingsByDay])

  function toggleDay(day: string) {
    setSavedNote(null)
    if (selected.includes(day)) return setSelected(selected.filter((d) => d !== day))
    // First pick loads that day's hours; more picks keep the hours being edited, to apply them to all
    if (selected.length === 0) setDraft(opened[day] ?? [])
    setSelected([...selected, day].sort())
  }

  function handleSaved(days: string[], windows: Window[]) {
    setOpened((prev) => {
      const next = { ...prev }
      for (const d of days) {
        if (windows.length) next[d] = windows
        else delete next[d]
      }
      return next
    })
    setSelected([])
    setSavedNote(`${windows.length ? 'Opened' : 'Closed'} ${days.length} day${days.length > 1 ? 's' : ''}.`)
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-5 py-10">
      <div className="mx-auto max-w-[560px]">
        <header className="flex items-center justify-between gap-4">
          <h1 className="font-mono text-[24px] font-semibold tracking-[-0.03em] text-zinc-50">Admin</h1>
          <form action="/api/admin/logout" method="post">
            <button type="submit" className="text-[13px] text-zinc-400 transition-colors hover:text-zinc-50">
              Sign out
            </button>
          </form>
        </header>
        <p className="mt-1 text-[13px] text-zinc-500">Signed in as {email}</p>

        <section className="mt-10" aria-labelledby="hours-heading">
          <h2 id="hours-heading" className="font-mono text-[18px] font-semibold tracking-[-0.02em] text-zinc-50">
            Open times
          </h2>
          <p className="mt-2 text-[13px] leading-relaxed text-zinc-400">
            Tap one or more days, set the hours, save. Times are Oslo time. Calls are {durationMin} min with {bufferMin} min between, the
            booking page shows the next {daysAhead / 7} weeks, and times need {minNoticeHours} hours&apos; notice. Busy events in your
            Google Calendar are still skipped.
          </p>

          <AvailabilityCalendar today={today} opened={opened} bookingCount={bookingCount} selected={selected} onToggle={toggleDay} />

          {savedNote && selected.length === 0 && (
            <p role="status" className="mt-3 text-[13px] text-phthalo-300">
              {savedNote}
            </p>
          )}

          {selected.length > 0 && (
            <DayEditor
              days={selected}
              draft={draft}
              onDraftChange={setDraft}
              anyOpen={selected.some((d) => opened[d])}
              bookings={selected.flatMap((d) => bookingsByDay[d] ?? [])}
              onSaved={handleSaved}
              onCancel={() => setSelected([])}
            />
          )}
        </section>

        <section className="mt-12" aria-labelledby="bookings-heading">
          <h2 id="bookings-heading" className="font-mono text-[18px] font-semibold tracking-[-0.02em] text-zinc-50">
            Upcoming bookings
          </h2>
          <UpcomingBookings bookings={bookings} />
        </section>
      </div>
    </main>
  )
}
