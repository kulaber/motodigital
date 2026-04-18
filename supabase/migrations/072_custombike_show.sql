-- ============================================================
-- 072: Custombike Show Bad Salzuflen — add event + real media
-- Source: custombike-show.de (offizielle Presse- und Eventfotos)
-- ============================================================

INSERT INTO events (
  slug, name, date_start, date_end, location, description, tags, url, image,
  gallery_images, videos
) VALUES (
  'custombike-show',
  'Custombike Show',
  '2026-11-27',
  '2026-11-29',
  'Bad Salzuflen, Deutschland',
  'Die größte Messe für umgebaute Motorräder und Zubehör findet jährlich im Messezentrum Bad Salzuflen statt. Amateure und Profis präsentieren ihre Unikate in vierzehn Kategorien und kämpfen bei der European Custombike Championship um hohe Preisgelder. Dazu: Händler, Zubehör, Liveshows und die geballte Szene unter einem Dach — Pflichttermin für jeden Custom-Fan in Europa.',
  ARRAY['Messe', 'Custom', 'Championship', 'Indoor'],
  'https://www.custombike-show.de/',
  'https://www.custombike-show.de/wp-content/uploads/Custombike-Show-2024-by-Dirk-Behlau-7623-scaled.jpg',
  ARRAY[
    'https://www.custombike-show.de/wp-content/uploads/Custombike-Show-2024-by-Dirk-Behlau-7623-scaled.jpg',
    'https://www.custombike-show.de/wp-content/uploads/20221204_FAB_CBS_04803-1024x768.jpg',
    'https://www.custombike-show.de/wp-content/uploads/20221202_FAB_CBS_00876_Easy-Resize.com_-2-1024x682.jpg',
    'https://www.custombike-show.de/wp-content/uploads/VIP-KK-2-1024x768.jpg',
    'https://www.custombike-show.de/wp-content/uploads/Rookie-of-the-year-1-1024x768.jpg',
    'https://www.custombike-show.de/wp-content/uploads/Premiere-1-1024x768.jpg',
    'https://www.custombike-show.de/wp-content/uploads/Clubstyle-2-1-1024x768.png',
    'https://www.custombike-show.de/wp-content/uploads/p1-1-1024x768.png'
  ],
  ARRAY[
    'https://www.youtube.com/watch?v=AQX0LAySys0',
    'https://www.youtube.com/watch?v=Yy9p12mp6VE',
    'https://www.youtube.com/watch?v=hnfzHP1Mbfo'
  ]
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  date_start = EXCLUDED.date_start,
  date_end = EXCLUDED.date_end,
  location = EXCLUDED.location,
  description = EXCLUDED.description,
  tags = EXCLUDED.tags,
  url = EXCLUDED.url,
  image = EXCLUDED.image,
  gallery_images = EXCLUDED.gallery_images,
  videos = EXCLUDED.videos;
