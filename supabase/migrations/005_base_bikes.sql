-- ============================================================
-- MotoDigital — Base Bikes (Donor / Spender-Motorräder)
-- Referenztabelle für Basisbikes, die als Grundlage für
-- Custom Builds verwendet werden.
-- ============================================================

CREATE TABLE base_bikes (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  make          text NOT NULL,                        -- Hersteller  z. B. "Honda"
  model         text NOT NULL,                        -- Modell       z. B. "CB 750"
  cc            smallint,                             -- Hubraum in ccm
  year_from     smallint,                             -- Baujahr ab
  year_to       smallint,                             -- Baujahr bis (NULL = noch gebaut)
  typical_styles text[] NOT NULL DEFAULT '{}',        -- typische Custom-Stile
  notes         text,                                 -- optionale Hinweise
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- Volltext-Suche für Autocomplete
CREATE INDEX base_bikes_make_model_idx ON base_bikes (make, model);
CREATE INDEX base_bikes_make_idx       ON base_bikes (make);

-- GIN-Index für Array-Suche auf typical_styles
CREATE INDEX base_bikes_styles_gin ON base_bikes USING GIN (typical_styles);

-- RLS: öffentlich lesbar (kein Schreiben für normale Nutzer)
ALTER TABLE base_bikes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "base_bikes: public read" ON base_bikes FOR SELECT USING (true);

-- ============================================================
-- Seed-Daten
-- ============================================================

INSERT INTO base_bikes (make, model, cc, year_from, year_to, typical_styles) VALUES

  -- Honda
  ('Honda', 'Rebel 500',    471,  2017, NULL, ARRAY['cafe_racer','bobber','scrambler']),
  ('Honda', 'XR 600',       591,  1985, 2000, ARRAY['scrambler','enduro','tracker']),
  ('Honda', 'Shadow 600',   583,  1988, 2007, ARRAY['bobber','chopper']),
  ('Honda', 'CB 750',       750,  1969, 2003, ARRAY['cafe_racer','bobber','scrambler']),
  ('Honda', 'CB 550',       544,  1974, 1978, ARRAY['cafe_racer','scrambler','tracker']),

  -- Suzuki
  ('Suzuki', 'GS 500',      487,  1989, 2008, ARRAY['cafe_racer','scrambler','tracker']),
  ('Suzuki', 'DR 650',      644,  1990, NULL, ARRAY['scrambler','enduro','tracker']),
  ('Suzuki', 'GS 550',      549,  1977, 1986, ARRAY['cafe_racer','scrambler']),

  -- Kawasaki
  ('Kawasaki', 'ER-5',      498,  1997, 2006, ARRAY['cafe_racer','scrambler']),
  ('Kawasaki', 'Z 650',     652,  1977, 1983, ARRAY['cafe_racer','tracker']),

  -- BMW
  ('BMW', 'R nineT',        1170, 2013, NULL, ARRAY['cafe_racer','scrambler','bobber']),
  ('BMW', 'R 80',           797,  1977, 1994, ARRAY['cafe_racer','scrambler','tracker']),
  ('BMW', 'R 100',          980,  1976, 1995, ARRAY['cafe_racer','scrambler','bobber']),

  -- Yamaha
  ('Yamaha', 'XSR 700',     689,  2016, NULL, ARRAY['cafe_racer','tracker','scrambler']),
  ('Yamaha', 'XT 500',      499,  1976, 1989, ARRAY['scrambler','tracker','enduro']),
  ('Yamaha', 'XV 750 Virago', 748, 1981, 1997, ARRAY['bobber','chopper','cafe_racer']),
  ('Yamaha', 'XS 650',      653,  1970, 1985, ARRAY['cafe_racer','bobber','scrambler']),

  -- Ducati
  ('Ducati', 'Scrambler',   803,  2015, NULL, ARRAY['scrambler','cafe_racer','tracker']),

  -- Harley-Davidson
  ('Harley-Davidson', 'Sportster 883',  883,  1957, 2021, ARRAY['bobber','chopper','cafe_racer']),
  ('Harley-Davidson', 'Sportster 1200', 1200, 1988, 2021, ARRAY['bobber','chopper','cafe_racer']),

  -- Triumph
  ('Triumph', 'Bonneville',  865,  1959, NULL, ARRAY['cafe_racer','scrambler','bobber']),
  ('Triumph', 'Thruxton',    865,  2004, NULL, ARRAY['cafe_racer']),

  -- Moto Guzzi
  ('Moto Guzzi', 'Bellagio 940',             940, 2007, 2012, ARRAY['cafe_racer','bobber']),
  ('Moto Guzzi', 'Bellagio 940 Deluxe',      940, 2007, 2012, ARRAY['cafe_racer','bobber']),
  ('Moto Guzzi', 'Bellagio 940 Aquila Nera', 940, 2010, 2012, ARRAY['cafe_racer','bobber']);
