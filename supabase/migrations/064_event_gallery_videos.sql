-- ============================================================
-- 064: Add gallery_images and videos to events table
-- ============================================================

ALTER TABLE events ADD COLUMN IF NOT EXISTS gallery_images text[] NOT NULL DEFAULT '{}';
ALTER TABLE events ADD COLUMN IF NOT EXISTS videos text[] NOT NULL DEFAULT '{}';

COMMENT ON COLUMN events.gallery_images IS 'Array of gallery image URLs (Cloudinary or external) for the event detail page';
COMMENT ON COLUMN events.videos IS 'Array of YouTube/Vimeo video URLs for the event detail page';

-- ── Seed Wheels & Waves with gallery + videos ────────────────
UPDATE events
SET
  gallery_images = ARRAY[
    'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=1600&q=85',
    'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=1600&q=85',
    'https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?w=1600&q=85',
    'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=1600&q=85',
    'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=1600&q=85',
    'https://images.unsplash.com/photo-1511994298241-608e28f14fde?w=1600&q=85',
    'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=1600&q=85',
    'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1600&q=85',
    'https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=1600&q=85',
    'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=1600&q=85',
    'https://images.unsplash.com/photo-1601517394481-7e3236b6ab48?w=1600&q=85',
    'https://images.unsplash.com/photo-1558980664-10ea3a99e668?w=1600&q=85'
  ],
  videos = ARRAY[
    'https://www.youtube.com/watch?v=_mWlnka16qQ',
    'https://www.youtube.com/watch?v=UY8WynHrgWM',
    'https://www.youtube.com/watch?v=F9c4CcG7pTE'
  ]
WHERE slug = 'wheels-and-waves';
