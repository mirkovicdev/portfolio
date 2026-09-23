// Booking emails, sent with the Gmail login the contact form uses (EMAIL_USER / EMAIL_PASS):
// "New booking" to you + English confirmation to the client in their own time zone, and the matching
// cancellation emails when a booking is refunded or disputed.
// Google's own invite is switched off: for non-Gmail guests it comes in your language and time zone.
import 'server-only'
import nodemailer from 'nodemailer'
import { site, formatPrice } from '@/lib/site'
import { getTopic } from './catalog'
import { buildIcs, icsDate } from './ics'
import { formatRangeIn, formatTimeIn, friendlyZoneName } from './zones'
import { stripeDashboardUrl } from './stripe'
import { claimNotification, releaseNotification, type BookingRow, type NotificationColumn } from './db'

export const emailConfigured = () => Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS)

let transporter: nodemailer.Transporter | null = null
const mailer = () =>
  (transporter ??= nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  }))

const topicLabel = (b: BookingRow) => getTopic(b.topic)?.label ?? b.topic
const backgroundLabel = (b: BookingRow) => site.booking.backgrounds.find((x) => x.id === b.background)?.label ?? b.background
const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)

// To you. Plain text on purpose: nothing the visitor typed can inject HTML.
export function buildOwnerEmail(b: BookingRow): nodemailer.SendMailOptions {
  const host = site.booking.hostTimeZone
  const guestZone = b.visitor_time_zone && b.visitor_time_zone !== host ? b.visitor_time_zone : null
  const hostWhen = formatRangeIn(b.start_at, b.end_at, host, false, 'short')

  const text = [
    `${b.name} booked a ${topicLabel(b)} call.`,
    '',
    `When: ${hostWhen} ${friendlyZoneName(host)}`,
    guestZone
      ? `Their time: ${formatRangeIn(b.start_at, b.end_at, guestZone, b.visitor_hour12 ?? false, 'short')} ${friendlyZoneName(guestZone)}`
      : null,
    `Meet: ${b.meet_url ?? 'link is in your Google Calendar event'}`,
    '',
    `Paid: ${formatPrice(b.amount_cents / 100, b.currency)}`,
    `Background: ${backgroundLabel(b)}`,
    `Email: ${b.email}`,
    '',
    'What they want to talk about:',
    b.message?.trim() || 'Nothing added.',
    '',
    'Reply to this email to write to them directly.',
    b.stripe_payment_intent_id
      ? `To cancel, fully refund the payment in Stripe and everything else happens automatically:\n${stripeDashboardUrl(`payments/${b.stripe_payment_intent_id}`)}`
      : null,
  ]
    .filter((line) => line !== null)
    .join('\n')

  return {
    from: `"mirkovic.dev bookings" <${process.env.EMAIL_USER}>`,
    to: site.contactEmail,
    replyTo: b.email,
    subject: `New booking: ${topicLabel(b)} with ${b.name}, ${hostWhen}`,
    text,
  }
}

