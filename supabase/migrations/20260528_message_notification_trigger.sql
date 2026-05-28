-- Notification trigger for new messages
-- In-app notification on every message INSERT (recipient = the other conversation participant)

create or replace function notify_on_message()
returns trigger language plpgsql security definer as $$
declare
  v_buyer_id  uuid;
  v_seller_id uuid;
  v_recipient uuid;
begin
  select buyer_id, seller_id
    into v_buyer_id, v_seller_id
    from conversations
   where id = NEW.conversation_id;

  if NEW.sender_id = v_buyer_id then
    v_recipient := v_seller_id;
  else
    v_recipient := v_buyer_id;
  end if;

  perform insert_notification(v_recipient, NEW.sender_id, 'message', 'message', NEW.id);
  return NEW;
end;
$$;

create trigger on_message_created
  after insert on messages
  for each row execute function notify_on_message();
