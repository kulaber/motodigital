-- ============================================================
-- 067: Glemseck 101 real images + videos
-- Source: bikebound.com 2025 photo essay
-- ============================================================

UPDATE events
SET
  image = 'https://www.bikebound.com/wp-content/uploads/2025/10/Glemseck-101-2025-1.jpg',
  gallery_images = ARRAY[
    'https://www.bikebound.com/wp-content/uploads/2025/10/Glemseck-101-2025-3.jpg',
    'https://www.bikebound.com/wp-content/uploads/2025/10/Glemseck-101-2025-5.jpg',
    'https://www.bikebound.com/wp-content/uploads/2025/10/Glemseck-101-2025-10.jpg',
    'https://www.bikebound.com/wp-content/uploads/2025/10/Glemseck-101-2025-13.jpg',
    'https://www.bikebound.com/wp-content/uploads/2025/10/Glemseck-101-2025-15.jpg',
    'https://www.bikebound.com/wp-content/uploads/2025/10/Glemseck-101-2025-18.jpg',
    'https://www.bikebound.com/wp-content/uploads/2025/10/Glemseck-101-2025-20.jpg',
    'https://www.bikebound.com/wp-content/uploads/2025/10/Glemseck-101-2025-22.jpg',
    'https://www.bikebound.com/wp-content/uploads/2025/10/Glemseck-101-2025-25.jpg',
    'https://www.bikebound.com/wp-content/uploads/2025/10/Glemseck-101-2025-28.jpg',
    'https://www.bikebound.com/wp-content/uploads/2025/10/Glemseck-101-2025-30.jpg',
    'https://www.bikebound.com/wp-content/uploads/2025/10/Glemseck-101-2025-33.jpg',
    'https://www.bikebound.com/wp-content/uploads/2025/10/Glemseck-101-2025-36.jpg',
    'https://www.bikebound.com/wp-content/uploads/2025/10/Glemseck-101-2025-39.jpg'
  ],
  videos = ARRAY[
    'https://www.youtube.com/watch?v=UuweuucuozU',
    'https://www.youtube.com/watch?v=ofj-56Noa6c',
    'https://www.youtube.com/watch?v=AUnj8tGhKZk'
  ]
WHERE slug = 'glemseck-101';
