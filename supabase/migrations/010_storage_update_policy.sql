-- ============================================================
-- Allow owners to update (overwrite) their own files in builder-media
-- Required for upsert: true on avatar uploads
-- ============================================================

CREATE POLICY "builder_media_storage_update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'builder-media'
    AND auth.uid()::text = (storage.foldername(name))[1]
  )
  WITH CHECK (
    bucket_id = 'builder-media'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
