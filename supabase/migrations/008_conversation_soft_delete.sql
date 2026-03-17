-- Soft-delete per user: array of user IDs who have "deleted" this conversation
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS deleted_for uuid[] NOT NULL DEFAULT '{}';
