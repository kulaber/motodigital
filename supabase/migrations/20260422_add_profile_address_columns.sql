-- Add address/lat/lng columns to profiles.
-- Schema drift: these were added manually on Prod via dashboard without a
-- migration file. Idempotent ADD ... IF NOT EXISTS so Prod stays unchanged
-- and fresh DBs (Dev/Staging) catch up.

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS lat     double precision,
  ADD COLUMN IF NOT EXISTS lng     double precision;
