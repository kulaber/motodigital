#!/usr/bin/env node
/**
 * Seed script: Create BMW K1100RS Café Racer by Powerbrick as superadmin.
 * No workshop link (workshop_id = null).
 * Source: https://www.bikeexif.com/bmw-k1100rs-cafe-racer-powerbrick
 * Run: node scripts/seed-bmw-k1100rs-powerbrick.mjs
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
  title: 'BMW K1100RS Café Racer — Powerbrick',
  make: 'BMW Motorrad',
  model: 'K1100RS',
  year: 1993,
  style: 'cafe_racer',
  cc: 1092,
  mileage_km: null,
  description: `Powerbrick aus den Niederlanden — der K-Modell-Spezialist schlechthin — hat den klassischen 90er BMW K1100RS Sport-Tourer in einen messerscharfen modernen Café Racer verwandelt. Hinter dem Projekt steht Gründer Tim Somers, der retro Stilelemente mit kompromissloser Contemporary-Performance verheiratet.

Herzstück: der horizontal liegende Vierzylinder-Reihenmotor mit 1.092 cm³. Komplett überholt, Köpfe kanalisiert, NGK-Zündanlage, Bosch-Einspritzdüsen, RC Racing Aluminium-Kühler, Samco-Schläuche mit roten Akzenten, individuell gebrandete DNA-Luftfilter, handgeschweißter Edelstahl 4-in-1-Krümmer und ein Powerbrick-Custom-Endschalldämpfer.

Fahrwerk komplett neu interpretiert: vorne die kompletten S1000RR-Gabeln mit rot eloxierten Öhlins NIX30 Cartridges, dazu schwarz eloxierte Powerbrick-Aluminium-Gabelbrücken. Hinten ein maßgefertigter TFX Suspension Dämpfer mit rotem Feder und voll einstellbar. Gefahren wird auf geschmiedeten Rotobox Carbon-Felgen, die Bremsanlage komplett von Brembo mit Venhill Stahlflex-Leitungen.

Der Heckrahmen wurde aus einem 100 kg (220 lbs) Aluminium-Billet CNC-gefräst und auf den Hauptrahmen geschweißt. Die komplette Verkleidung — vorne und hinten — ist ein 3D-gedruckter Carbon-Composite-Aufbau mit Metalflake-Grau lackiert von Royal Kustom Works, individuellen monochromen BMW-Rondellen und einem konisch zulaufenden Heck-Cowl mit integrierter LED-Rückleuchte und Blinkern.

Cockpit: Motogadget Motoscope Pro Tacho, Motogadget Steuerbox mit schlüsselloser Zündung, hinterleuchtete Motogadget-Schalter, Domino Gasgriff, Biltwell Griffe, Powerbrick Fußrasten, Brembo Handpumpen mit AEM-Behältern. NOCO Lithium-Batterie mit CTEK Lade-Management. Sitzbezug von Jeroen Bouwmeester (Silver Machine).`,
  modifications: [
    'K1100 Reihenvierzylinder komplett überholt',
    'Zylinderköpfe kanalisiert',
    'NGK Zündanlage',
    'Bosch Einspritzdüsen',
    'RC Racing Aluminium-Kühler',
    'Samco Schläuche mit roten Akzenten',
    'DNA Luftfilter (Custom-branded)',
    'Handgeschweißter Edelstahl 4-in-1 Krümmer',
    'Powerbrick Custom-Endschalldämpfer',
    'BMW S1000RR Vordergabel',
    'Öhlins NIX30 Cartridges (rot eloxiert)',
    'Powerbrick Aluminium-Gabelbrücken (schwarz eloxiert)',
    'TFX Suspension Federbein hinten (rote Feder, voll einstellbar)',
    'Rotobox geschmiedete Carbon-Räder',
    'Brembo Bremsanlage komplett',
    'Venhill Stahlflex-Leitungen',
    'CNC-gefräster Heckrahmen aus 100 kg Aluminium-Billet',
    '3D-gedruckte Carbon-Composite Verkleidung vorne und hinten',
    'Koso LED-Scheinwerfer mit CNC-Halterung',
    'LED-Blinker in Verkleidungsflanken eingelassen',
    'Metalflake Grey Lackierung (Royal Kustom Works)',
    'Monochrome BMW Rondelle',
    'Konisches Heck-Cowl mit integrierter LED-Rückleuchte + Blinkern',
    'Sitzbezug von Jeroen Bouwmeester (Silver Machine)',
    'Motogadget Motoscope Pro Tacho',
    'Motogadget Steuerbox + schlüssellose Zündung',
    'Hinterleuchtete Motogadget Schalter',
    'Domino Gasgriff',
    'Biltwell Inc. Griffe',
    'Powerbrick Fußrasten',
    'Brembo Handpumpen mit AEM Ausgleichsbehältern',
    'NOCO Lithium-Batterie',
    'CTEK Batterie-Management',
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
  'https://images.bikeexif.com/2024/05/bmw-k1100rs-cafe-racer-powerbrick.jpg',
  'https://images.bikeexif.com/2024/05/bmw-k1100rs-cafe-racer-powerbrick-8.jpg',
  'https://images.bikeexif.com/2024/05/bmw-k1100rs-cafe-racer-powerbrick-9.jpg',
  'https://images.bikeexif.com/2024/05/bmw-k1100rs-cafe-racer-powerbrick-5.jpg',
  'https://images.bikeexif.com/2024/05/bmw-k1100rs-cafe-racer-powerbrick-7.jpg',
  'https://images.bikeexif.com/2024/05/bmw-k1100rs-cafe-racer-powerbrick-3.jpg',
  'https://images.bikeexif.com/2024/05/bmw-k1100rs-cafe-racer-powerbrick-16.jpg',
  'https://images.bikeexif.com/2024/05/bmw-k1100rs-cafe-racer-powerbrick-1.jpg',
  'https://images.bikeexif.com/2024/05/bmw-k1100rs-cafe-racer-powerbrick-17.jpg',
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
  console.log('Creating BMW K1100RS Café Racer — Powerbrick bike as superadmin...\n')

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

  const slug = generateBikeSlug(BIKE.title)
  await admin.from('bikes').update({ slug }).eq('id', bikeId)
  console.log(`Slug set: ${slug}\n`)

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
