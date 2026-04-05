-- ============================================================
-- Fix: make Spalte nullable (wird durch brand_id ersetzt)
-- ============================================================
ALTER TABLE base_bikes ALTER COLUMN make DROP NOT NULL;

-- ============================================================
-- MotoDigital — Base Bikes Seed
-- Idempotent: ON CONFLICT DO NOTHING
-- ============================================================

-- ============================================================
-- BRANDS
-- ============================================================

INSERT INTO base_bike_brands (name, slug, country, founded, description) VALUES
  ('Honda',           'honda',           'Japan',           1948, 'Zuverlaessige Klassiker — perfekte Basis fuer Cafe Racer, Scrambler und Bobber.'),
  ('Yamaha',          'yamaha',          'Japan',           1955, 'Von der XSR bis zur SR500 — Yamaha liefert vielseitige Custom-Plattformen.'),
  ('Kawasaki',        'kawasaki',        'Japan',           1896, 'Robuste Technik zu fairen Preisen — ideal fuer erste Custom-Projekte.'),
  ('Suzuki',          'suzuki',          'Japan',           1909, 'Guenstig, zuverlaessig, anpassbar — Suzuki ist der Geheimtipp unter Custom Buildern.'),
  ('BMW',             'bmw',             'Deutschland',     1923, 'Ikonischer Boxer-Motor — seit Jahrzehnten die Wahl fuer Premium Custom Builds.'),
  ('Triumph',         'triumph',         'Grossbritannien', 1902, 'Britisches Erbe trifft modernes Custom-Handwerk — Bonneville und Thruxton als Klassiker.'),
  ('Harley-Davidson', 'harley-davidson', 'USA',             1903, 'Amerikanische Ikone — unschlagbar als Basis fuer Bobber und Chopper.'),
  ('Moto Guzzi',     'moto-guzzi',      'Italien',         1921, 'Laengseinbau-V2 aus Mandello del Lario — fuer Custom Builds mit Charakter.'),
  ('Ducati',          'ducati',          'Italien',         1926, 'Italienische Leidenschaft — Monster und Scrambler als moderne Custom-Plattformen.'),
  ('Royal Enfield',   'royal-enfield',   'Indien',          1901, 'Erschwinglich und authentisch — die Interceptor 650 als neue Custom-Basis.'),
  ('Indian',          'indian',          'USA',             1901, 'Amerikanische Tradition neu interpretiert — Scout und FTR fuer moderne Customs.'),
  ('KTM',             'ktm',             'Oesterreich',     1934, 'Leichte Einzylinder und V-Twins — perfekt fuer Tracker und Supermoto.'),
  ('Husqvarna',       'husqvarna',       'Schweden',        1903, 'Vitpilen und Svartpilen — ab Werk schon fast Custom.'),
  ('Norton',          'norton',          'Grossbritannien', 1898, 'Die Commando als Inbegriff des britischen Cafe Racers.'),
  ('BSA',             'bsa',             'Grossbritannien', 1919, 'Gold Star und A65 — britische Legenden fuer puristische Builds.'),
  ('Benelli',         'benelli',         'Italien',         1911, 'Vom Sechszylinder-Klassiker bis zum modernen Leoncino.'),
  ('MV Agusta',       'mv-agusta',       'Italien',         1945, 'Italienische Renngeschichte — Brutale und Dragster als Streetfighter-Basis.'),
  ('Laverda',         'laverda',         'Italien',         1873, 'Die Jota als eine der schnellsten Serienmotorraeder der 70er.'),
  ('Simson',          'simson',          'Deutschland',     1856, 'DDR-Kult — S51 und Schwalbe als beliebte Custom-Basis im DACH-Raum.'),
  ('Bultaco',         'bultaco',         'Spanien',         1958, 'Spanische Zweitakt-Legenden — Pursang und Metralla fuer puristische Builds.')
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- HONDA
-- ============================================================

