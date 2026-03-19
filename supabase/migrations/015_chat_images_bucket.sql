-- Storage bucket for chat images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'chat-images',
  'chat-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Authenticated users can upload
CREATE POLICY "chat_images_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'chat-images');

-- Everyone can read (public bucket)
CREATE POLICY "chat_images_select" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'chat-images');

-- Authenticated users can delete in this bucket
CREATE POLICY "chat_images_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'chat-images');
