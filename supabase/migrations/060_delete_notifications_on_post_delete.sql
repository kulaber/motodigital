-- ============================================================
-- Cleanup notifications when a community post is deleted
-- ============================================================

create or replace function cleanup_notifications_on_post_delete()
returns trigger language plpgsql security definer as $$
begin
  delete from notifications
  where entity_type = 'post' and entity_id = OLD.id;
  return OLD;
end;
$$;

create trigger on_post_deleted_cleanup_notifications
  after delete on community_posts
  for each row execute function cleanup_notifications_on_post_delete();
