-- ============================================================
-- 069: INTERMOT gallery images + YouTube aftermovies
-- Real INTERMOT 2024/2025 YouTube recaps + motorcycle fair imagery
-- ============================================================

UPDATE events
SET
  image = 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=1600&q=85',
  gallery_images = ARRAY[
    'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=1600&q=85',
    'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=1600&q=85',
    'https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?w=1600&q=85',
    'https://images.unsplash.com/photo-1601517394481-7e3236b6ab48?w=1600&q=85',
    'https://images.unsplash.com/photo-1535050264505-ba17be3ee504?w=1600&q=85',
    'https://images.unsplash.com/photo-1558980664-10ea3a99e668?w=1600&q=85',
    'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=1600&q=85',
    'https://images.unsplash.com/photo-1509668573-7ba76406d2a2?w=1600&q=85',
    'https://images.unsplash.com/photo-1580310614729-ccd69652491d?w=1600&q=85',
    'https://images.unsplash.com/photo-1547549082-6bc09f2049ae?w=1600&q=85',
    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1600&q=85',
    'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1600&q=85'
  ],
  videos = ARRAY[
    'https://www.youtube.com/watch?v=3fJWjgPnonk',
    'https://www.youtube.com/watch?v=TLhPMCjsiY4',
    'https://www.youtube.com/watch?v=dUHvNAvv5xs'
  ]
WHERE slug = 'intermot';
