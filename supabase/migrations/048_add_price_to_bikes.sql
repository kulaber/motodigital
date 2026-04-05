-- Migration: add listing_type, price_amount, price_on_request to bikes
ALTER TABLE bikes
  ADD COLUMN IF NOT EXISTS listing_type text NOT NULL DEFAULT 'showcase'
    CHECK (listing_type IN ('showcase', 'for_sale')),
  ADD COLUMN IF NOT EXISTS price_amount numeric(10,2),
  ADD COLUMN IF NOT EXISTS price_on_request boolean NOT NULL DEFAULT false;

-- Index for filter performance
CREATE INDEX IF NOT EXISTS idx_bikes_listing_type ON bikes(listing_type);
