#!/usr/bin/env node
/**
 * Seed script: Create BMW R100R "Earth Motorcycles" custom bike as superadmin.
 * No workshop link (workshop_id = null).
 * Source: https://www.bikeexif.com/bmw-r100r-earth-motorcycles
 * Run: node scripts/seed-bmw-r100r-earth.mjs
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
  title: 'BMW R100R — Earth Motorcycles',
  make: 'BMW Motorrad',
  model: 'R100',
  year: 1990,
  style: 'cafe_racer',
  cc: 980,
  mileage_km: null,
  description: `Acht Jahre BMW-Boxer-Expertise, destilliert in eine einzige Maschine. Earth Motorcycles aus der Slowakei unter Vlado Dinga hat diese 1990er R100R auf eine "saubere horizontale Achse" getrimmt — mit kompromissloser Liebe zum Detail und nahtloser Integration aller Komponenten.

Der Boxer wurde komplett neu aufgebaut: neue Dichtungen, ultraschallgereinigte Vergaser, erneuerte Kurbelwellenlager, K&N-Luftfilter mit Edelstahl-Choke-Knöpfen und ein elektromagnetisches Kraftstoffventil anstelle der klassischen Petcocks. Ein gegossener Aluminiumdeckel gleicht die obere Kante des Motors perfekt aus.

Elektrik läuft über eine Motogadget mo.unit blue mit Bluetooth-Steuerung, Aliant LiFePo4-Batterie und schlüssellose Zündung. Gabel wurde abgesenkt mit CNC-gefrästen Gabelbrücken, hinten sitzt ein YSS-Stoßdämpfer. Die Radaufhängung: verspeichte Tubeless-Räder mit Avon Roadrider II.

Der Tank wurde geöffnet, gereinigt, neu versiegelt und geschweißt — der Montagewinkel wurde für die lineare Geometrie angepasst. Der maßgefertigte Heckrahmen mit integrierter Sitzschale hat denselben Rohrdurchmesser wie der Hauptrahmen und verborgene Befestigungen ohne sichtbare Schweißnähte oder Schrauben. Drei Edelstahlrohre zwischen Tank und Motor führen Kraftstoffleitungen und Kabel.

Finish: gebürstetes Aluminium mit BMW Motorsport-inspirierten Details. Der Antriebsstrang wurde sandgestrahlt und schwarz cerakotiert mit polierten Akzenten. Komplett mit Edelstahl-Befestigungen. Koso-LED-Scheinwerfer in einer stromlinienförmigen Verkleidung. Schmale LED-Rückleuchte, 3D-gedrucktes Frontkotflügel, Svelte-Sattel in Kunstleder mit Kontrastnähten.

Kurz: "impossibly tidy" — gebaut zum Fahren, nicht nur zum Anschauen.`,
  modifications: [
    'Boxer-Motor komplett revidiert: neue Dichtungen, Lager, ultraschallgereinigte Vergaser',
    'K&N Luftfilter mit Edelstahl-Choke-Knöpfen',
    'Elektromagnetisches Kraftstoffventil (ersetzt Petcocks)',
    'Gegossener Aluminium-Motordeckel für nivellierte Oberkante',
    'Motogadget mo.unit blue (Bluetooth-Steuereinheit)',
    'Aliant LiFePo4 Batterie + schlüssellose Zündung',
    'Tieferlegte Gabel mit CNC-gefrästen Gabelbrücken',
    'YSS Federbein mit maßgefertigten Aufnahmen',
    'Neue Bremsscheiben + Venhill Stahlflex',
    'Cerakotiert beschichtete Bremssättel',
    'Tubeless verspeichte Räder, abgezogen und lackiert',
    'Avon Roadrider II Reifen',
    'WalzWerk Auspuff (SC-Project Italien)',
    'BMW Paralever Einarmschwinge',
    'Originaltank geöffnet, versiegelt, geschweißt und winkel-optimiert',
    'Maßgefertigter Heckrahmen mit integrierter Sitzschale (verborgene Aufnahmen)',
    'Svelte-Sitz: Kunstleder mit Kontrastnähten',
    '3D-gedruckter Frontkotflügel',
    'Koso LED-Scheinwerfer in Strömungsverkleidung',
    '1" Drag-Bars (Clip-On Option verfügbar)',
    'Motogadget Griffe, Lenkerenden-Blinker, interner Gasgriff',
    'ISR Hebel mit integrierten Schaltern',
    'Schmale LED-Rückleuchte im hochgezogenen Heck integriert',
    'Motogadget Heck-Blinker + Hugger/Kennzeichenhalter',
    'Cognito Moto Rear-Sets',
    'Modularer Tacho-Mount für vier Motogadget-Optionen',
    'Gebürstetes Aluminium Finish mit BMW Motorsport Details',
    'Antriebsstrang sandgestrahlt + schwarz cerakotiert',
    'Komplett Edelstahl-Befestigungen',
    'Drei Edelstahlrohre für Leitungen zwischen Tank und Motor',
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
  'https://images.bikeexif.com/2025/09/bmw-r100r-earth-motorcycles-1.jpg?v=1757522745',
  'https://images.bikeexif.com/2025/09/bmw-r100r-earth-motorcycles-3.jpg?v=1757523074',
  'https://images.bikeexif.com/2025/09/bmw-r100r-earth-motorcycles-2.jpg?v=1757523288',
  'https://images.bikeexif.com/2025/09/bmw-r100r-earth-motorcycles-9.jpg?v=1757523075',
  'https://images.bikeexif.com/2025/09/bmw-r100r-earth-motorcycles-7.jpg?v=1757523442',
  'https://images.bikeexif.com/2025/09/bmw-r100r-earth-motorcycles-11.jpg?v=1757523354',
  'https://images.bikeexif.com/2025/09/bmw-r100r-earth-motorcycles-12.jpg?v=1757523204',
  'https://images.bikeexif.com/2025/09/bmw-r100r-earth-motorcycles-17.jpg?v=1757523506',
  'https://images.bikeexif.com/2025/09/bmw-r100r-earth-motorcycles-5.jpg?v=1757523517',
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
  console.log('Creating BMW R100R — Earth Motorcycles bike as superadmin...\n')

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
