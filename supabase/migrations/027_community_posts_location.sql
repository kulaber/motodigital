-- Add location columns to community_posts for "In der Nähe" feature
ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS latitude double precision;
ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS longitude double precision;
ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS location_name text;
