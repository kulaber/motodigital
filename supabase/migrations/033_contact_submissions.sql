-- Contact form submissions
CREATE TABLE IF NOT EXISTS contact_submissions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  subject    TEXT NOT NULL,
  message    TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS: only service role can read, anyone can insert
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'contact_submissions' AND policyname = 'anyone_can_insert') THEN
    CREATE POLICY "anyone_can_insert" ON contact_submissions FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'contact_submissions' AND policyname = 'service_role_select') THEN
    CREATE POLICY "service_role_select" ON contact_submissions FOR SELECT USING (auth.role() = 'service_role');
  END IF;
END $$;
