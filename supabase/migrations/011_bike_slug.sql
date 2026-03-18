-- Add slug column to bikes table
ALTER TABLE bikes ADD COLUMN IF NOT EXISTS slug TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS bikes_slug_idx ON bikes(slug);

-- Backfill existing bikes: kebab-case title + first 8 chars of UUID
UPDATE bikes SET slug =
  regexp_replace(
    regexp_replace(lower(title), '[^a-z0-9]+', '-', 'g'),
    '^-+|-+$', '', 'g'
  ) || '-' || left(id::text, 8)
WHERE slug IS NULL;
