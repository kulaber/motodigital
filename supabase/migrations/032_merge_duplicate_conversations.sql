-- Merge duplicate conversations: ensure one conversation per user pair (regardless of direction)
-- Step 1: Move messages from duplicate conversations to the "keeper" (older conversation)
-- Step 2: Delete duplicate conversations
-- Step 3: Drop old unique constraint, add symmetric unique index

DO $$
DECLARE
  rec RECORD;
BEGIN
  -- Find pairs that have conversations in BOTH directions
  FOR rec IN
    SELECT
      c1.id AS keep_id,
      c2.id AS drop_id
    FROM conversations c1
    JOIN conversations c2
      ON c1.seller_id = c2.buyer_id
     AND c1.buyer_id  = c2.seller_id
     AND c1.id < c2.id  -- deterministic: keep the older one
  LOOP
    -- Move messages from the duplicate to the keeper
    UPDATE messages SET conversation_id = rec.keep_id WHERE conversation_id = rec.drop_id;

    -- Move reactions (via messages already moved, reactions reference message_id so they follow)

    -- Update last_message_at on the keeper
    UPDATE conversations SET last_message_at = (
      SELECT MAX(created_at) FROM messages WHERE conversation_id = rec.keep_id
    ) WHERE id = rec.keep_id;

    -- Delete the duplicate conversation
    DELETE FROM conversations WHERE id = rec.drop_id;
  END LOOP;
END $$;

-- Also merge conversations with same (seller_id, buyer_id) but different bike_ids
-- (leftovers from before migration 019 unique constraint was added)
DO $$
DECLARE
  rec RECORD;
BEGIN
  FOR rec IN
    SELECT
      seller_id, buyer_id,
      MIN(id::text)::uuid AS keep_id
    FROM conversations
    GROUP BY seller_id, buyer_id
    HAVING COUNT(*) > 1
  LOOP
    -- Move messages from all duplicates to the keeper
    UPDATE messages SET conversation_id = rec.keep_id
    WHERE conversation_id IN (
      SELECT id FROM conversations
      WHERE seller_id = rec.seller_id AND buyer_id = rec.buyer_id AND id != rec.keep_id
    );

    -- Update last_message_at
    UPDATE conversations SET last_message_at = (
      SELECT MAX(created_at) FROM messages WHERE conversation_id = rec.keep_id
    ) WHERE id = rec.keep_id;

    -- Delete duplicates
    DELETE FROM conversations
    WHERE seller_id = rec.seller_id AND buyer_id = rec.buyer_id AND id != rec.keep_id;
  END LOOP;
END $$;

-- Drop old constraint and add symmetric unique index
-- This prevents both (A,B) and (B,A) from existing
ALTER TABLE conversations DROP CONSTRAINT IF EXISTS conversations_seller_buyer_unique;

CREATE UNIQUE INDEX IF NOT EXISTS conversations_pair_unique
  ON conversations (LEAST(seller_id, buyer_id), GREATEST(seller_id, buyer_id));
