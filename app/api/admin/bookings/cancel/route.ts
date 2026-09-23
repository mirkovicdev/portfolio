import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdmin } from '@/lib/admin/session'
import { cancelByHost } from '@/lib/booking/cancel'

const schema = z.object({ bookingId: z.string().uuid(), notifyClient: z.boolean() })

// Cancels a booking without refunding it. Admin only; refunds still go through Stripe.
export async function POST(req: Request) {
  if (!(await requireAdmin(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

  try {
    const result = await cancelByHost(parsed.data.bookingId, parsed.data.notifyClient)
    if (result.status === 'not_found') return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    if (result.status === 'not_confirmed') return NextResponse.json({ error: 'This booking is already cancelled' }, { status: 409 })
    return NextResponse.json(result)
  } catch (err) {
    console.error('❌ [admin] Cancel failed', err)
    return NextResponse.json({ error: 'Could not cancel' }, { status: 500 })
  }
}
