-- Fix: featured_by_user_id FK blocks profile deletion (no ON DELETE action)
-- Change to ON DELETE SET NULL so featured bikes remain but lose the reference
ALTER TABLE bikes
  DROP CONSTRAINT IF EXISTS bikes_featured_by_user_id_fkey;

ALTER TABLE bikes
  ADD CONSTRAINT bikes_featured_by_user_id_fkey
    FOREIGN KEY (featured_by_user_id)
    REFERENCES profiles(id)
    ON DELETE SET NULL;
