-- Add video support to bike_images
ALTER TABLE bike_images
  ADD COLUMN IF NOT EXISTS media_type text NOT NULL DEFAULT 'image'
    CHECK (media_type IN ('image', 'video')),
  ADD COLUMN IF NOT EXISTS thumbnail_url text;

-- Index for ordering
CREATE INDEX IF NOT EXISTS bike_images_bike_id_position_idx
  ON bike_images (bike_id, position);
