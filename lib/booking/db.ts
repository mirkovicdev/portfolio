// Supabase access for call_bookings. Uses the service role key, so this must never reach the browser.
import 'server-only'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Interval, Window } from './slots'

export interface BookingRow {
  id: string
  start_at: string
  end_at: string
  status: 'pending' | 'confirmed' | 'expired' | 'cancelled'
  hold_expires_at: string | null
  topic: string
  tier: string
  background: string
  message: string | null
  name: string
  email: string
  visitor_time_zone: string | null
  visitor_hour12: boolean | null
  amount_cents: number
  currency: string
  stripe_payment_intent_id: string | null
  google_event_id: string | null
  meet_url: string | null
  confirmed_at: string | null
  created_at: string
  owner_notified_at: string | null
  client_notified_at: string | null
  cancelled_at: string | null
  cancel_reason: CancelReason | null
  owner_cancel_notified_at: string | null
  client_cancel_notified_at: string | null
  reminder_sent_at: string | null
}

export type CancelReason = 'refunded' | 'disputed' | 'taken_while_paying' | 'cancelled_by_host'

export type NotificationColumn =
  | 'owner_notified_at'
  | 'client_notified_at'
  | 'owner_cancel_notified_at'
  | 'client_cancel_notified_at'
  | 'reminder_sent_at'

export type NewHold = Pick<
  BookingRow,
  | 'start_at'
  | 'end_at'
  | 'topic'
  | 'tier'
  | 'background'
  | 'message'
  | 'name'
  | 'email'
  | 'visitor_time_zone'
  | 'visitor_hour12'
  | 'amount_cents'
  | 'currency'
>

const OVERLAP_VIOLATION = '23P01' // call_bookings_no_overlap rejected the row

let client: SupabaseClient | null = null
function supabase() {
  client ??= createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  })
  return client
}
const db = () => supabase().from('call_bookings')
const availability = () => supabase().from('call_availability')

// ---- Opened days (admin page) ----

// Opened days between two "YYYY-MM-DD" dates (inclusive), keyed by day
export async function getOpenedDays(fromDay: string, toDay: string): Promise<Record<string, Window[]>> {
  const { data, error } = await availability().select('day, windows').gte('day', fromDay).lte('day', toDay)
  if (error) throw error
  return Object.fromEntries((data as { day: string; windows: Window[] }[]).map((r) => [r.day, r.windows]))
}

// Gives several days the same windows; an empty list closes them
export async function setOpenedDays(days: string[], windows: Window[]) {
  const updated_at = new Date().toISOString()
  const { error } =
    windows.length === 0
      ? await availability().delete().in('day', days)
      : await availability().upsert(days.map((day) => ({ day, windows, updated_at })))
  if (error) throw error
}

// Paid calls starting within the next `minutes` that haven't had their reminder yet
export async function getBookingsDueForReminder(now: Date, minutes: number): Promise<BookingRow[]> {
  const { data, error } = await db()
    .select('*')
    .eq('status', 'confirmed')
    .is('reminder_sent_at', null)
    .gt('start_at', now.toISOString())
    .lte('start_at', new Date(now.getTime() + minutes * 60000).toISOString())
  if (error) throw error
  return data as BookingRow[]
}

// Paid calls from `from` onwards, for the admin page
export async function getUpcomingBookings(from: Date): Promise<BookingRow[]> {
  const { data, error } = await db().select('*').eq('status', 'confirmed').gte('end_at', from.toISOString()).order('start_at')
  if (error) throw error
  return data as BookingRow[]
}

// ---- Bookings ----

// Frees times whose payment window ran out, so the overlap rule stops blocking them
export async function expireStaleHolds() {
  const { error } = await db()
    .update({ status: 'expired' })
    .eq('status', 'pending')
    .lt('hold_expires_at', new Date().toISOString())
  if (error) throw error
}

// Reserves a time while the visitor pays. Returns null if the time was taken in the meantime.
export async function createHold(hold: NewHold, holdMinutes: number): Promise<BookingRow | null> {
  const { data, error } = await db()
    .insert({ ...hold, status: 'pending', hold_expires_at: new Date(Date.now() + holdMinutes * 60000).toISOString() })
    .select()
    .single()
  if (error?.code === OVERLAP_VIOLATION) return null
  if (error) throw error
  return data as BookingRow
}

export async function releaseHold(id: string) {
  const { error } = await db().update({ status: 'expired' }).eq('id', id).eq('status', 'pending')
  if (error) throw error
}

export async function getBooking(id: string): Promise<BookingRow | null> {
  const { data, error } = await db().select('*').eq('id', id).maybeSingle()
  if (error) throw error
  return data as BookingRow | null
}

export async function updateBooking(id: string, fields: Partial<BookingRow>) {
  const { error } = await db().update(fields).eq('id', id)
  if (error) throw error
}

// Marks a held (or lapsed) booking as paid. Returns false if someone else got the time while this payment ran.
export async function markConfirmed(id: string): Promise<boolean> {
  const { error } = await db()
    .update({ status: 'confirmed', confirmed_at: new Date().toISOString(), hold_expires_at: null })
    .eq('id', id)
    .in('status', ['pending', 'expired'])
  if (error?.code === OVERLAP_VIOLATION) return false
  if (error) throw error
  return true
}

export async function getBookingByPaymentIntent(paymentIntentId: string): Promise<BookingRow | null> {
  const { data, error } = await db().select('*').eq('stripe_payment_intent_id', paymentIntentId).maybeSingle()
  if (error) throw error
  return data as BookingRow | null
}

// Paid booking → cancelled. Only one caller wins (webhooks can arrive twice); frees the time via the overlap rule.
export async function markCancelled(id: string, reason: CancelReason): Promise<boolean> {
  const { data, error } = await db()
    .update({ status: 'cancelled', cancelled_at: new Date().toISOString(), cancel_reason: reason })
    .eq('id', id)
    .eq('status', 'confirmed')
    .select('id')
  if (error) throw error
  return (data?.length ?? 0) > 0
}

// Exactly-once guard for an email: only the caller that flips the timestamp gets true
export async function claimNotification(id: string, column: NotificationColumn): Promise<boolean> {
  const { data, error } = await db()
    .update({ [column]: new Date().toISOString() })
    .eq('id', id)
    .is(column, null)
    .select('id')
  if (error) throw error
  return (data?.length ?? 0) > 0
}

// Undo the claim when sending failed, so the webhook retry can send it
export async function releaseNotification(id: string, column: NotificationColumn) {
  const { error } = await db().update({ [column]: null }).eq('id', id)
  if (error) throw error
}

// Paid bookings and live holds that overlap [from, to)
export async function getActiveBookings(from: Date, to: Date): Promise<Interval[]> {
  const { data, error } = await db()
    .select('start_at, end_at')
    .lt('start_at', to.toISOString())
    .gt('end_at', from.toISOString())
    .or(`status.eq.confirmed,and(status.eq.pending,hold_expires_at.gt.${new Date().toISOString()})`)
  if (error) throw error
  return (data as { start_at: string; end_at: string }[]).map((b) => ({ start: new Date(b.start_at), end: new Date(b.end_at) }))
}
