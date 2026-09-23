import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { CALLBACK_PATH, PENDING_COOKIE, finishGoogleSignIn, type PendingSignIn } from '@/lib/admin/google-signin'
import { adminEmail, createSessionCookie } from '@/lib/admin/session'

// Google sends you back here. The session cookie is only issued for the admin account.
export async function GET(req: Request) {
  const url = new URL(req.url)
  const refuse = (why: string) => {
    console.warn('⛔ [admin] Sign-in refused:', why)
    const res = NextResponse.redirect(new URL('/admin?denied=1', url.origin))
    res.cookies.set(PENDING_COOKIE, '', { path: CALLBACK_PATH, maxAge: 0 })
    return res
  }

  let pending: PendingSignIn
  try {
    pending = JSON.parse((await cookies()).get(PENDING_COOKIE)?.value ?? '')
  } catch {
    return refuse('no sign-in in progress')
  }
  if (!url.searchParams.get('state') || url.searchParams.get('state') !== pending.state) return refuse('state mismatch')
  const code = url.searchParams.get('code')
  if (!code) return refuse(`no code (${url.searchParams.get('error') ?? 'unknown'})`)

  try {
    const email = await finishGoogleSignIn(url.origin, code, pending)
    if (email !== adminEmail()) return refuse(`not the admin account: ${email}`)

    const session = await createSessionCookie(email)
    const res = NextResponse.redirect(new URL('/admin', url.origin))
    res.cookies.set(session.name, session.value, session.options)
    res.cookies.set(PENDING_COOKIE, '', { path: CALLBACK_PATH, maxAge: 0 })
    console.log('🔐 [admin] Signed in', email)
    return res
  } catch (err) {
    return refuse(err instanceof Error ? err.message : 'sign-in failed')
  }
}
