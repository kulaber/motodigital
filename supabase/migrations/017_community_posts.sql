-- Community posts feed for Rider page

CREATE TABLE community_posts (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  body        text,
  media_urls  text[] DEFAULT '{}',
  created_at  timestamptz DEFAULT now()
);

CREATE TABLE community_post_likes (
  post_id  uuid NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id  uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, user_id)
);

-- RLS
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "posts_select"  ON community_posts FOR SELECT USING (true);
CREATE POLICY "posts_insert"  ON community_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "posts_delete"  ON community_posts FOR DELETE  USING (auth.uid() = user_id);

ALTER TABLE community_post_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "likes_select" ON community_post_likes FOR SELECT USING (true);
CREATE POLICY "likes_insert" ON community_post_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "likes_delete" ON community_post_likes FOR DELETE  USING (auth.uid() = user_id);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE community_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE community_post_likes;
ALTER TABLE community_posts      REPLICA IDENTITY FULL;
ALTER TABLE community_post_likes REPLICA IDENTITY FULL;

-- Storage bucket for community media
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'community-media',
  'community-media',
  true,
  20971520,
  ARRAY['image/jpeg','image/jpg','image/png','image/gif','image/webp','video/mp4','video/quicktime','video/webm']
) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "community_media_insert" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'community-media');
CREATE POLICY "community_media_select" ON storage.objects
  FOR SELECT TO public USING (bucket_id = 'community-media');
CREATE POLICY "community_media_delete" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'community-media');