INSERT INTO base_bikes (brand_id, model, slug, year_from, year_to, engine_cc, engine_type, custom_styles) VALUES
  ((SELECT id FROM base_bike_brands WHERE slug = 'honda'), 'CB 125 / CB 175 / CB 200 / CB 250', 'cb-125-175-200-250', 1960, 1985, 250, 'single', ARRAY['cafe_racer']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'honda'), 'CB 350 / CB 360', 'cb-350-360', 1968, 1976, 360, 'parallel_twin', ARRAY['cafe_racer']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'honda'), 'CB 400 / CB 450', 'cb-400-450', 1965, 1985, 450, 'parallel_twin', ARRAY['cafe_racer']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'honda'), 'CB 500 Four', 'cb-500-four', 1971, 1977, 500, 'inline_four', ARRAY['cafe_racer']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'honda'), 'CB 550 Four', 'cb-550-four', 1974, 1978, 550, 'inline_four', ARRAY['cafe_racer']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'honda'), 'CB 750 Four SOHC', 'cb-750-four-sohc', 1969, 1978, 750, 'inline_four', ARRAY['cafe_racer']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'honda'), 'CB 750 Four DOHC', 'cb-750-four-dohc', 1979, 1982, 750, 'inline_four', ARRAY['cafe_racer']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'honda'), 'CB 900 / CB 1000', 'cb-900-1000', 1980, 1983, 1000, 'inline_four', ARRAY['cafe_racer']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'honda'), 'CB 1100', 'cb-1100', 2013, NULL, 1100, 'inline_four', ARRAY['cafe_racer']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'honda'), 'CL 175 / CL 350 / CL 450', 'cl-175-350-450', 1967, 1975, 450, 'parallel_twin', ARRAY['scrambler']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'honda'), 'CX 500 / CX 650', 'cx-500-650', 1978, 1986, 650, 'v_twin', ARRAY['cafe_racer', 'brat']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'honda'), 'XBR 500', 'xbr-500', 1985, 1989, 500, 'single', ARRAY['cafe_racer']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'honda'), 'CBX 1000', 'cbx-1000', 1978, 1982, 1000, 'inline_six', ARRAY['cafe_racer']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'honda'), 'GL 1000 / GL 1100 Goldwing', 'gl-1000-1100-goldwing', 1974, 1983, 1100, 'flat_four', ARRAY['cafe_racer']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'honda'), 'XR 400 / XR 600 / XR 650', 'xr-400-600-650', 1979, NULL, 650, 'single', ARRAY['scrambler']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'honda'), 'XL 600 / XL 650', 'xl-600-650', 1983, 2000, 650, 'single', ARRAY['scrambler']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'honda'), 'NX 650 Dominator', 'nx-650-dominator', 1988, 2000, 650, 'single', ARRAY['scrambler', 'tracker']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'honda'), 'CRF 250 L / CRF 300 L', 'crf-250l-300l', 2012, NULL, 300, 'single', ARRAY['scrambler']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'honda'), 'CMX 500 Rebel / CMX 1100 Rebel', 'cmx-500-1100-rebel', 2017, NULL, 1100, 'v_twin', ARRAY['bobber']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'honda'), 'Africa Twin CRF 1000 / 1100', 'africa-twin-crf-1000-1100', 2016, NULL, 1100, 'parallel_twin', ARRAY['scrambler']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'honda'), 'Monkey / Dax ST125', 'monkey-dax-st125', 2018, NULL, 125, 'single', ARRAY['custom']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'honda'), 'FT 500 Ascot / VT 500 Ascot', 'ft-500-vt-500-ascot', 1982, 1984, 500, 'v_twin', ARRAY['tracker'])
ON CONFLICT (brand_id, slug) DO NOTHING;

-- ============================================================
-- YAMAHA
-- ============================================================

INSERT INTO base_bikes (brand_id, model, slug, year_from, year_to, engine_cc, engine_type, custom_styles) VALUES
  ((SELECT id FROM base_bike_brands WHERE slug = 'yamaha'), 'XS 400 / XS 500', 'xs-400-500', 1977, 1982, 500, 'parallel_twin', ARRAY['cafe_racer']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'yamaha'), 'XS 650', 'xs-650', 1968, 1984, 650, 'parallel_twin', ARRAY['cafe_racer', 'bobber', 'tracker']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'yamaha'), 'XS 750 / XS 850', 'xs-750-850', 1976, 1981, 850, 'triple', ARRAY['cafe_racer']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'yamaha'), 'XS 1100', 'xs-1100', 1978, 1981, 1100, 'inline_four', ARRAY['cafe_racer']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'yamaha'), 'XJ 550 / XJ 600 / XJ 650 / XJ 750 / XJ 900', 'xj-550-600-650-750-900', 1981, 1994, 900, 'inline_four', ARRAY['cafe_racer']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'yamaha'), 'SR 250', 'sr-250', 1980, 2000, 250, 'single', ARRAY['cafe_racer', 'scrambler']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'yamaha'), 'SR 400', 'sr-400', 1978, 2021, 400, 'single', ARRAY['cafe_racer', 'scrambler']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'yamaha'), 'SR 500', 'sr-500', 1978, 1999, 500, 'single', ARRAY['cafe_racer', 'scrambler']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'yamaha'), 'RD 125 / RD 250 / RD 350', 'rd-125-250-350', 1973, 1980, 350, 'two_stroke', ARRAY['cafe_racer']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'yamaha'), 'RD 400 / RD 350 YPVS', 'rd-400-350-ypvs', 1980, 1995, 400, 'two_stroke', ARRAY['cafe_racer']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'yamaha'), 'DT 125 / DT 175 / DT 250', 'dt-125-175-250', 1968, 1995, 250, 'two_stroke', ARRAY['scrambler']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'yamaha'), 'XT 500', 'xt-500', 1976, 1989, 500, 'single', ARRAY['scrambler']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'yamaha'), 'XT 600', 'xt-600', 1983, 2003, 600, 'single', ARRAY['scrambler']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'yamaha'), 'XT 660', 'xt-660', 2004, 2016, 660, 'single', ARRAY['scrambler']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'yamaha'), 'Tenere 660', 'tenere-660', 1983, 1996, 660, 'single', ARRAY['scrambler', 'adventure']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'yamaha'), 'Tenere 700', 'tenere-700', 2019, NULL, 700, 'parallel_twin', ARRAY['scrambler', 'adventure']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'yamaha'), 'XSR 700', 'xsr-700', 2016, NULL, 700, 'parallel_twin', ARRAY['cafe_racer', 'tracker']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'yamaha'), 'XSR 900', 'xsr-900', 2016, NULL, 900, 'triple', ARRAY['cafe_racer']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'yamaha'), 'MT-01', 'mt-01', 2005, 2012, 1670, 'v_twin', ARRAY['streetfighter']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'yamaha'), 'V-Max 1200', 'v-max-1200', 1985, 2007, 1200, 'v_four', ARRAY['streetfighter']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'yamaha'), 'FZR 600 / FZR 1000', 'fzr-600-1000', 1987, 1996, 1000, 'inline_four', ARRAY['cafe_racer']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'yamaha'), 'FJ 1100 / FJ 1200', 'fj-1100-1200', 1984, 1995, 1200, 'inline_four', ARRAY['cafe_racer']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'yamaha'), 'TX 750', 'tx-750', 1973, 1974, 750, 'parallel_twin', ARRAY['cafe_racer'])
