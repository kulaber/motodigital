-- ============================================================
-- 047: Events table (replaces static TypeScript data)
-- ============================================================

CREATE TABLE events (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        text UNIQUE NOT NULL,
  name        text NOT NULL,
  date_start  date,
  date_end    date,
  location    text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  tags        text[] NOT NULL DEFAULT '{}',
  url         text,
  image       text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "events_public_read" ON events
  FOR SELECT USING (true);

-- Superadmin write
CREATE POLICY "events_superadmin_insert" ON events
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'superadmin')
  );

CREATE POLICY "events_superadmin_update" ON events
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'superadmin')
  );

CREATE POLICY "events_superadmin_delete" ON events
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'superadmin')
  );

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_events_updated_at();

-- Storage bucket for event images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'event-images',
  'event-images',
  true,
  10485760, -- 10 MB
  ARRAY['image/jpeg','image/png','image/webp','image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "event_images_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'event-images');

CREATE POLICY "event_images_superadmin_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'event-images'
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'superadmin')
  );

CREATE POLICY "event_images_superadmin_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'event-images'
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'superadmin')
  );

CREATE POLICY "event_images_superadmin_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'event-images'
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'superadmin')
  );

-- Seed existing events
INSERT INTO events (slug, name, date_start, date_end, location, description, tags, url, image) VALUES
  ('glemseck-101', 'Glemseck 101', '2026-09-01', '2026-09-03', 'Leonberg, Deutschland',
   'Das legendäre Sprint-Race-Event auf dem Glemseck. Handgefertigte Custom Bikes treten gegeneinander an — 101 Meter, die zählen. Eines der emotionalsten Custom-Moto-Events in Europa.',
   ARRAY['Sprint', 'Custom', 'Classic'], NULL,
   'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=1200&q=85'),

  ('wheels-and-waves', 'Wheels & Waves', '2026-06-10', '2026-06-14', 'Biarritz, Frankreich',
   'Motorräder, Surf und Musik am Atlantik. Wheels & Waves ist mehr als ein Event — es ist ein Lifestyle. Custom Bikes, Kultur und das besondere Flair der baskischen Küste.',
   ARRAY['Festival', 'Surf', 'Custom'], NULL,
   'https://images.unsplash.com/photo-1598099297822-396cbd179125?w=1200&q=85'),

  ('eindhoven-motor-show', 'Eindhoven Motor Show', '2026-11-01', '2026-11-03', 'Eindhoven, Niederlande',
   'Europas kreativste Custom-Bike-Show. Hunderte handgefertigte Unikate, Builder aus ganz Europa und eine Atmosphäre, die ihresgleichen sucht.',
   ARRAY['Show', 'Custom', 'Indoor'], NULL,
   'https://images.unsplash.com/photo-1536419598693-94435e7f9757?w=1200&q=85'),

  ('cafe-racer-festival', 'Cafe Racer Festival', '2026-06-20', '2026-06-21', 'Paris, Frankreich',
   'Das größte Cafe-Racer-Festival Europas im Hippodrome de Vincennes. Rennen, Ausstellung und die beste Custom-Moto-Community Frankreichs auf einem Gelände.',
   ARRAY['Cafe Racer', 'Race', 'Festival'], NULL,
   'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=1200&q=85'),

  ('intermot', 'Intermot', '2026-10-07', '2026-10-11', 'Köln, Deutschland',
   'Die internationale Motorradmesse in Köln — Hersteller, Händler und Custom-Kultur auf der weltweit führenden Zweiradmesse. Unverzichtbar für jeden Motorradfan.',
   ARRAY['Messe', 'International', 'Neuheiten'], NULL,
   'https://images.unsplash.com/photo-1535050264505-ba17be3ee504?w=1200&q=85'),

  ('amd-world-championship', 'AMD World Championship', '2026-10-07', '2026-10-11', 'Köln, Deutschland',
   'Die Weltmeisterschaft der Custom Bikes — parallel zur Intermot. Builder aus über 30 Ländern zeigen ihre besten Arbeiten. Wer hier gewinnt, hat den Thron der Custom-Welt.',
   ARRAY['Championship', 'Custom', 'World'], NULL,
   'https://images.unsplash.com/photo-1603096564885-1a332df4f903?w=1200&q=85');

-- Update event_interest to reference events table
-- (keeping event_slug as text for backwards compatibility, but adding an index)
CREATE INDEX IF NOT EXISTS idx_event_interest_slug ON event_interest(event_slug);
CREATE INDEX IF NOT EXISTS idx_events_slug ON events(slug);
