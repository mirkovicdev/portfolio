import { NextResponse } from 'next/server'
import { SESSION_COOKIE } from '@/lib/admin/session'

// Signs out: the form on the admin page posts here
export async function POST(req: Request) {
  const res = NextResponse.redirect(new URL('/admin', req.url), 303)
  res.cookies.set(SESSION_COOKIE, '', { path: '/', maxAge: 0 })
  return res
}
