import { NextResponse } from 'next/server'
import { CALLBACK_PATH, PENDING_COOKIE, signInConfigured, startGoogleSignIn } from '@/lib/admin/google-signin'

// Sends you to Google. Anyone can start this, but only ADMIN_GOOGLE_EMAIL gets a session afterwards.
export async function GET(req: Request) {
  if (!signInConfigured()) return new NextResponse('Admin sign-in is not configured', { status: 500 })
  const { url, pending } = startGoogleSignIn(new URL(req.url).origin)

  const res = NextResponse.redirect(url)
  // Only sent back to the callback, and only for 10 minutes
  res.cookies.set(PENDING_COOKIE, JSON.stringify(pending), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: CALLBACK_PATH,
    maxAge: 600,
  })
  return res
}
