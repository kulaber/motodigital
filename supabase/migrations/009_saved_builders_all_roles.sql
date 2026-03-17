-- Create saved_builders if it doesn't exist (idempotent)
-- user_id references auth.users so all roles (rider, custom-werkstatt, superadmin) can save

CREATE TABLE IF NOT EXISTS saved_builders (
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  builder_id  uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, builder_id)
);

ALTER TABLE saved_builders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "saved_builders: owner" ON saved_builders;

CREATE POLICY "saved_builders: owner" ON saved_builders FOR ALL
  USING (auth.uid() = user_id);