// To the client: their time zone and clock style, Meet link, calendar file. Replies go to contact@mirkovic.dev.
export function buildClientEmail(b: BookingRow): nodemailer.SendMailOptions {
  const zone = b.visitor_time_zone || site.booking.hostTimeZone
  const hour12 = b.visitor_hour12 ?? false
  const when = formatRangeIn(b.start_at, b.end_at, zone, hour12)
  const zoneName = friendlyZoneName(zone)
  const topic = topicLabel(b)
  const title = `${topic} with ${site.name}`
  const firstName = b.name.trim().split(/\s+/)[0]
  const meet = b.meet_url
  const googleAdd =
    'https://calendar.google.com/calendar/render?' +
    new URLSearchParams({
      action: 'TEMPLATE',
      text: title,
      dates: `${icsDate(b.start_at)}/${icsDate(b.end_at)}`,
      details: meet ? `Join with Google Meet: ${meet}` : '',
      location: meet ?? 'Google Meet',
    })
  const ics = buildIcs({
    uid: `${b.id}@mirkovic.dev`,
    start: b.start_at,
    end: b.end_at,
    summary: title,
    description: `${meet ? `Join with Google Meet: ${meet}\n\n` : ''}${site.booking.cancellationPolicy}`,
    location: meet ?? 'Google Meet',
    url: meet ?? undefined,
  })

  const text = [
    `Hi ${firstName},`,
    '',
    'Your call is booked.',
    '',
    `What: ${topic}, ${site.booking.durationMin}-minute video call with ${site.name}`,
    `When: ${when} ${zoneName}`,
    `Join: ${meet ?? 'the Google Meet link is in the attached calendar invite'}`,
    '',
    'Add it to your calendar with the attached invite.ics, or in Google Calendar:',
    googleAdd,
    '',
    'Want me to look at something before the call? Just reply to this email.',
    '',
    site.booking.cancellationPolicy,
    'Your receipt comes separately from Stripe.',
    '',
    'See you then,',
    'Antonije',
  ].join('\n')

  const muted = 'color:#71717a'
  const html = `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:#18181b;max-width:520px">
<p style="margin:0 0 16px">Hi ${escapeHtml(firstName)},</p>
<p style="margin:0 0 20px">Your call is booked.</p>
<table cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:0 0 24px">
<tr><td style="${muted};padding:4px 20px 4px 0;vertical-align:top">What</td><td style="padding:4px 0">${escapeHtml(topic)}, ${site.booking.durationMin}-minute video call</td></tr>
<tr><td style="${muted};padding:4px 20px 4px 0;vertical-align:top">When</td><td style="padding:4px 0">${escapeHtml(when)}<br><span style="${muted}">${escapeHtml(zoneName)}</span></td></tr>
</table>
${
  meet
    ? `<p style="margin:0 0 8px"><a href="${escapeHtml(meet)}" style="display:inline-block;background:#18181b;color:#fafafa;text-decoration:none;padding:12px 22px;border-radius:10px;font-weight:600">Join Google Meet</a></p>
<p style="margin:0 0 24px;font-size:13px;${muted}">${escapeHtml(meet)}</p>`
    : ''
}
<p style="margin:0 0 16px">Add it to your calendar with the attached <strong>invite.ics</strong>, or <a href="${escapeHtml(googleAdd)}" style="color:#18181b">add it to Google Calendar</a>.</p>
<p style="margin:0 0 16px">Want me to look at something before the call? Just reply to this email.</p>
<p style="margin:0 0 24px;font-size:13px;${muted}">${escapeHtml(site.booking.cancellationPolicy)}<br>Your receipt comes separately from Stripe.</p>
<p style="margin:0">See you then,<br>Antonije</p>
</div>`

  return {
    from: `"${site.name}" <${process.env.EMAIL_USER}>`,
    to: { name: b.name, address: b.email },
    replyTo: site.contactEmail,
    subject: `Booked: ${title}, ${formatRangeIn(b.start_at, b.end_at, zone, hour12, 'short')}`,
    text,
    html,
    attachments: [{ filename: 'invite.ics', content: ics, contentType: 'text/calendar; charset=utf-8; method=PUBLISH' }],
  }
}

// Sends each email once: the timestamp claim means the page and the webhook can't both send it
async function sendOnce(b: BookingRow, column: NotificationColumn, label: string, send: () => Promise<void>) {
  if (b[column] || !(await claimNotification(b.id, column))) return true // already sent, or being sent right now
  try {
    await send()
    console.log(`📧 [booking] ${label}`, b.id)
    return true
  } catch (err) {
    await releaseNotification(b.id, column) // let the webhook retry send it
    console.error(`❌ [booking] ${label} failed`, b.id, err)
    return false
  }
}

// ---- Reminder (one email, ~1 hour before) ----

// "1 hour" normally; the real remaining time if the reminder runs late
function startsIn(startIso: string, now: Date) {
  const minutes = Math.max(1, Math.round((new Date(startIso).getTime() - now.getTime()) / 60000))
  return minutes >= 55 ? '1 hour' : `${minutes} minute${minutes === 1 ? '' : 's'}`
}

