-- ============================================================
-- Notification System: Tables + Preferences + RLS
-- ============================================================

-- Notifications Tabelle
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references profiles(id) on delete cascade,
  actor_id uuid references profiles(id) on delete set null,
  type text not null check (type in (
    'like', 'comment', 'tag', 'follow', 'message',
    'inquiry', 'publish_celebration'
  )),
  entity_type text check (entity_type in ('post', 'bike', 'message', 'comment')),
  entity_id uuid,
  read_at timestamptz,
  email_sent_at timestamptz,
  created_at timestamptz default now()
);

create index notifications_recipient_id_idx on notifications(recipient_id);
create index notifications_read_at_idx on notifications(recipient_id, read_at) where read_at is null;

-- RLS
alter table notifications enable row level security;

create policy "Users can read own notifications"
  on notifications for select
  using (auth.uid() = recipient_id);

create policy "Users can update own notifications (mark read)"
  on notifications for update
  using (auth.uid() = recipient_id)
  with check (auth.uid() = recipient_id);

-- Nur Service Role / Postgres (Triggers) darf inserten
create policy "Service role can insert notifications"
  on notifications for insert
  with check (auth.role() = 'service_role' or auth.role() = 'postgres');

-- ============================================================
-- Notification Preferences Tabelle
-- ============================================================

create table if not exists notification_preferences (
  profile_id uuid primary key references profiles(id) on delete cascade,
  -- In-App
  inapp_likes boolean default true,
  inapp_comments boolean default true,
  inapp_tags boolean default true,
  inapp_follows boolean default true,
  inapp_messages boolean default true,
  inapp_inquiries boolean default true,
  -- E-Mail
  email_comments boolean default true,
  email_tags boolean default true,
  email_follows boolean default true,
  email_messages boolean default true,
  email_inquiries boolean default true,
  email_likes boolean default false,
  -- Timestamp
  updated_at timestamptz default now()
);

alter table notification_preferences enable row level security;

create policy "Users can read own preferences"
  on notification_preferences for select
  using (auth.uid() = profile_id);

create policy "Users can update own preferences"
  on notification_preferences for update
  using (auth.uid() = profile_id);

create policy "Users can insert own preferences"
  on notification_preferences for insert
  with check (auth.uid() = profile_id);

-- Auto-create preferences on profile creation
create or replace function create_default_notification_preferences()
returns trigger language plpgsql security definer as $$
begin
  insert into notification_preferences (profile_id)
  values (NEW.id)
  on conflict (profile_id) do nothing;
  return NEW;
end;
$$;

create trigger on_profile_created_notification_prefs
  after insert on profiles
  for each row execute function create_default_notification_preferences();

-- Backfill fuer bestehende Profile
insert into notification_preferences (profile_id)
select id from profiles
on conflict (profile_id) do nothing;
