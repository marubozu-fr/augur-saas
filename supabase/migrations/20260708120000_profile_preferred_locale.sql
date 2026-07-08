-- Add preferred display-language override to profiles.
-- NULL means auto-detect (cookie / Accept-Language) — see src/i18n/request.ts.
-- Existing "Users can update own profile" RLS policy and grants already
-- cover reads and writes; no new policies are needed.

alter table public.profiles
  add column preferred_locale text default null
  check (preferred_locale in ('en', 'fr'));
