-- Add event_slug to community_posts for linking posts to events
ALTER TABLE community_posts ADD COLUMN event_slug text;