export function buildReminderEmail(b: BookingRow, now = new Date()): nodemailer.SendMailOptions {
  const zone = b.visitor_time_zone || site.booking.hostTimeZone
  const time = `${formatTimeIn(b.start_at, zone, b.visitor_hour12 ?? false)} ${friendlyZoneName(zone)}`
  const topic = topicLabel(b)
  const firstName = b.name.trim().split(/\s+/)[0]
  const soon = startsIn(b.start_at, now)
  const meet = b.meet_url

  const text = [
    `Hi ${firstName},`,
    '',
    `Your ${topic} call with ${site.name} starts in ${soon}, at ${time}.`,
    '',
    meet ? `Join: ${meet}` : 'The Google Meet link is in your confirmation email.',
    '',
    'If something came up, reply to this email.',
    '',
    'Antonije',
  ].join('\n')

  const html = `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:#18181b;max-width:520px">
<p style="margin:0 0 16px">Hi ${escapeHtml(firstName)},</p>
<p style="margin:0 0 20px">Your ${escapeHtml(topic)} call with ${site.name} starts in ${soon}, at ${escapeHtml(time)}.</p>
${
  meet
    ? `<p style="margin:0 0 8px"><a href="${escapeHtml(meet)}" style="display:inline-block;background:#18181b;color:#fafafa;text-decoration:none;padding:12px 22px;border-radius:10px;font-weight:600">Join Google Meet</a></p>
<p style="margin:0 0 20px;font-size:13px;color:#71717a">${escapeHtml(meet)}</p>`
    : '<p style="margin:0 0 20px">The Google Meet link is in your confirmation email.</p>'
}
<p style="margin:0 0 16px">If something came up, reply to this email.</p>
<p style="margin:0">Antonije</p>
</div>`

  return {
    from: `"${site.name}" <${process.env.EMAIL_USER}>`,
    to: { name: b.name, address: b.email },
    replyTo: site.contactEmail,
    subject: `Starting in ${soon}: ${topic} with ${site.name}`,
    text,
    html,
  }
}

// Sends the reminder once (claimed like the other emails). False if sending failed, so the next run retries.
export async function sendReminder(b: BookingRow) {
  if (!emailConfigured()) return true
  return sendOnce(b, 'reminder_sent_at', 'Reminder sent', async () => void (await mailer().sendMail(buildReminderEmail(b))))
}

// ---- Cancellations (full refund or dispute) ----

export interface DisputeInfo {
  id: string
  reason: string // Stripe's code, e.g. "fraudulent", "product_not_received"
  dueBy: number | null // unix seconds: deadline for your evidence
}

type Cancellation = 'refunded' | 'disputed'

