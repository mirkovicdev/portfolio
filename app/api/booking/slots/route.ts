import { NextResponse } from 'next/server'
import { getAvailableSlots } from '@/lib/booking/availability'

export const dynamic = 'force-dynamic'

// Open start times as ISO strings; the browser shows them in the visitor's time zone
export async function GET() {
  try {
    const slots = await getAvailableSlots()
    console.log('📅 [slots] Served', slots.length, 'open times')
    return NextResponse.json(
      { slots: slots.map((s) => s.toISOString()) },
      // Short CDN cache; the checkout re-checks the exact time anyway
      { headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=30' } }
    )
  } catch (err) {
    console.error('❌ [slots] Failed to load availability', err)
    return NextResponse.json({ error: 'Could not load available times' }, { status: 503 })
  }
}
