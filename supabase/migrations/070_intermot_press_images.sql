-- ============================================================
-- 070: Replace INTERMOT placeholder gallery with real press images
-- Source: Koelnmesse Bilddatenbank (intermot.de /presse/multimedia/bilddatenbank/)
-- Logo explicitly excluded per request.
-- ============================================================

UPDATE events
SET
  image = 'https://koelnmesse.omn-cloud.com/servlet/downloadByCDN?filePath=/ISY3/Shop/Intermot/intermot_25_013_015.jpg',
  gallery_images = ARRAY[
    'https://koelnmesse.omn-cloud.com/servlet/downloadByCDN?filePath=/ISY3/Shop/Intermot/intermot_25_013_015.jpg',
    'https://koelnmesse.omn-cloud.com/servlet/downloadByCDN?filePath=/ISY3/Shop/Intermot/intermot_25_013_010.jpg',
    'https://koelnmesse.omn-cloud.com/servlet/downloadByCDN?filePath=/ISY3/Shop/Intermot/intermot_25_013_016.jpg',
    'https://koelnmesse.omn-cloud.com/servlet/downloadByCDN?filePath=/ISY3/Shop/Intermot/intermot_25_013_041.jpg',
    'https://koelnmesse.omn-cloud.com/servlet/downloadByCDN?filePath=/ISY3/Shop/Intermot/intermot_25_018_008.jpg',
    'https://koelnmesse.omn-cloud.com/servlet/downloadByCDN?filePath=/ISY3/Shop/Intermot/intermot_25_023_069.jpg',
    'https://koelnmesse.omn-cloud.com/servlet/downloadByCDN?filePath=/ISY3/Shop/Intermot/intermot_25_023_065.jpg',
    'https://koelnmesse.omn-cloud.com/servlet/downloadByCDN?filePath=/ISY3/Shop/Intermot/intermot_25_023_046.jpg',
    'https://koelnmesse.omn-cloud.com/servlet/downloadByCDN?filePath=/ISY3/Shop/Intermot/intermot_25_023_032.jpg',
    'https://koelnmesse.omn-cloud.com/servlet/downloadByCDN?filePath=/ISY3/Shop/Intermot/intermot_25_023_030.jpg',
    'https://koelnmesse.omn-cloud.com/servlet/downloadByCDN?filePath=/ISY3/Shop/Intermot/intermot_25_019_013.jpg',
    'https://koelnmesse.omn-cloud.com/servlet/downloadByCDN?filePath=/ISY3/Shop/Intermot/intermot_25_019_016.jpg',
    'https://koelnmesse.omn-cloud.com/servlet/downloadByCDN?filePath=/ISY3/Shop/Intermot/intermot_25_018_040.jpg',
    'https://koelnmesse.omn-cloud.com/servlet/downloadByCDN?filePath=/ISY3/Shop/Intermot/intermot_25_018_036.jpg',
    'https://koelnmesse.omn-cloud.com/servlet/downloadByCDN?filePath=/ISY3/Shop/Intermot/intermot_25_018_017.jpg',
    'https://koelnmesse.omn-cloud.com/servlet/downloadByCDN?filePath=/ISY3/Shop/Intermot/intermot_25_018_016.jpg',
    'https://koelnmesse.omn-cloud.com/servlet/downloadByCDN?filePath=/ISY3/Shop/Intermot/intermot_25_018_007.jpg'
  ]
WHERE slug = 'intermot';
