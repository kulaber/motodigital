-- Allow superadmins to manage builder_media for any workshop
-- (needed for admin edit pages: logo, cover, gallery)

CREATE POLICY "builder_media: superadmin insert"
  ON builder_media FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'superadmin')
  );

CREATE POLICY "builder_media: superadmin update"
  ON builder_media FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'superadmin')
  );

CREATE POLICY "builder_media: superadmin delete"
  ON builder_media FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'superadmin')
  );

-- Allow superadmins to upload/update/delete files in builder-media storage bucket

CREATE POLICY "builder_media_storage: superadmin insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'builder-media'
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'superadmin')
  );

CREATE POLICY "builder_media_storage: superadmin update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'builder-media'
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'superadmin')
  )
  WITH CHECK (
    bucket_id = 'builder-media'
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'superadmin')
  );

CREATE POLICY "builder_media_storage: superadmin delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'builder-media'
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'superadmin')
  );
