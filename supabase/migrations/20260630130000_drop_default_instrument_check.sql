-- Drop the CHECK constraint that restricted default_instrument to ('NQ', 'ES').
-- Instruments are now sourced from the Augur API at runtime; there is no
-- frontend whitelist to keep in sync with the database.

alter table public.profiles
  drop constraint if exists profiles_default_instrument_check;
