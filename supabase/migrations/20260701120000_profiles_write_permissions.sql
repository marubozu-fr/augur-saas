-- Allow authenticated users to persist their own profile changes.
-- The authenticated role previously had only SELECT on public.profiles
-- (see 20260626120000_grant_table_permissions.sql), so setDefaultInstrument's
-- write failed with "permission denied" and default_instrument stayed NULL.
-- upsert also needs INSERT for the row-missing case, gated by RLS to the
-- user's own row.

grant insert, update on public.profiles to authenticated;

-- Users can insert their own profile row (needed for upsert when the
-- handle_new_user trigger has not created one).
create policy "Users can insert own profile"
  on public.profiles
  for insert
  with check (auth.uid() = id);

-- Add an explicit WITH CHECK to the existing update policy so the updated
-- row is still constrained to the user's own id.
drop policy "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);
