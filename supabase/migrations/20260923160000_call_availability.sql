-- Days Antonije opens for calls (admin page). No row = closed. Times are wall-clock in the host time zone (Europe/Oslo).
-- Applied via Supabase MCP on 2026-09-23 (project swjfyiwnnmimsuwdxhfq).
create table public.call_availability (
  day date primary key,
  windows jsonb not null check (jsonb_typeof(windows) = 'array' and jsonb_array_length(windows) > 0),
  updated_at timestamptz not null default now()
);

-- Server-only, like call_bookings: RLS on, no policies, no grants for the public keys
alter table public.call_availability enable row level security;
revoke all on table public.call_availability from anon, authenticated;

comment on table public.call_availability is 'Open booking hours per day for mirkovic.dev calls, e.g. [["17:00","20:00"]] in Europe/Oslo. Server-only (service role).';
