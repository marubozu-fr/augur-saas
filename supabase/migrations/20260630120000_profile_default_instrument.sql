-- Add default instrument preference to profiles.
-- Only 'NQ' and 'ES' are currently supported by path-based routing.
-- NULL means no preference has been set yet — the selector screen is shown.
-- Existing "Users can update own profile" RLS policy and grants already
-- cover reads and writes; no new policies are needed.

alter table public.profiles
  add column default_instrument text
    check (default_instrument in ('NQ', 'ES'));
