-- Backfill slug for profiles that were created before the slug column
-- existed (added in 20260422121500). Without a slug the sitemap filters
-- the profile out and the /custom-werkstatt/[slug] route can't resolve
-- it, so these accounts are effectively invisible to Google.
--
-- Generation rules per profile:
--   1. Lowercase full_name, strip diacritics, replace non-alphanumerics
--      with hyphens, collapse and trim.
--   2. If empty (e.g. full_name itself was null) fall back to a short
--      uuid-based slug.
--   3. If the generated slug already exists, append -2, -3, ... until
--      a free slot is found.

DO $$
DECLARE
  rec RECORD;
  base_slug TEXT;
  candidate TEXT;
  attempt INT;
BEGIN
  FOR rec IN
    SELECT id, full_name
      FROM profiles
     WHERE slug IS NULL
       AND role IN ('custom-werkstatt', 'rider')
  LOOP
    base_slug := regexp_replace(
      regexp_replace(
        translate(
          lower(coalesce(rec.full_name, '')),
          'äöüßéèêàâîôûñç',
          'aousseaeaiouna'
        ),
        '[^a-z0-9]+', '-', 'g'
      ),
      '^-+|-+$', '', 'g'
    );

    IF base_slug = '' OR base_slug IS NULL THEN
      base_slug := 'profile-' || substr(rec.id::text, 1, 8);
    END IF;

    candidate := base_slug;
    attempt := 1;
    WHILE EXISTS (SELECT 1 FROM profiles WHERE slug = candidate) LOOP
      attempt := attempt + 1;
      candidate := base_slug || '-' || attempt::text;
    END LOOP;

    UPDATE profiles SET slug = candidate WHERE id = rec.id;
  END LOOP;
END $$;
