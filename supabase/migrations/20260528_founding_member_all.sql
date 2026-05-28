-- All existing free workshops become Founding Members
UPDATE workshops
SET subscription_tier = 'founding_partner'
WHERE subscription_tier = 'free';

-- New workshops default to founding_partner until we revert this
ALTER TABLE workshops
ALTER COLUMN subscription_tier SET DEFAULT 'founding_partner';
