-- Add riding_style column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS riding_style text;
