-- Grant table permissions for the authenticated role.
-- Production Supabase Cloud was created with "Automatically expose new tables"
-- disabled, so these tables have no GRANT for the authenticated role. Without
-- explicit GRANTs the PostgREST API cannot read the tables even when RLS
-- policies allow it, causing "permission denied for table" errors.
-- RLS policies still apply on top of these grants.

grant select on public.subscriptions to authenticated;
grant select on public.profiles to authenticated;

-- The anon role should NOT have access to these tables.
