-- Ride posts: add ride-specific columns to community_posts + participants table

-- Add ride columns to community_posts
ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS post_type text DEFAULT 'post' CHECK (post_type IN ('post', 'ride'));
ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS ride_visibility text CHECK (ride_visibility IN ('public', 'friends'));
ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS ride_stops jsonb;
ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS ride_start_at timestamptz;
ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS ride_max_participants integer;

-- Ride participants
CREATE TABLE IF NOT EXISTS ride_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_post_id uuid REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at timestamptz DEFAULT now(),
  UNIQUE(ride_post_id, user_id)
);

ALTER TABLE ride_participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can join rides" ON ride_participants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Anyone can view participants" ON ride_participants FOR SELECT USING (true);
CREATE POLICY "Users can leave rides" ON ride_participants FOR DELETE USING (auth.uid() = user_id);
