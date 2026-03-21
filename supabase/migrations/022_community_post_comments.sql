-- Community post comments
CREATE TABLE community_post_comments (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id    uuid NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body       text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE community_post_comments ENABLE ROW LEVEL SECURITY;

-- Anyone can read
CREATE POLICY "comments_select" ON community_post_comments
  FOR SELECT USING (true);

-- Authenticated users can insert their own
CREATE POLICY "comments_insert" ON community_post_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Owner can delete their own
CREATE POLICY "comments_delete" ON community_post_comments
  FOR DELETE USING (auth.uid() = user_id);
