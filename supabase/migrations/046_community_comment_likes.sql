-- Community comment likes
CREATE TABLE community_comment_likes (
  comment_id uuid NOT NULL REFERENCES community_post_comments(id) ON DELETE CASCADE,
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (comment_id, user_id)
);

-- RLS
ALTER TABLE community_comment_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "comment_likes_select" ON community_comment_likes FOR SELECT USING (true);
CREATE POLICY "comment_likes_insert" ON community_comment_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "comment_likes_delete" ON community_comment_likes FOR DELETE USING (auth.uid() = user_id);
