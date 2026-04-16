-- Analytics events table for workshop dashboard
create table analytics_events (
  id uuid default gen_random_uuid() primary key,
  event_type text not null, -- 'profile_view', 'contact_click', 'route_click', 'save_click', 'bike_view', 'gallery_click', 'share_click'
  target_type text, -- 'workshop', 'bike'
  target_id uuid,
  workshop_id uuid references workshops(id),
  visitor_fingerprint text, -- hashed IP + UA, no PII
  region text, -- Bundesland from IP geolocation (optional, best-effort)
  referrer text, -- 'werkstattsuche', 'explore', 'bikes', 'direct'
  created_at timestamptz default now()
);

-- Index for dashboard queries (workshop_id + event_type + created_at)
create index idx_analytics_events_workshop on analytics_events (workshop_id, event_type, created_at desc);

-- Index for target lookups (bike performance table)
create index idx_analytics_events_target on analytics_events (target_id, event_type, created_at desc);

-- Enable RLS
alter table analytics_events enable row level security;

-- Workshop owners can read their own analytics
create policy "workshop_owner_read" on analytics_events
  for select using (
    workshop_id in (
      select id from workshops where owner_id = auth.uid()
    )
  );

-- No direct insert/update/delete from client — writes go through service role via API route
-- Superadmins can read all analytics
create policy "superadmin_read" on analytics_events
  for select using (
    exists (
      select 1 from profiles where id = auth.uid() and role = 'superadmin'
    )
  );
