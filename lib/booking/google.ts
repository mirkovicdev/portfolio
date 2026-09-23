// Google Calendar over plain REST: read busy times, create the event with a Meet link.
// Auth: OAuth refresh token for your own Google account (see scripts/google-auth.mjs).
import 'server-only'
import type { Interval } from './slots'

const TOKEN_URL = 'https://oauth2.googleapis.com/token'
const API = 'https://www.googleapis.com/calendar/v3'

export const googleConfigured = () =>
  Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_REFRESH_TOKEN)

const calendarId = () => process.env.GOOGLE_CALENDAR_ID || 'primary'

// Access tokens live ~1h; reuse one until shortly before it expires
let cachedToken: { value: string; expiresAt: number } | null = null
async function accessToken() {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) return cachedToken.value
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN!,
      grant_type: 'refresh_token',
    }),
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`Google token refresh failed (${res.status}): ${await res.text()}`)
  const data = (await res.json()) as { access_token: string; expires_in: number }
  cachedToken = { value: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 }
  return cachedToken.value
}

async function calendarFetch(path: string, init: RequestInit = {}) {
  return fetch(`${API}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${await accessToken()}`, 'Content-Type': 'application/json' },
    cache: 'no-store',
  })
}

// Busy blocks from your calendar(s). GOOGLE_BUSY_CALENDAR_IDS can list extra calendars (comma-separated).
export async function getGoogleBusy(from: Date, to: Date): Promise<Interval[]> {
  if (!googleConfigured()) {
    console.warn('⚠️ [booking] Google Calendar not configured, ignoring calendar busy times')
    return []
  }
  const ids = (process.env.GOOGLE_BUSY_CALENDAR_IDS || calendarId()).split(',').map((s) => s.trim()).filter(Boolean)
  const res = await calendarFetch('/freeBusy', {
    method: 'POST',
    body: JSON.stringify({ timeMin: from.toISOString(), timeMax: to.toISOString(), items: ids.map((id) => ({ id })) }),
  })
  if (!res.ok) throw new Error(`Google freeBusy failed (${res.status}): ${await res.text()}`)

  const data = (await res.json()) as {
    calendars: Record<string, { busy?: { start: string; end: string }[]; errors?: unknown[] }>
  }
  return Object.entries(data.calendars).flatMap(([id, cal]) => {
    // A calendar we can't read must not silently count as "free"
    if (cal.errors?.length) throw new Error(`Google freeBusy error for ${id}: ${JSON.stringify(cal.errors)}`)
    return (cal.busy ?? []).map((b) => ({ start: new Date(b.start), end: new Date(b.end) }))
  })
}

// Removes the event without emailing anyone (our own cancellation email tells the client).
// Already-deleted events (404/410) count as done, so retries are safe.
export async function deleteCalendarEvent(eventId: string) {
  const res = await calendarFetch(`/calendars/${encodeURIComponent(calendarId())}/events/${eventId}?sendUpdates=none`, { method: 'DELETE' })
  if (!res.ok && res.status !== 404 && res.status !== 410) {
    throw new Error(`Google event delete failed (${res.status}): ${await res.text()}`)
  }
}

interface EventInput {
  bookingId: string
  start: string
  end: string
  timeZone: string
  summary: string
  description: string
  guestName: string
  guestEmail: string
}

// Creates the event with a Meet link and the client as guest. Google sends no email (sendUpdates=none):
// its invites use the organizer's language and time zone for non-Gmail guests, so our own email confirms instead.
// Safe to call twice: the event id is derived from the booking id, so a second call just reads the existing event.
export async function createCalendarEvent(e: EventInput): Promise<{ eventId: string; meetUrl: string | null }> {
  const eventId = e.bookingId.replace(/-/g, '') // uuid hex is valid in Google's base32hex event ids
  const cal = encodeURIComponent(calendarId())

  let res = await calendarFetch(`/calendars/${cal}/events?conferenceDataVersion=1&sendUpdates=none`, {
    method: 'POST',
    body: JSON.stringify({
      id: eventId,
      summary: e.summary,
      description: e.description,
      start: { dateTime: e.start, timeZone: e.timeZone },
      end: { dateTime: e.end, timeZone: e.timeZone },
      attendees: [{ email: e.guestEmail, displayName: e.guestName }],
      conferenceData: { createRequest: { requestId: e.bookingId, conferenceSolutionKey: { type: 'hangoutsMeet' } } },
      guestsCanModify: false,
      reminders: { useDefault: true },
    }),
  })
  if (res.status === 409) res = await calendarFetch(`/calendars/${cal}/events/${eventId}`) // already created
  if (!res.ok) throw new Error(`Google event insert failed (${res.status}): ${await res.text()}`)

  const event = (await res.json()) as {
    id: string
    hangoutLink?: string
    conferenceData?: { entryPoints?: { entryPointType: string; uri: string }[] }
  }
  const meetUrl = event.hangoutLink ?? event.conferenceData?.entryPoints?.find((p) => p.entryPointType === 'video')?.uri ?? null
  return { eventId: event.id, meetUrl }
}
