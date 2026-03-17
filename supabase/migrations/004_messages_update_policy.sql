-- Allow conversation participants to mark messages as read (update read_at)
CREATE POLICY "messages: participant update read_at" ON messages FOR UPDATE
  USING (auth.uid() IN (
    SELECT buyer_id  FROM conversations WHERE id = conversation_id
    UNION
    SELECT seller_id FROM conversations WHERE id = conversation_id
  ));
