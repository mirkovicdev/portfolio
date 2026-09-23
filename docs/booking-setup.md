# Booking setup

The "Book a call" section runs on Next.js API routes + Supabase (`call_bookings`, `call_availability`) + Stripe + Google Calendar.
Opened days/hours are managed on `/admin`. Prices, topics, notice, buffer and the booking window live in `lib/site.ts` → `booking`.

## Environment variables

Add to `.env` locally and to Vercel → Settings → Environment Variables (redeploy after changing `NEXT_PUBLIC_*`).

| Variable | Where it comes from |
|---|---|
| `STRIPE_SECRET_KEY` | Stripe → Developers → API keys (`sk_test_…` while testing, `sk_live_…` for real) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Same page (`pk_test_…` / `pk_live_…`) |
| `STRIPE_WEBHOOK_SECRET` | Stripe → Developers → Webhooks → endpoint `https://mirkovic.dev/api/stripe/webhook` with events `payment_intent.succeeded`, `payment_intent.canceled`, `charge.refunded` and `charge.dispute.created` → Signing secret (`whsec_…`) |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Google Cloud, see below |
| `GOOGLE_REFRESH_TOKEN` | Printed by `node scripts/google-auth.mjs` |
| `ADMIN_GOOGLE_CLIENT_ID`, `ADMIN_GOOGLE_CLIENT_SECRET` | Google Cloud → Clients → **Web application** client, see "Admin page" below |
| `ADMIN_GOOGLE_EMAIL` | The only Google account allowed into `/admin` |
| `ADMIN_SESSION_SECRET` | Random 64-character string that signs admin sessions (generate a new one per environment) |
| `CRON_SECRET` | Random 64-character string; the reminder scheduler must send it (see "Reminder emails") |
| `GOOGLE_CALENDAR_ID` (optional) | Calendar that receives bookings. Default: `primary` |
| `GOOGLE_BUSY_CALENDAR_IDS` (optional) | Comma-separated calendars that count as busy (e.g. a university calendar). Default: the booking calendar |

Supabase keys are already in `.env`.

## Google Calendar (one time, ~15 min)

1. [console.cloud.google.com](https://console.cloud.google.com) → create a project (e.g. "mirkovic-dev-booking").
2. APIs & Services → Library → enable **Google Calendar API**.
3. Google Auth Platform → Branding: app name + your email. Audience: **External**, then **Publish app** (status "In production").
   If it stays in "Testing", the refresh token stops working after 7 days.
4. Clients → Create client → **Desktop app** → copy the client ID and secret into `.env`.
5. Run `node scripts/google-auth.mjs`, open the link, sign in with the account whose calendar you use.
   Google shows "Google hasn't verified this app" once: Advanced → continue. It is your own app.
   Tick every permission box on the consent screen; the script checks and tells you if one is missing.
6. Copy the printed `GOOGLE_REFRESH_TOKEN` into `.env` and Vercel.

Clients see the connected account's address as the organizer of the invite.

## Admin page (`/admin`)

Where you open days for bookings (nothing is bookable until you do) and see upcoming calls.

- Login is "Sign in with Google", accepted only for `ADMIN_GOOGLE_EMAIL`. No password exists on the site;
  keep 2-step verification on that Google account, since the admin is exactly as safe as it.
- Google Cloud → Clients → Create client → **Web application**, with authorized redirect URIs
  `http://localhost:3000/api/admin/callback` and `https://mirkovic.dev/api/admin/callback`.
- Sessions last 12 hours (signed, httpOnly cookie). Every admin API call re-checks the session on the server
  and only accepts requests sent from the site itself.

## Reminder emails

Each client gets one reminder about an hour before the call (`reminderMinutesBefore` in `lib/site.ts`).
`/api/booking/reminders` sends due reminders (each exactly once); a scheduler calls it every 10 minutes.
Vercel Cron on the free plan only runs daily, so Supabase Cron does the ticking. Run once after the site is live
(same `CRON_SECRET` as in Vercel):

```sql
create extension if not exists pg_cron;
create extension if not exists pg_net;
select vault.create_secret('<CRON_SECRET>', 'mirkovic_cron_secret');
select cron.schedule('mirkovic-call-reminders', '*/10 * * * *', $$
  select net.http_get(
    url := 'https://mirkovic.dev/api/booking/reminders',
    headers := jsonb_build_object('Authorization', 'Bearer ' ||
      (select decrypted_secret from vault.decrypted_secrets where name = 'mirkovic_cron_secret')),
    timeout_milliseconds := 20000
  );
$$);
```

Check what's due without sending: `GET /api/booking/reminders?dryRun=1` with the same `Authorization` header.

## Stripe

- No products or prices are needed in Stripe: the server charges the amount from `lib/site.ts` directly.
- Test first with test keys. Test card: `4242 4242 4242 4242`, any future date, any CVC. Receipts are not emailed in test mode.
- The page confirms bookings itself right after payment; the webhook is the backup (visitor closed the tab, calendar hiccup).
  To test the webhook locally: `stripe listen --forward-to localhost:3000/api/stripe/webhook` (Stripe CLI) and use the `whsec_…` it prints.
- Apple Pay / Google Pay: Stripe → Settings → Payment methods → Payment method domains → add `mirkovic.dev`.
- Payments are tagged `metadata.source = mirkovic.dev-call`, so the webhook ignores QuantFrame payments on the same account.

## Day to day

- New booking: the client gets our confirmation email (their time zone, Meet link, invite.ics); you get a
  "New booking" email at contact@mirkovic.dev with a link to the payment in Stripe. Both are sent with
  EMAIL_USER / EMAIL_PASS. The event appears in your calendar (Google itself sends no invite).
- Blocking time off: any "Busy" event in your calendar hides those times. All-day events are "Free" by
  default in Google Calendar, so set holidays to **Busy** (or use an Out of office event).
- Cancelling: **fully refund the payment in Stripe**. The webhook then cancels the booking, removes the calendar
  event, opens the time again and emails the client and you. A partial refund only returns money.
- Disputes (chargebacks): an upcoming call is cancelled the same way; for a past call you get an email with
  the evidence to submit in Stripe. Refunds after the call (goodwill) change nothing else.
