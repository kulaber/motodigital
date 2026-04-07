-- Add bike_id to community_posts for linking a post to a bike from the user's garage
ALTER TABLE community_posts
  ADD COLUMN IF NOT EXISTS bike_id uuid REFERENCES bikes(id) ON DELETE SET NULL;

-- Index for efficient joins when querying posts with their linked bike
CREATE INDEX IF NOT EXISTS idx_community_posts_bike_id ON community_posts(bike_id);
