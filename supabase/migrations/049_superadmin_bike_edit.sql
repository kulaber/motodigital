-- Allow superadmins to update bikes owned by other users
DROP POLICY IF EXISTS "bikes: owner update" ON bikes;
CREATE POLICY "bikes: owner or superadmin update" ON bikes FOR UPDATE
  USING (
    auth.uid() = seller_id
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'superadmin')
  );

-- Allow superadmins to write bike_images for any bike
DROP POLICY IF EXISTS "bike_images: owner write" ON bike_images;
CREATE POLICY "bike_images: owner or superadmin write" ON bike_images FOR ALL
  USING (
    auth.uid() = (SELECT seller_id FROM bikes WHERE id = bike_id)
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'superadmin')
  );
