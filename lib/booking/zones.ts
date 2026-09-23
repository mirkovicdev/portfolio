// Human-friendly time zone names, shared by the booking page and the emails (no secrets, runs anywhere)

// "Eastern Time (New York)" from "America/New_York"; just the city if the runtime lacks zone names
export function friendlyZoneName(timeZone: string) {
  const city = timeZone.split('/').pop()!.replace(/_/g, ' ')
  try {
    const name = new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'longGeneric' })
      .formatToParts(new Date())
      .find((p) => p.type === 'timeZoneName')?.value
    if (!name) return city
    return name.includes(city) ? name : `${name} (${city})` // avoid "Singapore Standard Time (Singapore)"
  } catch {
    return city
  }
}

// "11:00 AM" (12-hour visitors) or "17:00" in a given zone
export const formatTimeIn = (iso: string, timeZone: string, hour12: boolean) =>
  hour12
    ? new Intl.DateTimeFormat('en-US', { timeZone, hour: 'numeric', minute: '2-digit' }).format(new Date(iso))
    : new Intl.DateTimeFormat('en-GB', { timeZone, hour: '2-digit', minute: '2-digit' }).format(new Date(iso))

// "Tuesday 6 October, 11:00 AM – 11:45 AM" style range in a given zone and clock style
export function formatRangeIn(startIso: string, endIso: string, timeZone: string, hour12: boolean, weekday: 'long' | 'short' = 'long') {
  const day = new Intl.DateTimeFormat('en-GB', { timeZone, weekday, day: 'numeric', month: weekday === 'long' ? 'long' : 'short' }).format(new Date(startIso))
  return `${day}, ${formatTimeIn(startIso, timeZone, hour12)} – ${formatTimeIn(endIso, timeZone, hour12)}`
}
