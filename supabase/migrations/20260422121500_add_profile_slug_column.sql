-- Schema drift: profiles.slug exists on Prod (added via dashboard), but is
-- missing on fresh/Dev DBs. Idempotent ADD + backfill from username so Dev
-- catches up without affecting Prod.

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS slug text;

UPDATE profiles
SET slug = username
WHERE slug IS NULL
  AND username IS NOT NULL;

CREATE INDEX IF NOT EXISTS profiles_slug_idx ON profiles (slug);
