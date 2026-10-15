-- Personal links can carry a price: 0 = free call, otherwise the visitor pays it with Stripe like a public booking.
-- Applied via Supabase MCP on 2026-10-15 (project swjfyiwnnmimsuwdxhfq).
alter table public.call_invites
  add column amount_cents integer not null default 0 check (amount_cents >= 0);
