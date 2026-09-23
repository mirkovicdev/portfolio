import { friendlyZoneName } from '@/lib/booking/zones'

// Labels stay in English (the page is English) but follow the visitor's 12h/24h clock preference
const LOCALE = 'en-GB'

// Also sent with the booking, so the confirmation email uses the same clock style
export const visitorUses12h = () => new Intl.DateTimeFormat(undefined, { hour: 'numeric' }).resolvedOptions().hour12 ?? false

// "17:00" for 24-hour visitors, "5:00 PM" (US style) for 12-hour visitors
export const formatTime = (d: Date) =>
  visitorUses12h()
    ? d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    : d.toLocaleTimeString(LOCALE, { hour: '2-digit', minute: '2-digit' })

// "Eastern Time (New York)" from "America/New_York"
export const formatTimeZone = friendlyZoneName

// "Wed", "Wednesday 23 September", "September 2026", "Wed 23 Sep"
export const formatWeekdayShort = (d: Date) => d.toLocaleDateString(LOCALE, { weekday: 'short' })
export const formatDayLong = (d: Date) => d.toLocaleDateString(LOCALE, { weekday: 'long', day: 'numeric', month: 'long' })
export const formatMonth = (d: Date) => d.toLocaleDateString(LOCALE, { month: 'long', year: 'numeric' })
export const formatDayShort = (d: Date) => d.toLocaleDateString(LOCALE, { weekday: 'short', day: 'numeric', month: 'short' })
