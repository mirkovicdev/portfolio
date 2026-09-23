-- 1-hour reminder email to the client: exactly-once claim.
-- Applied via Supabase MCP on 2026-09-23 (project swjfyiwnnmimsuwdxhfq).
alter table public.call_bookings add column reminder_sent_at timestamptz;
