-- Contact form submissions
CREATE TABLE contact_submissions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  subject    TEXT NOT NULL,
  message    TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS: only service role can read, anyone can insert
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone_can_insert" ON contact_submissions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "service_role_select" ON contact_submissions
  FOR SELECT USING (auth.role() = 'service_role');
