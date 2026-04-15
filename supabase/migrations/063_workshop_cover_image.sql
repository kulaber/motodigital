-- Add cover_image_url column to workshops table
ALTER TABLE workshops ADD COLUMN IF NOT EXISTS cover_image_url TEXT;
