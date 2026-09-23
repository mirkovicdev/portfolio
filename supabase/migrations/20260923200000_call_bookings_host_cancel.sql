-- Allow cancellations made from the admin page (no refund).
-- Applied via Supabase MCP on 2026-09-23 (project swjfyiwnnmimsuwdxhfq).
alter table public.call_bookings drop constraint call_bookings_cancel_reason_check;
alter table public.call_bookings add constraint call_bookings_cancel_reason_check
  check (cancel_reason in ('refunded', 'disputed', 'taken_while_paying', 'cancelled_by_host'));
