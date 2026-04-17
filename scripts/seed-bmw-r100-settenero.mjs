#!/usr/bin/env node
/**
 * Seed script: Create BMW R100 "Soffio" by Settenero Motorcycles as superadmin.
 * No workshop link (workshop_id = null).
 * Source: https://www.bikeexif.com/bmw-r100-settenero
 * Run: node scripts/seed-bmw-r100-settenero.mjs
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// ── Load .env.local ──────────────────────────────────────────────────
const envPath = path.resolve(__dirname, '..', '.env.local')
const envContent = fs.readFileSync(envPath, 'utf8')
const env = {}
for (const line of envContent.split('\n')) {
  const match = line.match(/^([^=]+)=\s*(.*)$/)
  if (match) env[match[1].trim()] = match[2].trim()
}

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// ── Superadmin seller ────────────────────────────────────────────────
const SUPERADMIN_ID = '0103433a-8c28-4867-8602-e1d00f5f8ca6'

// ── Bike data ────────────────────────────────────────────────────────
const BIKE = {
  seller_id: SUPERADMIN_ID,
  workshop_id: null,
  title: 'BMW R100 "Soffio" — Settenero Motorcycles',
  make: 'BMW Motorrad',
  model: 'R100',
  year: 1982,
  style: 'cafe_racer',
  cc: 1070,
  mileage_km: null,
  description: `"Soffio" — italienisch für "leichter Hauch Luft" — entstand in London bei Settenero Motorcycles, einem Zwei-Mann-Studio aus dem italienischen Möbelbauer Andrea Felice und dem englischen Bildhauer/Metallverarbeiter Simon Black. Die beiden bauen Motorräder aus reiner Leidenschaft — nie auf Auftrag.

Basis: eine 1982er BMW R100, die konsequent von Grund auf neu gedacht wurde. Der Boxer wurde mit einem Siebenrock 1.070 cc Big-Bore-Kit erweitert, die Zylinderköpfe kanalarbeiten, auf Twin-Spark umgebaut und mit 38 mm Dell'Orto-Vergasern bestückt. Der gesamte Antriebsstrang wurde neu aufgebaut.

Fahrwerk: die Vordergabel stammt aus einer späteren BMW R1100, ebenso das 19" Vorderrad. Das 18" Hinterrad ist original, beide wurden mit Edelstahl-Speichen neu eingespeicht. Hinten sitzt ein Hagon Mono-Federbein in einer maßgefertigten Schwingen-Konstruktion.

Das Herzstück ist die komplett handgefertigte Aluminium-Karosserie: eine kompakte Verkleidung, die den Tank flankiert, ein handgefertigtes Cowl-Heck auf einem neuen Heckrahmen, und eine maßgeschneiderte Windschutzscheibe — für die es sieben Prototypen brauchte, bis die Form stimmte.

Cockpit: CNC-gefräste obere Gabelbrücke, Motogadget-Tacho in die Verkleidung gefrenched, Daytona-Drehzahlmesser in handgefertigter Halterung, tief montierte Renthal Clip-Ons, Motogadget-Schalter und -Blinker, Dummy-Lights. Elektrik komplett neu mit einer Motogadget mo.unit.

Finish: nackter Metall-Look am Motor, glänzendes Grau an der Karosserie, handgenähter Ledersitz von Bespoke Leather London. Rahmen: cleane ästhetische Linien, die die typischen Café-Racer-Konventionen bewusst meiden — warme Grautöne, fließende Silhouette, das Gefühl von Leichtigkeit.`,
  modifications: [
    'Siebenrock 1.070 cc Big-Bore-Kit',
    'Zylinderköpfe kanalarbeitet und optimiert',
    'Twin-Spark-Umbau',
    '38 mm Dell\'Orto Vergaser',
    'Kompletter Antriebsstrang neu aufgebaut',
    'BMW R1100 Vordergabel',
    'Hagon Mono-Federbein in Custom-Arrangement',
    '19" Vorderrad (R1100) neu mit Edelstahl-Speichen',
    '18" Hinterrad (Original) neu mit Edelstahl-Speichen',
    'Komplett handgefertigte Aluminium-Karosserie',
    'Kompakte Verkleidung mit flankierendem Tank-Design',
    'Handgefertigtes Cowl-Heck auf Custom-Heckrahmen',
    'Einzelstück-Windschutzscheibe (sieben Prototypen)',
    'Maßgefertigte Aluminium Rear-Sets',
    'Edelstahl-Auspuffanlage',
    'Maßgefertigter Edelstahl-Seitenständer',
    'CNC-gefräste obere Gabelbrücke',
    'Motogadget Tacho in Verkleidung integriert (Frenched)',
    'Daytona Drehzahlmesser in handgefertigter Halterung',
    'Renthal Clip-On Stummellenker',
    'Motogadget Schalter und Blinker',
    'Dummy-Lights im Cockpit',
    'Motogadget mo.unit Controller',
    'Elektrik komplett neu verlegt',
    'Motor in nacktem Metall-Finish',
    'Karosserie in glänzendem Grau lackiert',
    'Sitz handgenäht von Bespoke Leather London',
  ],
  status: 'active',
  is_verified: false,
  listing_type: 'showcase',
  price: 0,
  price_amount: null,
  price_on_request: false,
  city: null,
  lat: null,
  lng: null,
}

const IMAGE_URLS = [
  'https://images.bikeexif.com/2026/01/bmw-r100-sette-nero.jpg?v=1769631977',
  'https://images.bikeexif.com/2026/01/bmw-r100-sette-nero-3.jpg?v=1769631969',
  'https://images.bikeexif.com/2026/01/bmw-r100-sette-nero-1.jpg?v=1769631967',
  'https://images.bikeexif.com/2026/01/bmw-r100-sette-nero-5.jpg?v=1769631971',
  'https://images.bikeexif.com/2026/01/bmw-r100-sette-nero-8.jpg?v=1769631973',
  'https://images.bikeexif.com/2026/01/bmw-r100-sette-nero-12.jpg?v=1769631976',
  'https://images.bikeexif.com/2026/01/bmw-r100-sette-nero-2.jpg?v=1769631969',
  'https://images.bikeexif.com/2026/01/bmw-r100-sette-nero-4.jpg?v=1769631970',
]

// ── Slug generator (mirrors src/lib/utils/bikeSlug.ts) ───────────────
function generateBikeSlug(title) {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// ── Helpers ──────────────────────────────────────────────────────────
async function downloadImage(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MotoDigital-Seed/1.0)' },
  })
  if (!res.ok) throw new Error(`Download failed ${url}: ${res.status}`)
  const buffer = Buffer.from(await res.arrayBuffer())
  const contentType = res.headers.get('content-type') || 'image/jpeg'
  return { buffer, contentType }
}

// ── Main ─────────────────────────────────────────────────────────────
async function main() {
  console.log('Creating BMW R100 "Soffio" — Settenero Motorcycles bike as superadmin...\n')

  const baseSlug = generateBikeSlug(BIKE.title)
  const { data: existing } = await admin
    .from('bikes')
    .select('id, slug')
    .eq('slug', baseSlug)
    .maybeSingle()

  if (existing) {
    console.log(`Bike with slug "${baseSlug}" already exists (id: ${existing.id}). Aborting.`)
    process.exit(0)
  }

  // 1. Insert bike record
  const { data: bike, error: insertError } = await admin
    .from('bikes')
    .insert({
      seller_id:        BIKE.seller_id,
      workshop_id:      BIKE.workshop_id,
      title:            BIKE.title,
      make:             BIKE.make,
      model:            BIKE.model,
      year:             BIKE.year,
      style:            BIKE.style,
      cc:               BIKE.cc,
      mileage_km:       BIKE.mileage_km,
      price:            BIKE.price,
      city:             BIKE.city,
      lat:              BIKE.lat,
      lng:              BIKE.lng,
      description:      BIKE.description,
      modifications:    BIKE.modifications,
      status:           BIKE.status,
      is_verified:      BIKE.is_verified,
      listing_type:     BIKE.listing_type,
      price_amount:     BIKE.price_amount,
      price_on_request: BIKE.price_on_request,
    })
    .select('id')
    .maybeSingle()

  if (insertError || !bike) {
    console.error('Bike insert failed:', insertError?.message)
    process.exit(1)
  }

  const bikeId = bike.id
  console.log(`Bike inserted: ${bikeId}`)

  // 2. Set slug
  const slug = generateBikeSlug(BIKE.title)
  await admin.from('bikes').update({ slug }).eq('id', bikeId)
  console.log(`Slug set: ${slug}\n`)

  // 3. Upload images
  console.log(`Uploading ${IMAGE_URLS.length} images to bike-images bucket...`)
  for (let i = 0; i < IMAGE_URLS.length; i++) {
    const url = IMAGE_URLS[i]
    try {
      const { buffer, contentType } = await downloadImage(url)
      const ext = contentType.includes('png') ? 'png' : contentType.includes('webp') ? 'webp' : 'jpg'
      const storagePath = `${BIKE.seller_id}/${bikeId}/${i}.${ext}`

      const { error: uploadError } = await admin.storage
        .from('bike-images')
        .upload(storagePath, buffer, { contentType, upsert: true })

      if (uploadError) throw new Error(uploadError.message)

      const { data: { publicUrl } } = admin.storage
        .from('bike-images')
        .getPublicUrl(storagePath)

      const { error: mediaInsertError } = await admin
        .from('bike_images')
        .insert({
          bike_id: bikeId,
          url: publicUrl,
          position: i,
          is_cover: i === 0,
          media_type: 'image',
          thumbnail_url: null,
        })

      if (mediaInsertError) throw new Error(`bike_images insert: ${mediaInsertError.message}`)

      console.log(`  [${i + 1}/${IMAGE_URLS.length}] ${storagePath}`)
    } catch (e) {
      console.warn(`  [${i + 1}] FAILED — ${e.message}`)
    }
  }

  console.log(`\n✓ Done.`)
  console.log(`  Bike ID: ${bikeId}`)
  console.log(`  Slug:    ${slug}`)
  console.log(`  URL:     /bikes/${slug}`)
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
