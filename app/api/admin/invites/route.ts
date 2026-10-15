import crypto from 'node:crypto'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdmin } from '@/lib/admin/session'
import { createInvite, revokeInvite } from '@/lib/booking/db'
import { inviteUrl } from '@/lib/booking/catalog'

const createSchema = z.object({
  label: z.string().trim().max(100).optional(),
  price: z.number().int().min(0).max(10000).optional(), // whole dollars; 0 or missing = free call
})
const revokeSchema = z.object({ id: z.string().uuid() })

// Creates a personal one-time link for a call, free or at a set price. Admin only.
export async function POST(req: Request) {
  if (!(await requireAdmin(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = createSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

  try {
    // 128 random bits: impossible to guess, still short enough to paste in a DM
    const price = parsed.data.price ?? 0
    const invite = await createInvite(crypto.randomBytes(16).toString('base64url'), parsed.data.label || null, price * 100)
    console.log('🎟️ [admin] Link created', invite.id, price ? `$${price}` : 'free')
    return NextResponse.json({ id: invite.id, label: invite.label, createdAt: invite.created_at, url: inviteUrl(invite.token), price })
  } catch (err) {
    console.error('❌ [admin] Creating a link failed', err)
    return NextResponse.json({ error: 'Could not create the link' }, { status: 500 })
  }
}

// Stops an unused link from working. Admin only.
export async function DELETE(req: Request) {
  if (!(await requireAdmin(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = revokeSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

  try {
    if (!(await revokeInvite(parsed.data.id))) return NextResponse.json({ error: 'Link not found' }, { status: 404 })
    console.log('🚫 [admin] Link revoked', parsed.data.id)
    return NextResponse.json({ revoked: true })
  } catch (err) {
    console.error('❌ [admin] Revoking a link failed', err)
    return NextResponse.json({ error: 'Could not revoke the link' }, { status: 500 })
  }
}
