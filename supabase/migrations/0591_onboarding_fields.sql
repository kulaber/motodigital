-- Onboarding fields on profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS onboarding_completed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS onboarding_step      int     NOT NULL DEFAULT 0;

-- Riding styles (array) for rider onboarding
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS riding_styles text[] DEFAULT '{}';

-- Existing users should not be sent through onboarding
UPDATE profiles
SET onboarding_completed = true
WHERE created_at < now() - interval '10 minutes';
