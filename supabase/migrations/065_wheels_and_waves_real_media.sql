-- ============================================================
-- 065: Use real Wheels & Waves images (sourced from official site)
-- ============================================================

UPDATE events
SET
  image = 'https://wheels-and-waves.com/wp-content/uploads/2025/11/wheels-and-waves-biarritz-2026-1.jpg',
  gallery_images = ARRAY[
    'https://wheels-and-waves.com/wp-content/uploads/2025/12/WHEELS-AND-WAVES-Brian-Bent08-1024x682.webp',
    'https://wheels-and-waves.com/wp-content/uploads/2026/01/Punks-Peak_Wheels-and-Waves-TL_01627-1536x864.webp',
    'https://wheels-and-waves.com/wp-content/uploads/2025/03/surf-wheels-and-waves-2025.jpg',
    'https://wheels-and-waves.com/wp-content/uploads/2026/01/Enduro-Wheels-and-Waves-@AZUSPRODUCTION2145-1536x864.webp',
    'https://wheels-and-waves.com/wp-content/uploads/2022/01/VILLAGE-WHEELS-AND-WAVES-CHLOE-DAUMAL-1024x683.webp',
    'https://wheels-and-waves.com/wp-content/uploads/2025/03/skate-wheels-and-waves-2025.jpg',
    'https://wheels-and-waves.com/wp-content/uploads/2025/08/EL-ROLLO-WHEELS-AND-WAVES-J3_@clementsignoles_OK7-1-1024x683.jpg',
    'https://wheels-and-waves.com/wp-content/uploads/2025/12/BMW-WHEELS-AND-WAVES-Jenny_BARICAULT_@sunrise.etc_Village-15-683x1024.webp',
    'https://wheels-and-waves.com/wp-content/uploads/2026/01/Artride-Wheels-and-Waves-@sunrise.etc_-1536x864.webp',
    'https://wheels-and-waves.com/wp-content/uploads/2025/03/trotl-2025-wheels-and-waves.jpg',
    'https://wheels-and-waves.com/wp-content/uploads/2026/01/RIDE-WHEELS-ANDS-WAVES-2026-D.MARVIER-SMALL-1536x864.webp',
    'https://wheels-and-waves.com/wp-content/uploads/2026/03/Village-wheels-and-waves-biarritz-rene-gaens-.jpg'
  ]
WHERE slug = 'wheels-and-waves';
