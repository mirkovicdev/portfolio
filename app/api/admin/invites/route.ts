import crypto from 'node:crypto'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdmin } from '@/lib/admin/session'
import { createInvite, revokeInvite } from '@/lib/booking/db'
import { inviteUrl } from '@/lib/booking/catalog'

const createSchema = z.object({ label: z.string().trim().max(100).optional() })
const revokeSchema = z.object({ id: z.string().uuid() })

// Creates a personal one-time link for a free call. Admin only.
export async function POST(req: Request) {
  if (!(await requireAdmin(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = createSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

  try {
    // 128 random bits: impossible to guess, still short enough to paste in a DM
    const invite = await createInvite(crypto.randomBytes(16).toString('base64url'), parsed.data.label || null)
    console.log('🎟️ [admin] Free call link created', invite.id)
    return NextResponse.json({ id: invite.id, label: invite.label, createdAt: invite.created_at, url: inviteUrl(invite.token) })
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
    console.log('🚫 [admin] Free call link revoked', parsed.data.id)
    return NextResponse.json({ revoked: true })
  } catch (err) {
    console.error('❌ [admin] Revoking a link failed', err)
    return NextResponse.json({ error: 'Could not revoke the link' }, { status: 500 })
  }
}