ON CONFLICT (brand_id, slug) DO NOTHING;

-- ============================================================
-- KAWASAKI
-- ============================================================

INSERT INTO base_bikes (brand_id, model, slug, year_from, year_to, engine_cc, engine_type, custom_styles) VALUES
  ((SELECT id FROM base_bike_brands WHERE slug = 'kawasaki'), 'Z / KZ 400', 'z-kz-400', 1974, 1984, 400, 'parallel_twin', ARRAY['cafe_racer']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'kawasaki'), 'Z / KZ 440', 'z-kz-440', 1980, 1985, 440, 'parallel_twin', ARRAY['cafe_racer']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'kawasaki'), 'Z / KZ 550', 'z-kz-550', 1980, 1985, 550, 'inline_four', ARRAY['cafe_racer']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'kawasaki'), 'Z / KZ 650', 'z-kz-650', 1977, 1985, 650, 'inline_four', ARRAY['cafe_racer']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'kawasaki'), 'Z / KZ 750', 'z-kz-750', 1976, 1982, 750, 'inline_four', ARRAY['cafe_racer']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'kawasaki'), 'Z / KZ 900 / Z1', 'z-kz-900-z1', 1972, 1976, 900, 'inline_four', ARRAY['cafe_racer']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'kawasaki'), 'Z / KZ 1000', 'z-kz-1000', 1977, 1981, 1000, 'inline_four', ARRAY['cafe_racer']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'kawasaki'), 'H1 Mach III 500', 'h1-mach-iii-500', 1969, 1975, 500, 'two_stroke_triple', ARRAY['cafe_racer']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'kawasaki'), 'H2 Mach IV 750', 'h2-mach-iv-750', 1972, 1975, 750, 'two_stroke_triple', ARRAY['cafe_racer']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'kawasaki'), 'KH 250 / KH 400', 'kh-250-400', 1976, 1982, 400, 'two_stroke', ARRAY['cafe_racer']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'kawasaki'), 'GPz 550 / GPz 750 / GPz 900R', 'gpz-550-750-900r', 1982, 1990, 900, 'inline_four', ARRAY['cafe_racer']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'kawasaki'), 'W650 / W800', 'w650-w800', 1999, NULL, 800, 'parallel_twin', ARRAY['cafe_racer']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'kawasaki'), 'KLX 250 / KLX 300', 'klx-250-300', 1993, NULL, 300, 'single', ARRAY['scrambler']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'kawasaki'), 'KLR 650', 'klr-650', 1987, NULL, 650, 'single', ARRAY['scrambler', 'adventure']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'kawasaki'), 'KDX 200 / KDX 250', 'kdx-200-250', 1983, 2006, 250, 'two_stroke', ARRAY['scrambler']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'kawasaki'), 'Z 650 (neu)', 'z-650-neu', 2017, NULL, 650, 'parallel_twin', ARRAY['cafe_racer', 'tracker']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'kawasaki'), 'Z 900 (neu)', 'z-900-neu', 2017, NULL, 900, 'inline_four', ARRAY['streetfighter']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'kawasaki'), 'Vulcan S / Vulcan 900', 'vulcan-s-900', 2003, NULL, 900, 'v_twin', ARRAY['bobber']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'kawasaki'), 'Eliminator 500', 'eliminator-500', 2023, NULL, 500, 'parallel_twin', ARRAY['bobber'])
ON CONFLICT (brand_id, slug) DO NOTHING;

-- ============================================================
-- SUZUKI
-- ============================================================

