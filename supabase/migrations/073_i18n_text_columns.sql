-- ============================================================
-- 073: Add JSONB i18n columns for user-facing text content
--
-- Approach: add `<field>_i18n` JSONB columns alongside existing text
-- columns. Shape: { "de": "...", "en": "..." } with fallback.
--
-- Legacy text columns stay so migration is zero-downtime:
--   1. Deploy this migration (adds columns + backfills from legacy)
--   2. Deploy code that reads via localizedText() helper
--   3. Admin UI writes both legacy + _i18n for transition
--   4. (later) drop legacy columns once all readers are migrated
-- ============================================================

-- ── profiles (Custom Werkstatt) ────────────────────────────────
-- Note: bio_long was added manually in the Prod DB without a migration
-- file (schema drift). Add it here idempotently so fresh DBs stay in sync.
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS bio_long       text,
  ADD COLUMN IF NOT EXISTS bio_i18n       JSONB,
  ADD COLUMN IF NOT EXISTS bio_long_i18n  JSONB,
  ADD COLUMN IF NOT EXISTS specialty_i18n JSONB;

-- Backfill existing DE content into the JSONB column
UPDATE profiles
SET bio_i18n = jsonb_build_object('de', bio)
WHERE bio IS NOT NULL AND bio_i18n IS NULL;

UPDATE profiles
SET bio_long_i18n = jsonb_build_object('de', bio_long)
WHERE bio_long IS NOT NULL AND bio_long_i18n IS NULL;

UPDATE profiles
SET specialty_i18n = jsonb_build_object('de', specialty)
WHERE specialty IS NOT NULL AND specialty_i18n IS NULL;

-- ── events ─────────────────────────────────────────────────────
ALTER TABLE events
  ADD COLUMN IF NOT EXISTS name_i18n        JSONB,
  ADD COLUMN IF NOT EXISTS description_i18n JSONB,
  ADD COLUMN IF NOT EXISTS location_i18n    JSONB;

UPDATE events
SET name_i18n = jsonb_build_object('de', name)
WHERE name IS NOT NULL AND name_i18n IS NULL;

UPDATE events
SET description_i18n = jsonb_build_object('de', description)
WHERE description IS NOT NULL AND description_i18n IS NULL;

UPDATE events
SET location_i18n = jsonb_build_object('de', location)
WHERE location IS NOT NULL AND location_i18n IS NULL;

-- ── bikes (customer-facing builds) ─────────────────────────────
ALTER TABLE bikes
  ADD COLUMN IF NOT EXISTS title_i18n       JSONB,
  ADD COLUMN IF NOT EXISTS description_i18n JSONB;

UPDATE bikes
SET title_i18n = jsonb_build_object('de', title)
WHERE title IS NOT NULL AND title_i18n IS NULL;

UPDATE bikes
SET description_i18n = jsonb_build_object('de', description)
WHERE description IS NOT NULL AND description_i18n IS NULL;

-- ── base_bike_brands (brand descriptions) ──────────────────────
-- base_bike_brands.description holds brand copy shown to users.
ALTER TABLE base_bike_brands
  ADD COLUMN IF NOT EXISTS description_i18n JSONB;

UPDATE base_bike_brands
SET description_i18n = jsonb_build_object('de', description)
WHERE description IS NOT NULL AND description_i18n IS NULL;

-- ── Indexes for GIN lookup on i18n columns ─────────────────────
-- Enables efficient queries like `WHERE bio_i18n ? 'en'` if ever needed.
CREATE INDEX IF NOT EXISTS idx_profiles_bio_i18n       ON profiles       USING gin (bio_i18n);
CREATE INDEX IF NOT EXISTS idx_profiles_bio_long_i18n  ON profiles       USING gin (bio_long_i18n);
CREATE INDEX IF NOT EXISTS idx_events_name_i18n        ON events         USING gin (name_i18n);
CREATE INDEX IF NOT EXISTS idx_events_description_i18n ON events         USING gin (description_i18n);
CREATE INDEX IF NOT EXISTS idx_bikes_title_i18n        ON bikes          USING gin (title_i18n);
CREATE INDEX IF NOT EXISTS idx_bikes_description_i18n  ON bikes          USING gin (description_i18n);

-- ============================================================
-- NOTE: legacy text columns are intentionally kept. They're still
-- written (as DE mirror) by admin forms during the transition.
-- Drop them in a later migration once all reads use _i18n.
-- ============================================================
