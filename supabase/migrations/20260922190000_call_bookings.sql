-- 1:1 paid call bookings from mirkovic.dev. Server-only: accessed with the service role key.
-- Applied via Supabase MCP on 2026-09-22 (project swjfyiwnnmimsuwdxhfq).
create table public.call_bookings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  start_at timestamptz not null,
  end_at timestamptz not null,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'expired', 'cancelled')),
  hold_expires_at timestamptz,
  topic text not null,
  tier text not null,
  background text not null,
  message text,
  name text not null,
  email text not null,
  visitor_time_zone text,
  amount_cents integer not null check (amount_cents > 0),
  currency text not null,
  stripe_payment_intent_id text unique,
  google_event_id text,
  meet_url text,
  confirmed_at timestamptz,
  constraint call_bookings_valid_range check (end_at > start_at),
  -- Two active bookings (held or paid) can never overlap in time
  constraint call_bookings_no_overlap exclude using gist (tstzrange(start_at, end_at, '[)') with &&)
    where (status in ('pending', 'confirmed'))
);

create index call_bookings_start_at_idx on public.call_bookings (start_at);

-- RLS on with no policies + no grants: the public anon/authenticated keys cannot touch this table
alter table public.call_bookings enable row level security;
revoke all on table public.call_bookings from anon, authenticated;

comment on table public.call_bookings is '1:1 paid call bookings from mirkovic.dev. Server-only (service role). Overlaps between pending/confirmed rows are blocked by call_bookings_no_overlap.';