INSERT INTO base_bikes (brand_id, model, slug, year_from, year_to, engine_cc, engine_type, custom_styles) VALUES
  ((SELECT id FROM base_bike_brands WHERE slug = 'suzuki'), 'GS 400 / GS 550 / GS 650 / GS 750 / GS 1000', 'gs-400-550-650-750-1000', 1976, 1985, 1000, 'inline_four', ARRAY['cafe_racer']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'suzuki'), 'GT 380 / GT 550 / GT 750', 'gt-380-550-750', 1971, 1977, 750, 'two_stroke', ARRAY['cafe_racer']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'suzuki'), 'T 350 / T 500 Titan', 't-350-500-titan', 1967, 1977, 500, 'two_stroke', ARRAY['cafe_racer']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'suzuki'), 'GN 125 / GN 250', 'gn-125-250', 1982, 2001, 250, 'single', ARRAY['tracker', 'scrambler']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'suzuki'), 'Bandit 600 / Bandit 1200', 'bandit-600-1200', 1995, 2006, 1200, 'inline_four', ARRAY['cafe_racer', 'streetfighter']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'suzuki'), 'DR 350 / DR 650', 'dr-350-650', 1990, NULL, 650, 'single', ARRAY['scrambler']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'suzuki'), 'DR-Z 400', 'dr-z-400', 2000, NULL, 400, 'single', ARRAY['scrambler', 'supermoto']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'suzuki'), 'XF 650 Freewind', 'xf-650-freewind', 1997, 2002, 650, 'single', ARRAY['scrambler']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'suzuki'), 'SV 650', 'sv-650', 1999, NULL, 650, 'v_twin', ARRAY['cafe_racer', 'streetfighter']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'suzuki'), 'GSX-R 750 / GSX-R 1000', 'gsx-r-750-1000', 1985, NULL, 1000, 'inline_four', ARRAY['streetfighter']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'suzuki'), 'Boulevard C50 / M50 / M109R', 'boulevard-c50-m50-m109r', 2005, NULL, 1800, 'v_twin', ARRAY['bobber', 'chopper'])
ON CONFLICT (brand_id, slug) DO NOTHING;

-- ============================================================
-- BMW
-- ============================================================

INSERT INTO base_bikes (brand_id, model, slug, year_from, year_to, engine_cc, engine_type, custom_styles) VALUES
  ((SELECT id FROM base_bike_brands WHERE slug = 'bmw'), 'R 50 / R 60 / R 75 /5er-Reihe', 'r-50-60-75-5er', 1969, 1973, 750, 'flat_twin', ARRAY['cafe_racer']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'bmw'), 'R 80 / R 90 / R 100 /6er & /7er-Reihe', 'r-80-90-100-6er-7er', 1973, 1995, 1000, 'flat_twin', ARRAY['cafe_racer']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'bmw'), 'R 80 G/S / R 100 GS', 'r-80-gs-r-100-gs', 1980, 1994, 1000, 'flat_twin', ARRAY['scrambler']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'bmw'), 'R 80 R / R 100 R', 'r-80-r-r-100-r', 1991, 1995, 1000, 'flat_twin', ARRAY['cafe_racer', 'scrambler']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'bmw'), 'R 1100 R / R 1100 S / R 1100 GS', 'r-1100-r-s-gs', 1993, 2001, 1100, 'flat_twin', ARRAY['scrambler', 'streetfighter']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'bmw'), 'R 1150 R / R 1150 GS', 'r-1150-r-gs', 2000, 2005, 1150, 'flat_twin', ARRAY['scrambler', 'adventure']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'bmw'), 'R 1200 R', 'r-1200-r', 2006, 2014, 1200, 'flat_twin', ARRAY['streetfighter', 'scrambler']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'bmw'), 'K 75', 'k-75', 1985, 1995, 750, 'triple', ARRAY['cafe_racer']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'bmw'), 'K 100', 'k-100', 1982, 1996, 1000, 'inline_four', ARRAY['cafe_racer']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'bmw'), 'K 1100 / K 1200', 'k-1100-1200', 1992, 2008, 1200, 'inline_four', ARRAY['cafe_racer', 'streetfighter']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'bmw'), 'R nineT', 'r-ninet', 2014, NULL, 1170, 'flat_twin', ARRAY['cafe_racer', 'tracker', 'scrambler']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'bmw'), 'R nineT Scrambler', 'r-ninet-scrambler', 2016, NULL, 1170, 'flat_twin', ARRAY['scrambler']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'bmw'), 'R nineT Pure / Racer / Urban G/S', 'r-ninet-pure-racer-urban-gs', 2017, NULL, 1170, 'flat_twin', ARRAY['cafe_racer', 'scrambler']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'bmw'), 'R 12 / R 12 nineT', 'r-12-r-12-ninet', 2024, NULL, 1170, 'flat_twin', ARRAY['cafe_racer', 'scrambler']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'bmw'), 'R 18', 'r-18', 2020, NULL, 1800, 'flat_twin', ARRAY['bobber', 'chopper'])
ON CONFLICT (brand_id, slug) DO NOTHING;

-- ============================================================
-- TRIUMPH
-- ============================================================

