-- Performance & hygiene pass (2026-10-29), driven by the Supabase advisors.
-- Every statement is idempotent, so the file can be re-run safely.

-- ── 1. Public founding-member count ──────────────────────────────────────
-- Seeded, unclaimed workshop profiles carry the founding_partner default too.
-- Count only workshops owned by a claimed account (real email) with a
-- confirmed address, without exposing auth.users to anon.
create or replace function public.founding_member_count()
returns integer
language sql
stable
security definer
set search_path = ''
as $$
  select count(*)::integer
  from public.workshops w
  join auth.users u on u.id = w.owner_id
  where w.subscription_tier = 'founding_partner'
    and w.deleted_at is null
    and u.email_confirmed_at is not null
    and u.email not like '%@motodigital.local'
$$;

revoke execute on function public.founding_member_count() from public;
grant execute on function public.founding_member_count() to anon, authenticated;

-- ── 2. Indexes on foreign keys (advisor: unindexed_foreign_keys) ─────────
create index if not exists agent_briefing_updated_by_idx        on public.agent_briefing (updated_by);
create index if not exists agent_orders_approved_by_idx         on public.agent_orders (approved_by);
create index if not exists agent_orders_created_by_idx          on public.agent_orders (created_by);
create index if not exists agent_outputs_order_id_idx           on public.agent_outputs (order_id);
create index if not exists agent_outputs_run_by_idx             on public.agent_outputs (run_by);
create index if not exists agent_outputs_handoff_from_idx       on public.agent_outputs (handoff_from);
create index if not exists bikes_seller_id_idx                  on public.bikes (seller_id);
create index if not exists bikes_workshop_id_idx                on public.bikes (workshop_id);
create index if not exists bikes_featured_by_user_id_idx        on public.bikes (featured_by_user_id);
create index if not exists build_posts_user_id_idx              on public.build_posts (user_id);
create index if not exists builder_media_builder_id_idx         on public.builder_media (builder_id);
create index if not exists community_comment_likes_user_id_idx  on public.community_comment_likes (user_id);
create index if not exists community_post_comments_user_id_idx  on public.community_post_comments (user_id);
create index if not exists community_post_comments_post_id_idx  on public.community_post_comments (post_id);
create index if not exists community_post_likes_user_id_idx     on public.community_post_likes (user_id);
create index if not exists community_posts_user_id_idx          on public.community_posts (user_id);
create index if not exists conversations_bike_id_idx            on public.conversations (bike_id);
create index if not exists event_interest_user_id_idx           on public.event_interest (user_id);
create index if not exists followers_following_id_idx           on public.followers (following_id);
create index if not exists magazine_articles_approved_by_idx    on public.magazine_articles (approved_by);
create index if not exists magazine_articles_source_output_id_idx on public.magazine_articles (source_output_id);
create index if not exists message_reactions_user_id_idx        on public.message_reactions (user_id);
create index if not exists messages_sender_id_idx               on public.messages (sender_id);
create index if not exists notifications_actor_id_idx           on public.notifications (actor_id);
create index if not exists reviews_reviewee_id_idx              on public.reviews (reviewee_id);
create index if not exists reviews_bike_id_idx                  on public.reviews (bike_id);
create index if not exists ride_participants_user_id_idx        on public.ride_participants (user_id);
create index if not exists saved_bikes_bike_id_idx              on public.saved_bikes (bike_id);
create index if not exists saved_builders_builder_id_idx        on public.saved_builders (builder_id);
create index if not exists workshops_owner_id_idx               on public.workshops (owner_id);

-- ── 3. Duplicate indexes (advisor: duplicate_index) ──────────────────────
-- The unique constraints (*_slug_key) already index these columns.
drop index if exists public.profiles_slug_idx;
drop index if exists public.idx_events_slug;
drop index if exists public.base_bike_brands_slug_idx;

-- ── 4. RLS: evaluate auth.*() once per query (advisor: auth_rls_initplan) ─
-- Wrapping the call in a sub-select lets Postgres cache it as an initplan
-- instead of re-running it for every row. Semantics are unchanged.
do $$
declare
  pol record;
  new_qual text;
  new_check text;
  bare_call constant text := '(?<!select )auth\.(uid|jwt|role)\(\)';
begin
  for pol in
    select schemaname, tablename, policyname, qual, with_check
    from pg_policies
    where schemaname = 'public'
      and (qual ~ 'auth\.(uid|jwt|role)\(\)' or with_check ~ 'auth\.(uid|jwt|role)\(\)')
  loop
    new_qual  := regexp_replace(pol.qual,       bare_call, '(select auth.\1())', 'gi');
    new_check := regexp_replace(pol.with_check, bare_call, '(select auth.\1())', 'gi');
    if new_qual is distinct from pol.qual then
      execute format('alter policy %I on %I.%I using (%s)', pol.policyname, pol.schemaname, pol.tablename, new_qual);
    end if;
    if new_check is distinct from pol.with_check then
      execute format('alter policy %I on %I.%I with check (%s)', pol.policyname, pol.schemaname, pol.tablename, new_check);
    end if;
  end loop;
end
$$;

-- ── 5. Pin search_path on our functions (advisor: function_search_path_mutable)
-- Same resolution order the API roles use today, minus the caller's influence.
do $$
declare
  fn record;
begin
  for fn in
    select p.oid::regprocedure as signature
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.prokind = 'f'
      and not exists (select 1 from pg_depend d where d.objid = p.oid and d.deptype = 'e')
      and not exists (select 1 from unnest(coalesce(p.proconfig, '{}')) c where c like 'search_path=%')
  loop
    execute format('alter function %s set search_path = public, extensions, pg_temp', fn.signature);
  end loop;
end
$$;

-- ── 6. Realtime: publish only tables the app subscribes to ───────────────
-- The app listens to messages, message_reactions and notifications. Every
-- write to another published table is decoded by Realtime for nothing.
do $$
declare
  tbl text;
begin
  foreach tbl in array array['community_posts', 'community_post_likes', 'conversations'] loop
    if exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = tbl
    ) then
      execute format('alter publication supabase_realtime drop table public.%I', tbl);
    end if;
  end loop;
end
$$;

-- ── 7. pg_cron hygiene (Prod only — Dev has no pg_cron) ──────────────────
do $$
begin
  if to_regclass('cron.job') is null then
    return;
  end if;

  -- Run history grows forever otherwise (27k rows / 18 MB by 2026-10-29)
  delete from cron.job_run_details where end_time < now() - interval '7 days';
  perform cron.schedule(
    'purge-cron-run-details',
    '17 3 * * *',
    $job$delete from cron.job_run_details where end_time < now() - interval '7 days'$job$
  );

  -- simulate-fake-activity only acts 10:00–19:30 Europe/Berlin; 08–18 UTC
  -- covers that window in summer and winter time
  if exists (select 1 from cron.job where jobname = 'simulate-fake-activity') then
    perform cron.alter_job(
      job_id := (select jobid from cron.job where jobname = 'simulate-fake-activity'),
      schedule := '*/10 8-18 * * *'
    );
  end if;
end
$$;
