-- ── saved_builders ───────────────────────────────────────────
-- Allows riders (and builders) to bookmark Custom-Werkstatt profiles

CREATE TABLE IF NOT EXISTS saved_builders (
  user_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  builder_id  uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, builder_id)
);

ALTER TABLE saved_builders ENABLE ROW LEVEL SECURITY;

-- Owner: full access
CREATE POLICY "saved_builders: owner" ON saved_builders FOR ALL
  USING (auth.uid() = user_id);