INSERT INTO base_bikes (brand_id, model, slug, year_from, year_to, engine_cc, engine_type, custom_styles) VALUES
  ((SELECT id FROM base_bike_brands WHERE slug = 'triumph'), 'Bonneville T100 / T120 (modern)', 'bonneville-t100-t120-modern', 2001, NULL, 1200, 'parallel_twin', ARRAY['cafe_racer', 'scrambler', 'bobber']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'triumph'), 'Thruxton / Thruxton R / Thruxton 1200 RS', 'thruxton-r-1200-rs', 2004, NULL, 1200, 'parallel_twin', ARRAY['cafe_racer']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'triumph'), 'Scrambler 900 / Scrambler 1200', 'scrambler-900-1200', 2006, NULL, 1200, 'parallel_twin', ARRAY['scrambler']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'triumph'), 'Street Twin / Street Scrambler', 'street-twin-street-scrambler', 2016, NULL, 900, 'parallel_twin', ARRAY['scrambler', 'cafe_racer']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'triumph'), 'Speed Twin 900 / Speed Twin 1200', 'speed-twin-900-1200', 2019, NULL, 1200, 'parallel_twin', ARRAY['cafe_racer']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'triumph'), 'Bonneville Bobber / Bobber Black', 'bonneville-bobber-black', 2017, NULL, 1200, 'parallel_twin', ARRAY['bobber']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'triumph'), 'Tiger 900', 'tiger-900', 2020, NULL, 900, 'triple', ARRAY['scrambler', 'adventure']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'triumph'), 'Speed 400 / Scrambler 400 X', 'speed-400-scrambler-400-x', 2023, NULL, 400, 'single', ARRAY['scrambler', 'cafe_racer']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'triumph'), 'Bonneville T120 Vintage (1959-1983)', 'bonneville-t120-vintage', 1959, 1983, 650, 'parallel_twin', ARRAY['cafe_racer', 'scrambler']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'triumph'), 'Tiger T110 / Trophy T25', 'tiger-t110-trophy-t25', 1954, 1973, 650, 'parallel_twin', ARRAY['scrambler'])
ON CONFLICT (brand_id, slug) DO NOTHING;

-- ============================================================
-- HARLEY-DAVIDSON
-- ============================================================

INSERT INTO base_bikes (brand_id, model, slug, year_from, year_to, engine_cc, engine_type, custom_styles) VALUES
  ((SELECT id FROM base_bike_brands WHERE slug = 'harley-davidson'), 'Sportster Ironhead 883 / 1200 (1957-1985)', 'sportster-ironhead', 1957, 1985, 1200, 'v_twin', ARRAY['cafe_racer', 'tracker', 'bobber']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'harley-davidson'), 'Sportster Evolution 883 / 1200 (1986-2003)', 'sportster-evolution', 1986, 2003, 1200, 'v_twin', ARRAY['cafe_racer', 'tracker', 'bobber']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'harley-davidson'), 'Iron 883 / Forty-Eight / Roadster (2004-2021)', 'iron-883-forty-eight-roadster', 2004, 2021, 1200, 'v_twin', ARRAY['bobber', 'tracker', 'cafe_racer']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'harley-davidson'), 'Sportster S 1250 (2021+)', 'sportster-s-1250', 2021, NULL, 1250, 'v_twin', ARRAY['streetfighter']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'harley-davidson'), 'Dyna Street Bob / Wide Glide / Super Glide', 'dyna-street-bob-wide-glide', 1991, 2017, 1690, 'v_twin', ARRAY['bobber', 'chopper']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'harley-davidson'), 'Softail Standard / Slim / Heritage', 'softail-standard-slim-heritage', 1984, NULL, 1750, 'v_twin', ARRAY['bobber', 'chopper']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'harley-davidson'), 'Street Bob / Fat Bob (Softail)', 'street-bob-fat-bob-softail', 2018, NULL, 1750, 'v_twin', ARRAY['bobber']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'harley-davidson'), 'Breakout', 'breakout', 2013, NULL, 1870, 'v_twin', ARRAY['chopper', 'bobber']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'harley-davidson'), 'Panhead', 'panhead', 1948, 1965, 1200, 'v_twin', ARRAY['chopper', 'bobber']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'harley-davidson'), 'Shovelhead', 'shovelhead', 1966, 1984, 1340, 'v_twin', ARRAY['chopper', 'bobber']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'harley-davidson'), 'XR 750 / XR 1000', 'xr-750-1000', 1970, 1985, 1000, 'v_twin', ARRAY['tracker']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'harley-davidson'), 'XR 1200', 'xr-1200', 2008, 2012, 1200, 'v_twin', ARRAY['tracker', 'cafe_racer']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'harley-davidson'), 'Road King / Electra Glide', 'road-king-electra-glide', 1994, NULL, 1870, 'v_twin', ARRAY['bagger'])
ON CONFLICT (brand_id, slug) DO NOTHING;

-- ============================================================
-- MOTO GUZZI
-- ============================================================

