// Admin session: a signed cookie issued after Google sign-in, only for ADMIN_GOOGLE_EMAIL.
// No password exists anywhere on the site; the cookie can't be read by page scripts (httpOnly)
// and can't be forged without ADMIN_SESSION_SECRET.
import 'server-only'
import { cookies } from 'next/headers'
import { SignJWT, jwtVerify } from 'jose'

export const SESSION_COOKIE = 'admin_session'
const SESSION_HOURS = 12
const AUDIENCE = 'mirkovic.dev/admin'

export const adminEmail = () => process.env.ADMIN_GOOGLE_EMAIL?.trim().toLowerCase() || null

function sessionSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET
  if (!secret || secret.length < 32) return null
  return new TextEncoder().encode(secret)
}

export async function createSessionCookie(email: string) {
  const secret = sessionSecret()
  if (!secret) throw new Error('ADMIN_SESSION_SECRET must be set (32+ characters)')
  const token = await new SignJWT({ email })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setAudience(AUDIENCE)
    .setExpirationTime(`${SESSION_HOURS}h`)
    .sign(secret)
  return {
    name: SESSION_COOKIE,
    value: token,
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
      maxAge: SESSION_HOURS * 3600,
    },
  }
}

// The signed-in admin, or null. Re-checks the allowed email on every request.
export async function getAdminSession(): Promise<{ email: string } | null> {
  const secret = sessionSecret()
  const allowed = adminEmail()
  const token = (await cookies()).get(SESSION_COOKIE)?.value
  if (!secret || !allowed || !token) return null
  try {
    const { payload } = await jwtVerify(token, secret, { audience: AUDIENCE, algorithms: ['HS256'] })
    const email = String(payload.email ?? '').toLowerCase()
    return email === allowed ? { email } : null
  } catch {
    return null // expired, tampered with, or signed with another secret
  }
}

// For admin API routes: a signed-in admin AND a request sent by mirkovic.dev itself,
// so another website can't make your browser change your availability (CSRF)
export async function requireAdmin(req: Request) {
  if (req.method !== 'GET') {
    const origin = req.headers.get('origin')
    if (!origin || new URL(origin).host !== req.headers.get('host')) return null
  }
  return getAdminSession()
}
