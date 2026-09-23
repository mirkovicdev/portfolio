// Minimal RFC 5545 calendar file, so any calendar app (Outlook, Apple, Google) can add the call
import 'server-only'

const pad = (n: number) => String(n).padStart(2, '0')

// "20261006T150000Z" (UTC, as calendar files and Google's "add event" link expect)
export function icsDate(iso: string) {
  const d = new Date(iso)
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`
}

const escapeText = (s: string) => s.replace(/\\/g, '\\\\').replace(/\r?\n/g, '\\n').replace(/([,;])/g, '\\$1')

// Lines over 75 bytes are folded: CRLF + one space, continuation chunks up to 74 bytes
function fold(line: string) {
  if (Buffer.byteLength(line, 'utf8') <= 75) return line
  const chunks: string[] = []
  let current = ''
  for (const ch of line) {
    if (Buffer.byteLength(current + ch, 'utf8') > (chunks.length ? 74 : 75)) {
      chunks.push(current)
      current = ''
    }
    current += ch
  }
  chunks.push(current)
  return chunks.join('\r\n ')
}

interface IcsEvent {
  uid: string
  start: string
  end: string
  summary: string
  description: string
  location: string
  url?: string
}

export function buildIcs(e: IcsEvent) {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//mirkovic.dev//Booking//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${e.uid}`,
    `DTSTAMP:${icsDate(new Date().toISOString())}`,
    `DTSTART:${icsDate(e.start)}`,
    `DTEND:${icsDate(e.end)}`,
    `SUMMARY:${escapeText(e.summary)}`,
    `DESCRIPTION:${escapeText(e.description)}`,
    `LOCATION:${escapeText(e.location)}`,
    ...(e.url ? [`URL:${e.url}`] : []),
    // Reminder inside the client's own calendar app
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    'TRIGGER:-PT15M',
    `DESCRIPTION:${escapeText(e.summary)}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ]
  return lines.map(fold).join('\r\n') + '\r\n'
}
