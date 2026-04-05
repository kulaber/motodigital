-- Entferne logo_url aus base_bike_brands (Datenschutz — keine Markenlogos)
ALTER TABLE base_bike_brands DROP COLUMN IF EXISTS logo_url;
