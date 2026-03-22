-- Allow superadmin to delete any bike listing
DROP POLICY IF EXISTS "bikes: owner delete" ON bikes;

CREATE POLICY "bikes: owner or superadmin delete" ON bikes FOR DELETE
  USING (
    auth.uid() = seller_id
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'superadmin')
  );
