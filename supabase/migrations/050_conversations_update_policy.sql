-- Allow participants to update their conversations (needed for last_message_at trigger + manual updates)
CREATE POLICY "conversations: participant update" ON conversations FOR UPDATE
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Make the trigger function SECURITY DEFINER so it bypasses RLS
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE conversations
  SET last_message_at = now()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$;
