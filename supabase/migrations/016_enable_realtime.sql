-- Enable Realtime for chat tables
-- Without this, postgres_changes subscriptions receive no events

ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE message_reactions;

-- REPLICA IDENTITY FULL required for filtered subscriptions & DELETE events
ALTER TABLE messages          REPLICA IDENTITY FULL;
ALTER TABLE conversations     REPLICA IDENTITY FULL;
ALTER TABLE message_reactions REPLICA IDENTITY FULL;
