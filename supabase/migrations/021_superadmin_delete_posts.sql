-- Allow superadmin to delete any community post
DROP POLICY IF EXISTS "posts_delete" ON community_posts;

CREATE POLICY "posts_delete" ON community_posts FOR DELETE
  USING (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'superadmin')
  );
