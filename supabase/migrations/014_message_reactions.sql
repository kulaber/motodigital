-- Message reactions: one row per (message, user, emoji)
CREATE TABLE IF NOT EXISTS message_reactions (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id  uuid        NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  user_id     uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  emoji       text        NOT NULL CHECK (emoji IN ('👍','❤️','😂','😮','😢')),
  created_at  timestamptz DEFAULT now(),
  UNIQUE (message_id, user_id, emoji)
);

ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;

-- Users can see reactions on messages in their conversations
CREATE POLICY "reaction_select" ON message_reactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM messages m
      JOIN conversations c ON c.id = m.conversation_id
      WHERE m.id = message_reactions.message_id
        AND (c.seller_id = auth.uid() OR c.buyer_id = auth.uid())
    )
  );

-- Users can react to messages in their conversations
CREATE POLICY "reaction_insert" ON message_reactions
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM messages m
      JOIN conversations c ON c.id = m.conversation_id
      WHERE m.id = message_reactions.message_id
        AND (c.seller_id = auth.uid() OR c.buyer_id = auth.uid())
    )
  );

-- Users can only remove their own reactions
CREATE POLICY "reaction_delete" ON message_reactions
  FOR DELETE USING (auth.uid() = user_id);
