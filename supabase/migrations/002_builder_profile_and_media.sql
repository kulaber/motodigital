-- ============================================================
-- MotoDigital — Builder Profile & Media
-- ============================================================

-- ── Extend profiles with builder-specific fields ─────────────
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS website_url  text,
  ADD COLUMN IF NOT EXISTS city         text,
  ADD COLUMN IF NOT EXISTS specialty    text,
  ADD COLUMN IF NOT EXISTS since_year   smallint,
  ADD COLUMN IF NOT EXISTS tags         text[];

-- ── builder_media ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS builder_media (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  builder_id  uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  url         text NOT NULL,
  type        text NOT NULL CHECK (type IN ('image', 'video')),
  title       text,
  position    integer NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS builder_media_builder_id_idx ON builder_media (builder_id);

-- ── Row Level Security ────────────────────────────────────────
ALTER TABLE builder_media ENABLE ROW LEVEL SECURITY;

-- Anyone can view media
CREATE POLICY "builder_media_select"
  ON builder_media FOR SELECT
  USING (true);

-- Builder can insert own media
CREATE POLICY "builder_media_insert"
  ON builder_media FOR INSERT
  WITH CHECK (auth.uid() = builder_id);

-- Builder can update own media
CREATE POLICY "builder_media_update"
  ON builder_media FOR UPDATE
  USING (auth.uid() = builder_id);

-- Builder can delete own media
CREATE POLICY "builder_media_delete"
  ON builder_media FOR DELETE
  USING (auth.uid() = builder_id);

-- ── Storage bucket: builder-media ────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'builder-media',
  'builder-media',
  true,
  52428800,  -- 50 MB
  ARRAY['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/quicktime','video/webm']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "builder_media_storage_select"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'builder-media');

CREATE POLICY "builder_media_storage_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'builder-media'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "builder_media_storage_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'builder-media'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
