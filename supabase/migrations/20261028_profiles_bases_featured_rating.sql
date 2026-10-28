-- Schema drift fix: bases, featured and rating exist on Prod (added via
-- dashboard without a migration) but are missing on Dev. The workshop
-- listing selects rating + featured, so Dev returned no workshops at all.
-- Idempotent: no-op on Prod, creates the columns on Dev.

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bases text[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS featured boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS rating real DEFAULT 5.0;
