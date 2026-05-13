-- Throttle DM inserts to 30 messages per minute per sender_id.
-- Client-side sends are unconditionally rejected once the threshold is hit,
-- giving Supabase RLS a hard ceiling against DM-spam without relying on
-- application-layer enforcement.

CREATE OR REPLACE FUNCTION enforce_message_rate_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recent_count int;
BEGIN
  SELECT COUNT(*)
    INTO recent_count
  FROM messages
  WHERE sender_id = NEW.sender_id
    AND created_at > (now() - interval '1 minute');

  IF recent_count >= 30 THEN
    RAISE EXCEPTION 'rate_limit_exceeded'
      USING ERRCODE = 'P0001',
            HINT = 'Too many messages in a short period. Please wait a moment.';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_message_rate_limit_trigger ON messages;
CREATE TRIGGER enforce_message_rate_limit_trigger
  BEFORE INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION enforce_message_rate_limit();
