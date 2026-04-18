-- ============================================================
-- 068: INTERMOT real data from intermot.de
-- 2026 edition cancelled — next edition 19–21 Feb 2027 in Cologne
-- ============================================================

UPDATE events
SET
  name        = 'INTERMOT',
  date_start  = '2027-02-19',
  date_end    = '2027-02-21',
  location    = 'Koelnmesse, Köln, Deutschland',
  description = 'Die internationale Leitmesse für Motorrad, Roller und E-Bike in Köln. Nach der Absage 2026 kehrt die INTERMOT im Februar 2027 als kompakter Saisonauftakt zurück: drei Tage, vier Hallen, Hersteller-Neuheiten und Zubehörwelt unter einem Dach. Mit dabei u. a. BMW Motorrad, Honda, Horex, Royal Enfield, Yamaha, Zero Motorcycles sowie Marken wie Motul, Pirelli und Stadler Motorradbekleidung. Veranstaltet vom Industrie-Verband Motorrad-Deutschland (IVM) und der Koelnmesse.',
  tags        = ARRAY['Messe', 'Neuheiten', 'Saisonauftakt'],
  url         = 'https://www.intermot.de/'
WHERE slug = 'intermot';
