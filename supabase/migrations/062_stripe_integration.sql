-- ============================================================
-- Stripe Integration: Subscriptions + Featured Bikes
-- ============================================================

-- Subscription fields on workshops (riders never pay)
alter table workshops
  add column if not exists subscription_tier text not null default 'free'
    check (subscription_tier in ('free', 'founding_partner', 'pro', 'premium')),
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_subscription_id text,
  add column if not exists subscription_started_at timestamptz,
  add column if not exists deleted_at timestamptz;

-- Soft delete on profiles
alter table profiles
  add column if not exists deleted_at timestamptz;

-- Featured bikes
alter table bikes
  add column if not exists is_featured boolean not null default false,
  add column if not exists featured_until timestamptz,
  add column if not exists featured_by_user_id uuid references profiles(id);

-- Index for featured queries
create index if not exists idx_bikes_featured on bikes(is_featured, featured_until)
  where is_featured = true;

-- RLS: Workshop owner can read own workshop (soft-delete aware)
create policy "workshop_owner_select_own"
  on workshops for select
  using (owner_id = auth.uid() and deleted_at is null);

-- RLS: Workshop owner can update own workshop (soft-delete aware)
create policy "workshop_owner_update_own"
  on workshops for update
  using (owner_id = auth.uid() and deleted_at is null);
