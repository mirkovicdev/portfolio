-- When the "new booking" email to the host was sent; claimed atomically so it goes out exactly once.
-- Applied via Supabase MCP on 2026-09-22 (project swjfyiwnnmimsuwdxhfq).
alter table public.call_bookings add column owner_notified_at timestamptz;
