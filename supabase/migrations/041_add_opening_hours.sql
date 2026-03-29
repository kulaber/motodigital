-- Add opening_hours JSONB column to profiles
-- Format: [{ "day": "Mo", "hours": "09:00 – 17:00" }, ...]
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS opening_hours jsonb DEFAULT NULL;

-- Allow owners to read/write their own opening_hours (covered by existing row-level policies)
-- No new RLS policy needed — existing owner policies on profiles already cover this column.
