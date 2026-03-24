-- Add visited_cities array to profiles for rider travel badges
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS visited_cities text[] DEFAULT '{}';
