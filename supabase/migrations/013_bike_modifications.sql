ALTER TABLE bikes ADD COLUMN IF NOT EXISTS modifications text[] DEFAULT '{}';
