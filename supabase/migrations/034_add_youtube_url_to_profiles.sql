-- Add youtube_url column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS youtube_url TEXT;
