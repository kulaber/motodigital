-- Build feed: step-by-step motorcycle build documentation

CREATE TABLE build_posts (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  bike_id     uuid NOT NULL REFERENCES bikes(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title       text NOT NULL,
  body        text,
  media_urls  text[] DEFAULT '{}',
  created_at  timestamptz DEFAULT now()
);

CREATE TABLE build_post_parts (
  id       uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id  uuid NOT NULL REFERENCES build_posts(id) ON DELETE CASCADE,
  name     text NOT NULL,
  price    numeric
);

-- Indexes
CREATE INDEX build_posts_bike_id_idx ON build_posts (bike_id, created_at DESC);
CREATE INDEX build_post_parts_post_id_idx ON build_post_parts (post_id);

-- RLS: build_posts
ALTER TABLE build_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "build_posts_select" ON build_posts FOR SELECT USING (true);
CREATE POLICY "build_posts_insert" ON build_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "build_posts_update" ON build_posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "build_posts_delete" ON build_posts FOR DELETE USING (auth.uid() = user_id);

-- RLS: build_post_parts
ALTER TABLE build_post_parts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "build_post_parts_select" ON build_post_parts FOR SELECT USING (true);
CREATE POLICY "build_post_parts_insert" ON build_post_parts
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM build_posts WHERE id = post_id AND user_id = auth.uid())
  );
CREATE POLICY "build_post_parts_delete" ON build_post_parts
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM build_posts WHERE id = post_id AND user_id = auth.uid())
  );

-- Storage bucket for build media
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'build-media',
  'build-media',
  true,
  52428800,
  ARRAY['image/jpeg','image/jpg','image/png','image/gif','image/webp','video/mp4','video/quicktime','video/webm']
) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "build_media_insert" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'build-media');
CREATE POLICY "build_media_select" ON storage.objects
  FOR SELECT TO public USING (bucket_id = 'build-media');
CREATE POLICY "build_media_delete" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'build-media');