INSERT INTO base_bikes (brand_id, model, slug, year_from, year_to, engine_cc, engine_type, custom_styles) VALUES
  ((SELECT id FROM base_bike_brands WHERE slug = 'moto-guzzi'), 'V7 Classic / Stone / Special / Racer 750', 'v7-classic-stone-special-racer-750', 2008, 2016, 750, 'v_twin', ARRAY['cafe_racer', 'scrambler', 'bobber']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'moto-guzzi'), 'V7 III Stone / Scrambler / Carbon 850', 'v7-iii-stone-scrambler-carbon-850', 2017, NULL, 850, 'v_twin', ARRAY['cafe_racer', 'scrambler']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'moto-guzzi'), 'V9 Bobber / V9 Roamer 853', 'v9-bobber-roamer-853', 2016, NULL, 853, 'v_twin', ARRAY['bobber', 'scrambler']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'moto-guzzi'), 'V85 TT', 'v85-tt', 2019, NULL, 850, 'v_twin', ARRAY['scrambler', 'adventure']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'moto-guzzi'), 'Le Mans I / II / III / IV', 'le-mans-i-ii-iii-iv', 1976, 1993, 850, 'v_twin', ARRAY['cafe_racer']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'moto-guzzi'), '850 T / 850 Le Mans', '850-t-850-le-mans', 1972, 1978, 850, 'v_twin', ARRAY['cafe_racer']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'moto-guzzi'), '1000 SP / SP3', '1000-sp-sp3', 1978, 1993, 1000, 'v_twin', ARRAY['cafe_racer']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'moto-guzzi'), 'California 1100 / 1400', 'california-1100-1400', 1971, NULL, 1400, 'v_twin', ARRAY['bobber', 'custom']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'moto-guzzi'), 'Griso 1100 / 1200', 'griso-1100-1200', 2005, 2015, 1200, 'v_twin', ARRAY['streetfighter', 'cafe_racer']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'moto-guzzi'), 'Breva 750 / Breva 1100', 'breva-750-1100', 2004, 2012, 1100, 'v_twin', ARRAY['cafe_racer', 'scrambler']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'moto-guzzi'), 'V35 / V50 / V65', 'v35-v50-v65', 1977, 1993, 650, 'v_twin', ARRAY['cafe_racer']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'moto-guzzi'), 'Nevada 750 / Nevada Classic', 'nevada-750-classic', 1989, 2015, 750, 'v_twin', ARRAY['bobber', 'custom']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'moto-guzzi'), 'Stelvio 1200', 'stelvio-1200', 2008, 2017, 1200, 'v_twin', ARRAY['adventure', 'scrambler'])
ON CONFLICT (brand_id, slug) DO NOTHING;

-- ============================================================
-- DUCATI
-- ============================================================

INSERT INTO base_bikes (brand_id, model, slug, year_from, year_to, engine_cc, engine_type, custom_styles) VALUES
  ((SELECT id FROM base_bike_brands WHERE slug = 'ducati'), 'Monster 400/600/620/696/796/900/1000/1100', 'monster-classic', 1993, 2015, 1100, 'v_twin', ARRAY['cafe_racer', 'streetfighter']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'ducati'), 'Monster 821 / 1200 (modern)', 'monster-821-1200-modern', 2014, NULL, 1200, 'v_twin', ARRAY['streetfighter']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'ducati'), '250 / 350 / 450 Scrambler Vintage (1962-1974)', 'scrambler-vintage', 1962, 1974, 450, 'single', ARRAY['scrambler']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'ducati'), 'SS 750 / SS 900 SuperSport', 'ss-750-900-supersport', 1975, 2007, 900, 'v_twin', ARRAY['cafe_racer']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'ducati'), '749 S / 999', '749-s-999', 2003, 2006, 999, 'v_twin', ARRAY['streetfighter', 'cafe_racer']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'ducati'), 'Scrambler Icon 800', 'scrambler-icon-800', 2015, NULL, 800, 'v_twin', ARRAY['scrambler', 'cafe_racer']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'ducati'), 'Scrambler Desert Sled', 'scrambler-desert-sled', 2017, NULL, 800, 'v_twin', ARRAY['scrambler']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'ducati'), 'Scrambler Full Throttle', 'scrambler-full-throttle', 2015, NULL, 800, 'v_twin', ARRAY['tracker']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'ducati'), 'Scrambler 1100 / Pro / Sport Pro', 'scrambler-1100-pro', 2018, NULL, 1100, 'v_twin', ARRAY['scrambler']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'ducati'), 'Pan America 1250 / Special', 'pan-america-1250', 2021, NULL, 1250, 'v_twin', ARRAY['adventure', 'scrambler'])
ON CONFLICT (brand_id, slug) DO NOTHING;

-- ============================================================
-- ROYAL ENFIELD
-- ============================================================

