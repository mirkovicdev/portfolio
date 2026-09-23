-- Automatic cancellation on refund / dispute: when and why, plus exactly-once claims for the cancellation emails.
-- Applied via Supabase MCP on 2026-09-23 (project swjfyiwnnmimsuwdxhfq).
alter table public.call_bookings
  add column cancelled_at timestamptz,
  add column cancel_reason text check (cancel_reason in ('refunded', 'disputed', 'taken_while_paying')),
  add column owner_cancel_notified_at timestamptz,
  add column client_cancel_notified_at timestamptz;
