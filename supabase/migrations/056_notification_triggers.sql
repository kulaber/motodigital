-- ============================================================
-- Notification Triggers
-- ============================================================

-- Helper: Notification inserten (keine Self-Notifications)
create or replace function insert_notification(
  p_recipient_id uuid,
  p_actor_id uuid,
  p_type text,
  p_entity_type text,
  p_entity_id uuid
) returns void language plpgsql security definer as $$
begin
  if p_recipient_id is null or p_recipient_id = p_actor_id then
    return;
  end if;

  insert into notifications (recipient_id, actor_id, type, entity_type, entity_id)
  values (p_recipient_id, p_actor_id, p_type, p_entity_type, p_entity_id);
end;
$$;

-- ============================================================
-- LIKES auf community_posts
-- ============================================================

create or replace function notify_on_post_like()
returns trigger language plpgsql security definer as $$
declare
  v_owner_id uuid;
begin
  select user_id into v_owner_id from community_posts where id = NEW.post_id;
  perform insert_notification(v_owner_id, NEW.user_id, 'like', 'post', NEW.post_id);
  return NEW;
end;
$$;

create trigger on_post_liked
  after insert on community_post_likes
  for each row execute function notify_on_post_like();

-- ============================================================
-- COMMENTS auf community_posts
-- ============================================================

create or replace function notify_on_comment()
returns trigger language plpgsql security definer as $$
declare
  v_owner_id uuid;
begin
  select user_id into v_owner_id from community_posts where id = NEW.post_id;
  perform insert_notification(v_owner_id, NEW.user_id, 'comment', 'post', NEW.post_id);
  return NEW;
end;
$$;

create trigger on_comment_created
  after insert on community_post_comments
  for each row execute function notify_on_comment();

-- ============================================================
-- FOLLOWS
-- ============================================================

create or replace function notify_on_follow()
returns trigger language plpgsql security definer as $$
begin
  perform insert_notification(NEW.following_id, NEW.follower_id, 'follow', null, null);
  return NEW;
end;
$$;

create trigger on_user_followed
  after insert on followers
  for each row execute function notify_on_follow();

-- ============================================================
-- PUBLISH CELEBRATION (Bike wird auf 'active' gesetzt)
-- community_posts hat kein status-Feld, daher nur bikes
-- ============================================================

create or replace function notify_on_bike_publish()
returns trigger language plpgsql security definer as $$
begin
  if NEW.status = 'active' and (OLD.status is null or OLD.status != 'active') then
    insert into notifications (recipient_id, actor_id, type, entity_type, entity_id)
    values (NEW.seller_id, NEW.seller_id, 'publish_celebration', 'bike', NEW.id);
  end if;
  return NEW;
end;
$$;

create trigger on_bike_published
  after update on bikes
  for each row execute function notify_on_bike_publish();
