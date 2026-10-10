'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { localDayKey } from '@/lib/booking/slots'
import type { BookingDay } from './DateStrip'

export type OpenTimes = ReturnType<typeof useOpenTimes>

// Open start times from the server, grouped into the visitor's own days, plus the picked day.
// Shared by the paid booking section and the free /meet page.
export function useOpenTimes() {
  const [slots, setSlots] = useState<Date[] | null>(null)
  const [loadError, setLoadError] = useState(false)
  const [timeZone, setTimeZone] = useState('')
  const [dayKey, setDayKey] = useState<string | null>(null)

  // `fresh` skips the 30s CDN cache, used after someone else took a time
  const loadSlots = useCallback(async (fresh = false) => {
    setLoadError(false)
    try {
      const res = await fetch(`/api/booking/slots${fresh ? `?t=${Date.now()}` : ''}`, { cache: 'no-store' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const list = ((await res.json()) as { slots: string[] }).slots.map((s) => new Date(s))
      setSlots(list)
      // Keep the visitor's chosen day if it still has times; never pre-select one
      setDayKey((key) => (key && list.some((s) => localDayKey(s) === key) ? key : null))
    } catch {
      setLoadError(true)
      setSlots([])
    }
  }, [])

  useEffect(() => {
    setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone)
    loadSlots()
  }, [loadSlots])

  // Visitor-local days from today until the last open time
  const days = useMemo<BookingDay[]>(() => {
    if (!slots?.length) return []
    const byDay = new Map<string, Date[]>()
    for (const s of slots) byDay.set(localDayKey(s), [...(byDay.get(localDayKey(s)) ?? []), s])

    const result: BookingDay[] = []
    const cursor = new Date()
    cursor.setHours(0, 0, 0, 0)
    const last = slots[slots.length - 1]
    while (cursor <= last) {
      const key = localDayKey(cursor)
      result.push({ key, date: new Date(cursor), slots: byDay.get(key) ?? [] })
      cursor.setDate(cursor.getDate() + 1)
    }
    return result
  }, [slots])

  return { slots, loadError, timeZone, days, dayKey, setDayKey, loadSlots }
}
