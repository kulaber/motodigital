-- ============================================================
-- 071: Eindhoven Motor Show — real description + press images
-- Source: wwag.com/de/matchlight-show-eindhoven-nl (Matchlight Show)
-- ============================================================

UPDATE events
SET
  description = 'Im kreativen Strijp-S Viertel, einer ehemaligen Philips-Produktionshalle, feiert die Matchlight Motorcycle Show erstklassige Harley-Highlights, handwerkliche Höchstleistungen und Custom-Können vom Gesamtkunstwerk bis zum grandiosen Detail. Dazu luftig verteilte Stände für Kleidung, Kunst und Deko – und auf dem Freigelände jede Menge Bikes zwischen Feelgood-Angeboten für Magen und Augen.',
  image = 'https://www.wwag.com/step3/1000jpg/276657.jpg',
  gallery_images = ARRAY[
    'https://www.wwag.com/step3/1000jpg/276657.jpg',
    'https://www.wwag.com/step3/1000jpg/276633.jpg',
    'https://www.wwag.com/step3/1000jpg/276634.jpg',
    'https://www.wwag.com/step3/1000jpg/276635.jpg',
    'https://www.wwag.com/step3/1000jpg/276636.jpg',
    'https://www.wwag.com/step3/1000jpg/276637.jpg',
    'https://www.wwag.com/step3/1000jpg/276638.jpg',
    'https://www.wwag.com/step3/1000jpg/276639.jpg',
    'https://www.wwag.com/step3/1000jpg/276640.jpg',
    'https://www.wwag.com/step3/1000jpg/276641.jpg',
    'https://www.wwag.com/step3/1000jpg/276642.jpg',
    'https://www.wwag.com/step3/1000jpg/276643.jpg',
    'https://www.wwag.com/step3/1000jpg/276644.jpg',
    'https://www.wwag.com/step3/1000jpg/276645.jpg',
    'https://www.wwag.com/step3/1000jpg/276646.jpg',
    'https://www.wwag.com/step3/1000jpg/276647.jpg',
    'https://www.wwag.com/step3/1000jpg/276648.jpg',
    'https://www.wwag.com/step3/1000jpg/276649.jpg',
    'https://www.wwag.com/step3/1000jpg/276650.jpg',
    'https://www.wwag.com/step3/1000jpg/276651.jpg',
    'https://www.wwag.com/step3/1000jpg/276652.jpg',
    'https://www.wwag.com/step3/1000jpg/276653.jpg',
    'https://www.wwag.com/step3/1000jpg/276654.jpg',
    'https://www.wwag.com/step3/1000jpg/276655.jpg',
    'https://www.wwag.com/step3/1000jpg/276656.jpg'
  ]
WHERE slug = 'eindhoven-motor-show';
