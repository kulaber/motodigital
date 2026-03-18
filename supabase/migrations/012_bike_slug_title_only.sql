-- Update slug format to title-only (no UUID suffix)
UPDATE bikes
SET slug = regexp_replace(
  regexp_replace(
    lower(title),
    '[^a-z0-9]+', '-', 'g'
  ),
  '^-+|-+$', '', 'g'
);
