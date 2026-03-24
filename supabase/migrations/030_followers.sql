-- ── followers ────────────────────────────────────────────────
-- Allows riders to follow other riders

CREATE TABLE IF NOT EXISTS followers (
  follower_id   uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  following_id  uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at    timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (follower_id, following_id),
  CONSTRAINT no_self_follow CHECK (follower_id <> following_id)
);

ALTER TABLE followers ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can see follower counts
CREATE POLICY "followers: read" ON followers FOR SELECT
  USING (true);

-- Users can follow/unfollow themselves only
CREATE POLICY "followers: insert own" ON followers FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "followers: delete own" ON followers FOR DELETE
  USING (auth.uid() = follower_id);
