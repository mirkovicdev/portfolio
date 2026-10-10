-- Free calls through personal one-time links (mirkovic.dev/meet/<token>), created on /admin.
-- A link counts as used while it has a held or booked call; cancelling that call makes it usable again.
-- Applied via Supabase MCP on 2026-10-10 (project swjfyiwnnmimsuwdxhfq).
create table public.call_invites (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  token text not null unique check (length(token) >= 22), -- random part of the link (128 bits)
  label text, -- who the link is for; only shown on /admin
  revoked_at timestamptz
);

-- Server-only, like the other booking tables: RLS on, no policies, no grants for the public keys
alter table public.call_invites enable row level security;
revoke all on table public.call_invites from anon, authenticated;

comment on table public.call_invites is 'Personal one-time links for free calls on mirkovic.dev/meet. Server-only (service role).';

alter table public.call_bookings
  add column invite_id uuid references public.call_invites (id),
  alter column background drop not null; -- free calls skip the "Where are you now?" question

-- $0 only through a personal link; paid calls keep a positive amount
alter table public.call_bookings drop constraint call_bookings_amount_cents_check;
alter table public.call_bookings add constraint call_bookings_amount_cents_check
  check (amount_cents > 0 or (amount_cents = 0 and invite_id is not null));

-- One held or booked call per link (also stops two tabs booking with the same link at once)
create unique index call_bookings_one_per_invite on public.call_bookings (invite_id)
  where status in ('pending', 'confirmed');