INSERT INTO base_bikes (brand_id, model, slug, year_from, year_to, engine_cc, engine_type, custom_styles) VALUES
  ((SELECT id FROM base_bike_brands WHERE slug = 'royal-enfield'), 'Bullet 350 / 500', 'bullet-350-500', 1932, 2020, 500, 'single', ARRAY['cafe_racer', 'scrambler', 'bobber']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'royal-enfield'), 'Classic 350 / 500', 'classic-350-500', 2009, NULL, 500, 'single', ARRAY['cafe_racer', 'scrambler', 'bobber']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'royal-enfield'), 'Continental GT 535 / GT 650', 'continental-gt-535-650', 2013, NULL, 650, 'parallel_twin', ARRAY['cafe_racer']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'royal-enfield'), 'Interceptor 650', 'interceptor-650', 2018, NULL, 650, 'parallel_twin', ARRAY['cafe_racer', 'scrambler', 'bobber']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'royal-enfield'), 'Himalayan 411 / 450', 'himalayan-411-450', 2016, NULL, 450, 'single', ARRAY['scrambler', 'adventure']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'royal-enfield'), 'Meteor 350', 'meteor-350', 2020, NULL, 350, 'single', ARRAY['bobber', 'cafe_racer']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'royal-enfield'), 'Super Meteor 650', 'super-meteor-650', 2023, NULL, 650, 'parallel_twin', ARRAY['bobber', 'cafe_racer']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'royal-enfield'), 'Thunderbird 350 / 500', 'thunderbird-350-500', 2002, 2019, 500, 'single', ARRAY['bobber'])
ON CONFLICT (brand_id, slug) DO NOTHING;

-- ============================================================
-- INDIAN
-- ============================================================

INSERT INTO base_bikes (brand_id, model, slug, year_from, year_to, engine_cc, engine_type, custom_styles) VALUES
  ((SELECT id FROM base_bike_brands WHERE slug = 'indian'), 'Scout / Scout Sixty', 'scout-scout-sixty', 2015, NULL, 1130, 'v_twin', ARRAY['bobber', 'cafe_racer']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'indian'), 'Scout Bobber', 'scout-bobber', 2018, NULL, 1130, 'v_twin', ARRAY['bobber']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'indian'), 'Chief Classic / Chief Dark Horse / Chief Vintage', 'chief-classic-dark-horse-vintage', 2014, NULL, 1890, 'v_twin', ARRAY['chopper', 'bobber']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'indian'), 'FTR 1200', 'ftr-1200', 2019, NULL, 1200, 'v_twin', ARRAY['tracker', 'streetfighter']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'indian'), 'Springfield / Roadmaster', 'springfield-roadmaster', 2016, NULL, 1890, 'v_twin', ARRAY['bagger'])
ON CONFLICT (brand_id, slug) DO NOTHING;

-- ============================================================
-- KTM
-- ============================================================

INSERT INTO base_bikes (brand_id, model, slug, year_from, year_to, engine_cc, engine_type, custom_styles) VALUES
  ((SELECT id FROM base_bike_brands WHERE slug = 'ktm'), 'Duke 125 / 200 / 390', 'duke-125-200-390', 2011, NULL, 390, 'single', ARRAY['tracker', 'scrambler', 'streetfighter']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'ktm'), 'Duke 690 / 790 / 890', 'duke-690-790-890', 2008, NULL, 890, 'parallel_twin', ARRAY['tracker', 'supermoto', 'streetfighter']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'ktm'), 'LC4 640', 'lc4-640', 1998, 2006, 640, 'single', ARRAY['tracker', 'scrambler', 'supermoto']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'ktm'), '990 SM / 950 SM Supermoto', '990-sm-950-sm-supermoto', 2005, 2013, 990, 'v_twin', ARRAY['supermoto']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'ktm'), '950 Adventure / 990 Adventure', '950-990-adventure', 2003, 2013, 990, 'v_twin', ARRAY['scrambler', 'adventure']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'ktm'), 'RC 390', 'rc-390', 2014, NULL, 390, 'single', ARRAY['cafe_racer'])
ON CONFLICT (brand_id, slug) DO NOTHING;

-- ============================================================
-- HUSQVARNA
-- ============================================================

INSERT INTO base_bikes (brand_id, model, slug, year_from, year_to, engine_cc, engine_type, custom_styles) VALUES
  ((SELECT id FROM base_bike_brands WHERE slug = 'husqvarna'), 'Vitpilen 401', 'vitpilen-401', 2017, NULL, 401, 'single', ARRAY['cafe_racer']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'husqvarna'), 'Vitpilen 701', 'vitpilen-701', 2017, NULL, 701, 'single', ARRAY['cafe_racer', 'tracker']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'husqvarna'), 'Svartpilen 401', 'svartpilen-401', 2018, NULL, 401, 'single', ARRAY['scrambler']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'husqvarna'), 'Svartpilen 701', 'svartpilen-701', 2019, NULL, 701, 'single', ARRAY['scrambler']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'husqvarna'), 'Norden 901', 'norden-901', 2022, NULL, 901, 'parallel_twin', ARRAY['adventure', 'scrambler'])
ON CONFLICT (brand_id, slug) DO NOTHING;