const hostStamp = (iso: string | null) =>
  iso
    ? new Intl.DateTimeFormat('en-GB', { timeZone: site.booking.hostTimeZone, day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(iso))
    : 'n/a'

// To you: what happened, and what (if anything) you still need to do
export function buildOwnerCancellationEmail(b: BookingRow, reason: Cancellation, callHappened: boolean, dispute?: DisputeInfo): nodemailer.SendMailOptions {
  const host = site.booking.hostTimeZone
  const topic = topicLabel(b)
  const shortWhen = formatRangeIn(b.start_at, b.end_at, host, false, 'short')
  const when = `${shortWhen} ${friendlyZoneName(host)}`
  const paid = formatPrice(b.amount_cents / 100, b.currency)

  const lines =
    reason === 'refunded'
      ? [
          `You refunded ${b.name}'s ${topic} call on ${when}, so it is cancelled.`,
          '',
          'The calendar event is removed, the time is open again, and they got an email saying the call is cancelled and refunded.',
        ]
      : [
          `${b.name} disputed the ${paid} payment for their ${topic} call on ${when}.`,
          `Bank's reason: ${dispute?.reason.replace(/_/g, ' ') ?? 'not given'}`,
          '',
          callHappened
            ? 'The call already took place, so nothing was cancelled.'
            : 'The call is cancelled: the calendar event is removed, the time is open again, and they got an email about it.',
          '',
          `Respond in Stripe${dispute?.dueBy ? ` before ${hostStamp(new Date(dispute.dueBy * 1000).toISOString())}` : ''}:`,
          stripeDashboardUrl(`disputes/${dispute?.id ?? ''}`),
          '',
          'Evidence you can use:',
          `- Booked on mirkovic.dev: ${hostStamp(b.created_at)}`,
          `- Payment confirmed: ${hostStamp(b.confirmed_at)}`,
          `- Confirmation email sent to ${b.email}: ${hostStamp(b.client_notified_at)}`,
          `- Meet link: ${b.meet_url ?? 'none'}`,
        ]

  return {
    from: `"mirkovic.dev bookings" <${process.env.EMAIL_USER}>`,
    to: site.contactEmail,
    replyTo: b.email,
    subject: reason === 'refunded' ? `Cancelled: ${topic} with ${b.name}, ${shortWhen}` : `Payment disputed: ${topic} with ${b.name}`,
    text: lines.join('\n'),
  }
}

// To the client, only for calls that haven't happened yet. 'host' = you cancelled it from the admin page.
export function buildClientCancellationEmail(b: BookingRow, reason: Cancellation | 'host'): nodemailer.SendMailOptions {
  const zone = b.visitor_time_zone || site.booking.hostTimeZone
  const hour12 = b.visitor_hour12 ?? false
  const when = `${formatRangeIn(b.start_at, b.end_at, zone, hour12)} ${friendlyZoneName(zone)}`
  const topic = topicLabel(b)
  const firstName = b.name.trim().split(/\s+/)[0]
  const paid = formatPrice(b.amount_cents / 100, b.currency)

  const body = {
    refunded: [
      `Your ${topic} call on ${when} has been cancelled, and your payment of ${paid} has been refunded in full.`,
      'Refunds usually show up on your statement within 5–10 business days.',
      `Want to book another time? ${site.url}`,
    ],
    disputed: [
      `Your ${topic} call on ${when} has been cancelled because the payment was disputed with your bank.`,
      'If this is a mistake, just reply to this email.',
    ],
    host: [`Your ${topic} call on ${when} has been cancelled.`, 'If you have any questions, just reply to this email.'],
  }[reason]

  const text = [`Hi ${firstName},`, '', ...body.flatMap((p) => [p, '']), 'Antonije'].join('\n')
  const html = `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:#18181b;max-width:520px">
<p style="margin:0 0 16px">Hi ${escapeHtml(firstName)},</p>
${body.map((p) => `<p style="margin:0 0 16px">${escapeHtml(p)}</p>`).join('\n')}
<p style="margin:0">Antonije</p>
</div>`

  return {
    from: `"${site.name}" <${process.env.EMAIL_USER}>`,
    to: { name: b.name, address: b.email },
    replyTo: site.contactEmail,
    subject: `Cancelled: ${topic} with ${site.name}, ${formatRangeIn(b.start_at, b.end_at, zone, hour12, 'short')}`,
    text,
    html,
  }
}

// You cancelled from the admin page and chose to tell the client (sent at most once)
export async function sendHostCancellationEmail(b: BookingRow) {
  if (!emailConfigured()) return false
  return sendOnce(b, 'client_cancel_notified_at', 'Client told about host cancellation', async () =>
    void (await mailer().sendMail(buildClientCancellationEmail(b, 'host')))
  )
}

// Cancellation emails, each exactly once. False if one failed, so the Stripe webhook retries.
export async function sendCancellationEmails(b: BookingRow, reason: Cancellation, callHappened: boolean, dispute?: DisputeInfo) {
  if (!emailConfigured()) {
    console.warn('⚠️ [booking] EMAIL_USER / EMAIL_PASS not set, no cancellation emails sent')
    return true
  }
  const jobs = [
    sendOnce(b, 'owner_cancel_notified_at', `Host told about ${reason} booking`, async () =>
      void (await mailer().sendMail(buildOwnerCancellationEmail(b, reason, callHappened, dispute)))
    ),
  ]
  if (!callHappened) {
    jobs.push(
      sendOnce(b, 'client_cancel_notified_at', `Client told about ${reason} booking`, async () =>
        void (await mailer().sendMail(buildClientCancellationEmail(b, reason)))
      )
    )
  }
  return (await Promise.all(jobs)).every(Boolean)
}

// Both booking emails. False if one failed, so the Stripe webhook knows to retry.
export async function sendBookingEmails(b: BookingRow): Promise<boolean> {
  if (!emailConfigured()) {
    console.warn('⚠️ [booking] EMAIL_USER / EMAIL_PASS not set, no booking emails sent')
    return true
  }
  const results = await Promise.all([
    sendOnce(b, 'owner_notified_at', 'Host notified', async () => void (await mailer().sendMail(buildOwnerEmail(b)))),
    sendOnce(b, 'client_notified_at', 'Client confirmation sent', async () => void (await mailer().sendMail(buildClientEmail(b)))),
  ])
  return results.every(Boolean)
}
