-- Client confirmation email: exactly-once claim, and the visitor's clock style so the email matches the page.
-- Applied via Supabase MCP on 2026-09-23 (project swjfyiwnnmimsuwdxhfq).
alter table public.call_bookings
  add column client_notified_at timestamptz,
  add column visitor_hour12 boolean;