-- ============================================================
-- NORTON
-- ============================================================

INSERT INTO base_bikes (brand_id, model, slug, year_from, year_to, engine_cc, engine_type, custom_styles) VALUES
  ((SELECT id FROM base_bike_brands WHERE slug = 'norton'), 'Commando 750 / 850', 'commando-750-850', 1967, 1977, 850, 'parallel_twin', ARRAY['cafe_racer']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'norton'), 'Dominator / Model 88 / 99', 'dominator-model-88-99', 1949, 1966, 650, 'parallel_twin', ARRAY['cafe_racer'])
ON CONFLICT (brand_id, slug) DO NOTHING;

-- ============================================================
-- BSA
-- ============================================================

INSERT INTO base_bikes (brand_id, model, slug, year_from, year_to, engine_cc, engine_type, custom_styles) VALUES
  ((SELECT id FROM base_bike_brands WHERE slug = 'bsa'), 'B44 Victor / B50', 'b44-victor-b50', 1966, 1972, 500, 'single', ARRAY['scrambler', 'tracker']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'bsa'), 'A65 / A10 / A7', 'a65-a10-a7', 1946, 1972, 650, 'parallel_twin', ARRAY['cafe_racer']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'bsa'), 'Gold Star DBD34', 'gold-star-dbd34', 1938, 1963, 500, 'single', ARRAY['cafe_racer', 'scrambler'])
ON CONFLICT (brand_id, slug) DO NOTHING;

-- ============================================================
-- BENELLI
-- ============================================================

INSERT INTO base_bikes (brand_id, model, slug, year_from, year_to, engine_cc, engine_type, custom_styles) VALUES
  ((SELECT id FROM base_bike_brands WHERE slug = 'benelli'), '750 Sei', '750-sei', 1974, 1979, 750, 'inline_six', ARRAY['cafe_racer']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'benelli'), 'Leoncino 500 / 800', 'leoncino-500-800', 2017, NULL, 800, 'parallel_twin', ARRAY['scrambler']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'benelli'), 'TRK 502', 'trk-502', 2017, NULL, 500, 'parallel_twin', ARRAY['adventure', 'scrambler'])
ON CONFLICT (brand_id, slug) DO NOTHING;

-- ============================================================
-- MV AGUSTA
-- ============================================================

INSERT INTO base_bikes (brand_id, model, slug, year_from, year_to, engine_cc, engine_type, custom_styles) VALUES
  ((SELECT id FROM base_bike_brands WHERE slug = 'mv-agusta'), 'Brutale 750 / 910 / 1000', 'brutale-750-910-1000', 2000, NULL, 1000, 'inline_four', ARRAY['streetfighter']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'mv-agusta'), 'Dragster 800', 'dragster-800', 2014, NULL, 800, 'triple', ARRAY['streetfighter']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'mv-agusta'), 'Superveloce 800', 'superveloce-800', 2020, NULL, 800, 'triple', ARRAY['cafe_racer'])
ON CONFLICT (brand_id, slug) DO NOTHING;

-- ============================================================
-- LAVERDA
-- ============================================================

INSERT INTO base_bikes (brand_id, model, slug, year_from, year_to, engine_cc, engine_type, custom_styles) VALUES
  ((SELECT id FROM base_bike_brands WHERE slug = 'laverda'), 'Jota 981 / 1000', 'jota-981-1000', 1976, 1982, 1000, 'triple', ARRAY['cafe_racer']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'laverda'), '750 SF / 750 SFC', '750-sf-750-sfc', 1968, 1976, 750, 'parallel_twin', ARRAY['cafe_racer'])
ON CONFLICT (brand_id, slug) DO NOTHING;

-- ============================================================
-- SIMSON
-- ============================================================

INSERT INTO base_bikes (brand_id, model, slug, year_from, year_to, engine_cc, engine_type, custom_styles) VALUES
  ((SELECT id FROM base_bike_brands WHERE slug = 'simson'), 'S50 / S51', 's50-s51', 1975, 1991, 50, 'two_stroke', ARRAY['cafe_racer', 'brat']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'simson'), 'Schwalbe KR51', 'schwalbe-kr51', 1964, 1986, 50, 'two_stroke', ARRAY['cafe_racer', 'custom']),
  ((SELECT id FROM base_bike_brands WHERE slug = 'simson'), 'Star / Enduro', 'star-enduro', 1970, 1991, 50, 'two_stroke', ARRAY['scrambler'])
ON CONFLICT (brand_id, slug) DO NOTHING;

-- ============================================================
-- BULTACO
-- ============================================================

INSERT INTO base_bikes (brand_id, model, slug, year_from, year_to, engine_cc, engine_type, custom_styles) VALUES
  ((SELECT id FROM base_bike_brands WHERE slug = 'bultaco'), 'Metralla / Pursang', 'metralla-pursang', 1963, 1979, 350, 'two_stroke', ARRAY['tracker', 'scrambler'])
ON CONFLICT (brand_id, slug) DO NOTHING;
