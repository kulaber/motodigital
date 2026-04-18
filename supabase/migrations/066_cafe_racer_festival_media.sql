-- ============================================================
-- 066: Cafe Racer Festival real images
-- Source: badandbold.com blog post
-- ============================================================

UPDATE events
SET
  image = 'https://badandbold.com/cdn/shop/articles/66db1fc1b7e2ed96414f9bb53d3307b9.jpg',
  gallery_images = ARRAY[
    'https://cdn.shopify.com/s/files/1/0208/2802/8977/files/BadandBold_Cafe_Racer_Festival_Paris-1.jpeg',
    'https://cdn.shopify.com/s/files/1/0208/2802/8977/files/BadandBold_Cafe_Racer_Festival_Paris-2.jpeg',
    'https://cdn.shopify.com/s/files/1/0208/2802/8977/files/BadandBold_Cafe_Racer_Festival_Paris-3.jpeg',
    'https://cdn.shopify.com/s/files/1/0208/2802/8977/files/BadandBold_Cafe_Racer_Festival_Paris-5.jpeg',
    'https://cdn.shopify.com/s/files/1/0208/2802/8977/files/BadandBold_Cafe_Racer_Festival_Paris-6.jpeg',
    'https://cdn.shopify.com/s/files/1/0208/2802/8977/files/BadandBold_Cafe_Racer_Festival_Paris-7.jpeg',
    'https://cdn.shopify.com/s/files/1/0208/2802/8977/files/BadandBold_Cafe_Racer_Festival_Paris-9.jpeg',
    'https://cdn.shopify.com/s/files/1/0208/2802/8977/files/BadandBold_Cafe_Racer_Festival_Paris-11.jpeg',
    'https://cdn.shopify.com/s/files/1/0208/2802/8977/files/BadandBold_Cafe_Racer_Festival_Paris-13.jpeg',
    'https://cdn.shopify.com/s/files/1/0208/2802/8977/files/BadandBold_Cafe_Racer_Festival_Paris-15.jpeg',
    'https://cdn.shopify.com/s/files/1/0208/2802/8977/files/BadandBold_Cafe_Racer_Festival_Paris-17.jpeg',
    'https://cdn.shopify.com/s/files/1/0208/2802/8977/files/BadandBold_Cafe_Racer_Festival_Paris-19.jpeg',
    'https://cdn.shopify.com/s/files/1/0208/2802/8977/files/BadandBold_Cafe_Racer_Festival_Paris-20.jpeg',
    'https://cdn.shopify.com/s/files/1/0208/2802/8977/files/BadandBold_Cafe_Racer_Festival_Paris-21.jpeg',
    'https://cdn.shopify.com/s/files/1/0208/2802/8977/files/BadandBold_Cafe_Racer_Festival_Paris-26.jpeg'
  ]
WHERE slug = 'cafe-racer-festival';
