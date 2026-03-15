-- ============================================================
-- MotoDigital — Initial Schema
-- Run: supabase db push  OR  paste into Supabase SQL Editor
-- ============================================================

-- Enable extensions

CREATE EXTENSION IF NOT EXISTS "postgis";

-- ── Enums ────────────────────────────────────────────────────
CREATE TYPE user_role   AS ENUM ('rider', 'builder', 'workshop');
CREATE TYPE bike_status AS ENUM ('draft', 'active', 'sold');
CREATE TYPE bike_style  AS ENUM (
  'naked', 'cafe_racer', 'bobber', 'scrambler',
  'tracker', 'chopper', 'street', 'enduro', 'other'
);

-- ── profiles ─────────────────────────────────────────────────
CREATE TABLE profiles (
  id            uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username      text UNIQUE NOT NULL,
  full_name     text,
  avatar_url    text,
  role          user_role NOT NULL DEFAULT 'rider',
  bio           text,
  instagram_url text,
  tiktok_url    text,
  is_verified   boolean NOT NULL DEFAULT false,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ── workshops ────────────────────────────────────────────────
CREATE TABLE workshops (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id    uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name        text NOT NULL,
  slug        text UNIQUE NOT NULL,
  description text,
  address     text,
  location    geography(Point, 4326),
  city        text,
  services    text[] NOT NULL DEFAULT '{}',
  logo_url    text,
  is_verified boolean NOT NULL DEFAULT false,
  avg_rating  numeric(3,2),
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX workshops_location_idx ON workshops USING GIST (location);

-- ── bikes ────────────────────────────────────────────────────
CREATE TABLE bikes (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id   uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  workshop_id uuid REFERENCES workshops(id) ON DELETE SET NULL,
  title       text NOT NULL,
  make        text NOT NULL,
  model       text NOT NULL,
  year        smallint NOT NULL,
  cc          integer,
  mileage_km  integer,
  price       numeric(10,2) NOT NULL,
  style       bike_style NOT NULL DEFAULT 'naked',
  description text,
  location    geography(Point, 4326),
  city        text,
  status      bike_status NOT NULL DEFAULT 'draft',
  is_verified boolean NOT NULL DEFAULT false,
  view_count  integer NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX bikes_location_idx  ON bikes USING GIST (location);
CREATE INDEX bikes_status_idx    ON bikes (status);
CREATE INDEX bikes_make_idx      ON bikes (make);
CREATE INDEX bikes_price_idx     ON bikes (price);
CREATE INDEX bikes_style_idx     ON bikes (style);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION touch_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER bikes_updated_at
  BEFORE UPDATE ON bikes
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

-- ── bike_images ──────────────────────────────────────────────
CREATE TABLE bike_images (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bike_id   uuid NOT NULL REFERENCES bikes(id) ON DELETE CASCADE,
  url       text NOT NULL,
  position  smallint NOT NULL DEFAULT 0,
  is_cover  boolean NOT NULL DEFAULT false
);

CREATE INDEX bike_images_bike_idx ON bike_images (bike_id);

-- ── conversations ────────────────────────────────────────────
CREATE TABLE conversations (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bike_id         uuid NOT NULL REFERENCES bikes(id) ON DELETE CASCADE,
  buyer_id        uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  seller_id       uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  last_message_at timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (bike_id, buyer_id)  -- one thread per bike+buyer
);

CREATE INDEX conversations_buyer_idx  ON conversations (buyer_id);
CREATE INDEX conversations_seller_idx ON conversations (seller_id);

-- ── messages ─────────────────────────────────────────────────
CREATE TABLE messages (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id       uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  body            text NOT NULL,
  read_at         timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX messages_conv_idx ON messages (conversation_id, created_at);

-- Auto-update conversation.last_message_at
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  UPDATE conversations
  SET last_message_at = now()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_new_message
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION update_conversation_timestamp();

-- ── saved_bikes ──────────────────────────────────────────────
CREATE TABLE saved_bikes (
  user_id    uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  bike_id    uuid NOT NULL REFERENCES bikes(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, bike_id)
);

-- ── reviews ──────────────────────────────────────────────────
CREATE TABLE reviews (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewer_id  uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reviewee_id  uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  bike_id      uuid NOT NULL REFERENCES bikes(id) ON DELETE CASCADE,
  rating       smallint NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment      text,
  created_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (reviewer_id, bike_id)  -- one review per transaction
);

-- Auto-update workshop avg_rating
CREATE OR REPLACE FUNCTION update_workshop_rating()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  UPDATE workshops w
  SET avg_rating = (
    SELECT AVG(r.rating)
    FROM reviews r
    JOIN profiles p ON p.id = r.reviewee_id
    WHERE p.id = w.owner_id
  )
  WHERE w.owner_id = COALESCE(NEW.reviewee_id, OLD.reviewee_id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_review_change
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_workshop_rating();

-- ── waitlist ─────────────────────────────────────────────────
CREATE TABLE waitlist (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email      text UNIQUE NOT NULL,
  name       text,
  role       text NOT NULL CHECK (role IN ('builder', 'rider')),
  invited_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ── Proximity search function ────────────────────────────────
CREATE OR REPLACE FUNCTION search_bikes_nearby(
  lat          float,
  lng          float,
  radius_m     int DEFAULT 30000,
  style_filter bike_style DEFAULT NULL,
  min_price    numeric DEFAULT NULL,
  max_price    numeric DEFAULT NULL,
  lim          int DEFAULT 50
)
RETURNS SETOF bikes
LANGUAGE sql STABLE AS $$
  SELECT *
  FROM bikes
  WHERE status = 'active'
    AND ST_DWithin(
      location,
      ST_Point(lng, lat)::geography,
      radius_m
    )
    AND (style_filter IS NULL OR style = style_filter)
    AND (min_price IS NULL OR price >= min_price)
    AND (max_price IS NULL OR price <= max_price)
  ORDER BY location <-> ST_Point(lng, lat)::geography
  LIMIT lim;
$$;

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

ALTER TABLE profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE workshops     ENABLE ROW LEVEL SECURITY;
ALTER TABLE bikes         ENABLE ROW LEVEL SECURITY;
ALTER TABLE bike_images   ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages      ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_bikes   ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews       ENABLE ROW LEVEL SECURITY;
ALTER TABLE waitlist      ENABLE ROW LEVEL SECURITY;

-- profiles: public read, own write
CREATE POLICY "profiles: public read"   ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles: owner update"  ON profiles FOR UPDATE USING (auth.uid() = id);

-- workshops: public read, owner write
CREATE POLICY "workshops: public read"  ON workshops FOR SELECT USING (true);
CREATE POLICY "workshops: owner insert" ON workshops FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "workshops: owner update" ON workshops FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "workshops: owner delete" ON workshops FOR DELETE USING (auth.uid() = owner_id);

-- bikes: active = public, draft/sold = owner only
CREATE POLICY "bikes: active public read" ON bikes FOR SELECT
  USING (status = 'active' OR auth.uid() = seller_id);
CREATE POLICY "bikes: owner insert" ON bikes FOR INSERT
  WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "bikes: owner update" ON bikes FOR UPDATE
  USING (auth.uid() = seller_id);
CREATE POLICY "bikes: owner delete" ON bikes FOR DELETE
  USING (auth.uid() = seller_id);

-- bike_images: follow bike visibility
CREATE POLICY "bike_images: read"   ON bike_images FOR SELECT USING (true);
CREATE POLICY "bike_images: owner write" ON bike_images FOR ALL
  USING (auth.uid() = (SELECT seller_id FROM bikes WHERE id = bike_id));

-- conversations: only participants
CREATE POLICY "conversations: participant read" ON conversations FOR SELECT
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);
CREATE POLICY "conversations: buyer create" ON conversations FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);

-- messages: only conversation participants
CREATE POLICY "messages: participant read" ON messages FOR SELECT
  USING (auth.uid() IN (
    SELECT buyer_id FROM conversations WHERE id = conversation_id
    UNION
    SELECT seller_id FROM conversations WHERE id = conversation_id
  ));
CREATE POLICY "messages: participant send" ON messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id AND auth.uid() IN (
    SELECT buyer_id FROM conversations WHERE id = conversation_id
    UNION
    SELECT seller_id FROM conversations WHERE id = conversation_id
  ));

-- saved_bikes: owner only
CREATE POLICY "saved_bikes: owner"  ON saved_bikes FOR ALL
  USING (auth.uid() = user_id);

-- reviews: public read, reviewer write
CREATE POLICY "reviews: public read"     ON reviews FOR SELECT USING (true);
CREATE POLICY "reviews: reviewer insert" ON reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

-- waitlist: insert only (no auth required for landing page)
CREATE POLICY "waitlist: insert" ON waitlist FOR INSERT WITH CHECK (true);

-- ── Storage buckets ──────────────────────────────────────────
-- Run in Supabase dashboard OR via CLI:
-- supabase storage create bike-images --public
-- supabase storage create avatars --public
