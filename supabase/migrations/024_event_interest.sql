-- Track user interest in events
CREATE TABLE event_interest (
  event_slug text NOT NULL,
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (event_slug, user_id)
);

ALTER TABLE event_interest ENABLE ROW LEVEL SECURITY;

CREATE POLICY "interest_select" ON event_interest
  FOR SELECT USING (true);

CREATE POLICY "interest_insert" ON event_interest
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "interest_delete" ON event_interest
  FOR DELETE USING (auth.uid() = user_id);
