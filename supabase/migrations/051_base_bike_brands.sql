-- ============================================================
-- MotoDigital — Base Bike Brands + Restructure base_bikes
-- Normalisierte Marken-Tabelle + brand_id FK in base_bikes
-- ============================================================

-- 1. Neue Tabelle: base_bike_brands
CREATE TABLE base_bike_brands (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text UNIQUE NOT NULL,
  slug        text UNIQUE NOT NULL,
  country     text,
  founded     int,
  description text,
  logo_url    text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX base_bike_brands_slug_idx ON base_bike_brands (slug);

-- RLS: öffentlich lesbar, Schreiben nur service_role
ALTER TABLE base_bike_brands ENABLE ROW LEVEL SECURITY;
CREATE POLICY "base_bike_brands: public read" ON base_bike_brands FOR SELECT USING (true);

-- 2. base_bikes um neue Spalten erweitern
ALTER TABLE base_bikes
  ADD COLUMN brand_id      uuid REFERENCES base_bike_brands(id) ON DELETE CASCADE,
  ADD COLUMN slug          text,
  ADD COLUMN engine_cc     int,
  ADD COLUMN engine_type   text,
  ADD COLUMN custom_styles text[];

-- 3. Bestehende Marken aus make-Spalte migrieren
INSERT INTO base_bike_brands (name, slug, country)
SELECT DISTINCT
  make,
  lower(replace(replace(replace(replace(make, ' ', '-'), 'ä', 'ae'), 'ö', 'oe'), 'ü', 'ue')),
  CASE
    WHEN make = 'Honda'            THEN 'Japan'
    WHEN make = 'Yamaha'           THEN 'Japan'
    WHEN make = 'Kawasaki'         THEN 'Japan'
    WHEN make = 'Suzuki'           THEN 'Japan'
    WHEN make = 'BMW'              THEN 'Deutschland'
    WHEN make = 'Triumph'          THEN 'Großbritannien'
    WHEN make = 'Harley-Davidson'  THEN 'USA'
    WHEN make = 'Ducati'           THEN 'Italien'
    WHEN make = 'Moto Guzzi'      THEN 'Italien'
  END
FROM base_bikes
ON CONFLICT (name) DO NOTHING;

-- 4. Bestehende Zeilen migrieren: brand_id, slug, engine_cc, custom_styles
UPDATE base_bikes
SET
  brand_id      = (SELECT id FROM base_bike_brands WHERE name = base_bikes.make),
  slug          = lower(replace(replace(replace(replace(model, ' ', '-'), '/', '-'), 'ä', 'ae'), 'ö', 'oe')),
  engine_cc     = cc,
  custom_styles = typical_styles;

-- 5. Indizes
CREATE INDEX base_bikes_brand_id_idx    ON base_bikes (brand_id);
CREATE INDEX base_bikes_slug_idx        ON base_bikes (slug);
CREATE INDEX base_bikes_engine_type_idx ON base_bikes (engine_type);

-- 6. Unique constraint auf (brand_id, slug)
ALTER TABLE base_bikes ADD CONSTRAINT base_bikes_brand_slug_unique UNIQUE (brand_id, slug);
