-- Mark seeded fake-rider profiles so automation (simulate-fake-activity) can identify them.
-- Backfill flags existing bots by their placeholder email pattern.

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS is_bot boolean NOT NULL DEFAULT false;

UPDATE profiles p
SET is_bot = true
FROM auth.users u
WHERE p.id = u.id
  AND u.email LIKE 'bot-%@motodigital.local'
  AND p.is_bot = false;

CREATE INDEX IF NOT EXISTS profiles_is_bot_idx
  ON profiles (is_bot)
  WHERE is_bot = true;
