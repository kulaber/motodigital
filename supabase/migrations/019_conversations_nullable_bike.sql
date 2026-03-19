-- Allow conversations without a bike_id (e.g. builder profile contact)
-- and change unique constraint to (seller_id, buyer_id) so one thread per pair

ALTER TABLE conversations ALTER COLUMN bike_id DROP NOT NULL;

ALTER TABLE conversations DROP CONSTRAINT IF EXISTS conversations_bike_id_buyer_id_key;

ALTER TABLE conversations ADD CONSTRAINT conversations_seller_buyer_unique
  UNIQUE (seller_id, buyer_id);
