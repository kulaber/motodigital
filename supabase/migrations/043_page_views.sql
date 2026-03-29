-- Page view tracking for dashboard analytics
CREATE TABLE IF NOT EXISTS page_views (
  id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  path       text NOT NULL,
  section    text NOT NULL,           -- e.g. 'bikes', 'custom-werkstatt', 'explore', 'magazine', 'rider'
  referrer   text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index for fast dashboard queries (last 7 days, grouped by section/day)
CREATE INDEX idx_page_views_created_at ON page_views (created_at DESC);
CREATE INDEX idx_page_views_section    ON page_views (section, created_at DESC);

-- RLS: anyone can insert (anonymous tracking), only superadmin can read
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone_can_insert" ON page_views
  FOR INSERT WITH CHECK (true);

CREATE POLICY "superadmin_can_read" ON page_views
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'superadmin'
    )
  );
