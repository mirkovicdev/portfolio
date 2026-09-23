// "Sign in with Google" for the admin page (OpenID Connect, authorization code flow).
// Protections: state (the reply belongs to a sign-in we started), PKCE (a stolen code is useless),
// nonce (no replayed tokens), and Google's signature on the ID token is verified here, not assumed.
import 'server-only'
import crypto from 'node:crypto'
import { createRemoteJWKSet, jwtVerify } from 'jose'

const AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
const TOKEN_URL = 'https://oauth2.googleapis.com/token'
const googleKeys = createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'))

export const PENDING_COOKIE = 'admin_signin'
export const CALLBACK_PATH = '/api/admin/callback'

export interface PendingSignIn {
  state: string
  nonce: string
  verifier: string
}

export const signInConfigured = () =>
  Boolean(
    process.env.ADMIN_GOOGLE_CLIENT_ID &&
      process.env.ADMIN_GOOGLE_CLIENT_SECRET &&
      process.env.ADMIN_GOOGLE_EMAIL &&
      (process.env.ADMIN_SESSION_SECRET?.length ?? 0) >= 32
  )

const random = () => crypto.randomBytes(32).toString('base64url')
// Must match an "Authorized redirect URI" of the Google client exactly (localhost + mirkovic.dev)
const redirectUri = (origin: string) => `${origin}${CALLBACK_PATH}`

// Google's sign-in URL plus the one-time values to keep in a short-lived cookie
export function startGoogleSignIn(origin: string) {
  const pending: PendingSignIn = { state: random(), nonce: random(), verifier: random() }
  const url =
    `${AUTH_URL}?` +
    new URLSearchParams({
      client_id: process.env.ADMIN_GOOGLE_CLIENT_ID!,
      redirect_uri: redirectUri(origin),
      response_type: 'code',
      scope: 'openid email',
      state: pending.state,
      nonce: pending.nonce,
      code_challenge: crypto.createHash('sha256').update(pending.verifier).digest('base64url'),
      code_challenge_method: 'S256',
      prompt: 'select_account',
      login_hint: process.env.ADMIN_GOOGLE_EMAIL ?? '',
    })
  return { url, pending }
}

// Exchanges the code and verifies Google's signed ID token. Returns the verified email address.
export async function finishGoogleSignIn(origin: string, code: string, pending: PendingSignIn) {
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.ADMIN_GOOGLE_CLIENT_ID!,
      client_secret: process.env.ADMIN_GOOGLE_CLIENT_SECRET!,
      redirect_uri: redirectUri(origin),
      grant_type: 'authorization_code',
      code_verifier: pending.verifier,
    }),
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`Google token exchange failed (${res.status})`)
  const { id_token } = (await res.json()) as { id_token?: string }
  if (!id_token) throw new Error('Google returned no ID token')

  const { payload } = await jwtVerify(id_token, googleKeys, {
    issuer: ['https://accounts.google.com', 'accounts.google.com'],
    audience: process.env.ADMIN_GOOGLE_CLIENT_ID!,
  })
  if (payload.nonce !== pending.nonce) throw new Error('Nonce mismatch')
  if (payload.email_verified !== true || typeof payload.email !== 'string') throw new Error('Email not verified')
  return payload.email.toLowerCase()
}
