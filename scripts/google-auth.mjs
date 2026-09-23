// One-time helper: connects your Google Calendar and prints GOOGLE_REFRESH_TOKEN for .env.
// Usage: put GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET (Desktop app client) in .env, then run
//   node scripts/google-auth.mjs
// and open the printed link. Uses only Node built-ins.
import http from 'node:http'
import fs from 'node:fs'

// Minimal .env reader (KEY=VALUE lines), so no dotenv dependency is needed
const env = { ...Object.fromEntries(
  fs.existsSync('.env')
    ? fs.readFileSync('.env', 'utf8').split(/\r?\n/).map((l) => l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)).filter(Boolean).map((m) => [m[1], m[2].replace(/^["']|["']$/g, '')])
    : []
), ...process.env }

const clientId = env.GOOGLE_CLIENT_ID
const clientSecret = env.GOOGLE_CLIENT_SECRET
if (!clientId || !clientSecret) {
  console.error('❌ Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env first (Google Cloud → Clients → Desktop app).')
  process.exit(1)
}

const PORT = 53682
const redirectUri = `http://127.0.0.1:${PORT}`
// Create/read events (invites + Meet links) and read free/busy times. `email` only shows which account got connected.
const CALENDAR_SCOPES = ['https://www.googleapis.com/auth/calendar.events', 'https://www.googleapis.com/auth/calendar.freebusy']
const scope = ['openid', 'email', ...CALENDAR_SCOPES].join(' ')

const authUrl =
  'https://accounts.google.com/o/oauth2/v2/auth?' +
  new URLSearchParams({ client_id: clientId, redirect_uri: redirectUri, response_type: 'code', scope, access_type: 'offline', prompt: 'consent' })

const server = http.createServer(async (req, res) => {
  const code = new URL(req.url, redirectUri).searchParams.get('code')
  if (!code) return res.end('Waiting for Google…')

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ code, client_id: clientId, client_secret: clientSecret, redirect_uri: redirectUri, grant_type: 'authorization_code' }),
  })
  const tokens = await tokenRes.json()
  res.end(tokens.refresh_token ? 'Connected. You can close this tab and go back to the terminal.' : 'Something went wrong, check the terminal.')
  server.close()

  if (!tokens.refresh_token) {
    console.error('❌ No refresh token returned:', tokens)
    process.exit(1)
  }

  // Google lets you untick individual permissions on the consent screen; both calendar ones are required
  const missing = CALENDAR_SCOPES.filter((s) => !tokens.scope?.split(' ').includes(s))
  if (missing.length) {
    console.error('❌ Some calendar permissions were not ticked:', missing.join(', '), '\nRun the script again and tick every box.')
    process.exit(1)
  }

  const account = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  }).then((r) => r.json())
  console.log(`✅ Connected Google account: ${account.email ?? '(unknown)'}`)

  // Quick check that the token can read your calendar
  const now = new Date()
  const fb = await fetch('https://www.googleapis.com/calendar/v3/freeBusy', {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokens.access_token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ timeMin: now.toISOString(), timeMax: new Date(now.getTime() + 7 * 864e5).toISOString(), items: [{ id: 'primary' }] }),
  }).then((r) => r.json())
  const busy = fb.calendars?.primary?.busy
  console.log(busy ? `✅ Calendar connected: ${busy.length} busy block(s) in the next 7 days.` : '⚠️ Token works but free/busy check failed:', busy ? '' : fb)

  console.log('\nAdd this line to .env (and to Vercel → Settings → Environment Variables):\n')
  console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}\n`)
})

server.listen(PORT, '127.0.0.1', () => {
  console.log('Open this link, sign in with the Google account whose calendar you use, and allow access:\n')
  console.log(authUrl + '\n')
})
