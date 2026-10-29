#!/usr/bin/env node
/**
 * Seed script: Create/update showcase bikes for existing workshop profiles from a JSON file
 *
 * Run (Dev-DB from .env.local):
 *   node scripts/seed-bikes.mjs scripts/data/bikes-batch-1.json [--only=slug1,slug2]
 *
 * Run against Prod (credentials via env, explicit flag required):
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
 *     node scripts/seed-bikes.mjs scripts/data/bikes-batch-1.json --prod
 *
 * Each entry names its workshop by profile username. Idempotent: a bike with the
 * same slug and seller is updated and its images replaced; a slug owned by
 * another seller is never touched.
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const PROD_REF = 'ikhgfynzghfhnviwvupo'
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/124 Safari/537.36'
const MAX_IMAGE_WIDTH = 2400

// sharp ships with Next.js; without it images are uploaded unprocessed
const sharp = await import('sharp').then(m => m.default).catch(() => null)

// ── Args ─────────────────────────────────────────────────────────────
const args = process.argv.slice(2)
const dataFile = args.find(a => !a.startsWith('--'))
const only = args.find(a => a.startsWith('--only='))?.slice(7).split(',').filter(Boolean)
const allowProd = args.includes('--prod')

if (!dataFile) {
  console.error('Usage: node scripts/seed-bikes.mjs <data.json> [--only=a,b] [--prod]')
  process.exit(1)
}

// ── Load .env.local ──────────────────────────────────────────────────
const envPath = path.resolve(__dirname, '..', '.env.local')
const env = {}
for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
  const match = line.match(/^([^=]+)=\s*(.*)$/)
  if (match) env[match[1].trim()] = match[2].trim()
}

const SUPABASE_URL = process.env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SERVICE_ROLE_KEY')
  process.exit(1)
}

const isProd = SUPABASE_URL.includes(PROD_REF)
if (isProd && !allowProd) {
  console.error('Target is the PROD database — pass --prod to confirm.')
  process.exit(1)
}
console.log(`Target: ${new URL(SUPABASE_URL).host} (${isProd ? 'PROD' : 'dev'})\n`)

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// ── Helpers ──────────────────────────────────────────────────────────
// Mirrors src/lib/utils/bikeSlug.ts
function generateBikeSlug(title) {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function downloadImage(url) {
  const res = await fetch(url, { headers: { 'User-Agent': UA } })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const contentType = res.headers.get('content-type') || 'image/jpeg'
  if (!contentType.startsWith('image/')) throw new Error(`not an image (${contentType})`)
  return { buffer: Buffer.from(await res.arrayBuffer()), contentType }
}

// Photos are often served as heavy PNGs → always store a capped-width JPEG
async function toJpeg(image) {
  if (!sharp) return image
  const buffer = await sharp(image.buffer)
    .rotate()
    .resize({ width: MAX_IMAGE_WIDTH, withoutEnlargement: true })
    .flatten({ background: '#000000' })
    .jpeg({ quality: 85, mozjpeg: true })
    .toBuffer()
  return { buffer, contentType: 'image/jpeg' }
}

function extFor(contentType) {
  if (contentType.includes('png')) return 'png'
  if (contentType.includes('webp')) return 'webp'
  return 'jpg'
}

async function findWorkshop(username) {
  const { data: profile } = await admin
    .from('profiles')
    .select('id, role')
    .eq('username', username)
    .maybeSingle()
  if (!profile) throw new Error(`workshop profile "${username}" not found`)
  if (profile.role !== 'custom-werkstatt') throw new Error(`"${username}" is not a custom-werkstatt profile`)

  const { data: workshop } = await admin
    .from('workshops')
    .select('id')
    .eq('owner_id', profile.id)
    .maybeSingle()
  return { profileId: profile.id, workshopId: workshop?.id ?? null }
}

async function clearImages(sellerId, bikeId) {
  await admin.from('bike_images').delete().eq('bike_id', bikeId)
  const prefix = `${sellerId}/${bikeId}`
  const { data: files } = await admin.storage.from('bike-images').list(prefix)
  if (files?.length) {
    await admin.storage.from('bike-images').remove(files.map(f => `${prefix}/${f.name}`))
  }
}

// ── Seed one bike ────────────────────────────────────────────────────
async function seedBike(b) {
  const slug = generateBikeSlug(b.title)
  console.log(`\n▶ ${b.title} (${b.workshop})`)
  const { profileId, workshopId } = await findWorkshop(b.workshop)
  if (!workshopId) console.warn('  ⚠ no workshops row — bike is linked via seller_id only')

  const fields = {
    seller_id: profileId,
    workshop_id: workshopId,
    title: b.title,
    make: b.make,
    model: b.model,
    year: b.year,
    style: b.style,
    cc: b.cc ?? null,
    mileage_km: b.mileage_km ?? null,
    description: b.description,
    modifications: b.modifications ?? [],
    status: b.status ?? 'active',
    listing_type: b.listing_type ?? 'showcase',
    price: 0,
    price_amount: b.price_amount ?? null,
    price_on_request: b.price_on_request ?? false,
    city: null,
    lat: null,
    lng: null,
    is_verified: false,
  }

  const { data: existing } = await admin
    .from('bikes')
    .select('id, seller_id')
    .eq('slug', slug)
    .maybeSingle()

  let bikeId
  if (existing) {
    if (existing.seller_id !== profileId) throw new Error(`slug "${slug}" belongs to another seller — skipping`)
    const { error } = await admin.from('bikes').update(fields).eq('id', existing.id)
    if (error) throw new Error(`Bike update failed: ${error.message}`)
    bikeId = existing.id
    console.log(`  exists → updating ${bikeId}`)
    await clearImages(profileId, bikeId)
  } else {
    const { data, error } = await admin.from('bikes').insert({ ...fields, slug }).select('id').maybeSingle()
    if (error || !data) throw new Error(`Bike insert failed: ${error?.message}`)
    bikeId = data.id
    console.log(`  created ${bikeId}`)
  }

  let ok = 0
  for (let i = 0; i < b.image_urls.length; i++) {
    try {
      const { buffer, contentType } = await toJpeg(await downloadImage(b.image_urls[i]))
      const storagePath = `${profileId}/${bikeId}/${i}-${Date.now()}.${extFor(contentType)}`
      const { error: uploadError } = await admin.storage
        .from('bike-images')
        .upload(storagePath, buffer, { contentType, upsert: true })
      if (uploadError) throw new Error(uploadError.message)

      const url = admin.storage.from('bike-images').getPublicUrl(storagePath).data.publicUrl
      const { error: insertError } = await admin.from('bike_images').insert({
        bike_id: bikeId,
        url,
        position: i,
        is_cover: i === 0,
        media_type: 'image',
        thumbnail_url: null,
      })
      if (insertError) throw new Error(`bike_images insert: ${insertError.message}`)
      ok++
    } catch (e) {
      console.warn(`  ⚠ image ${i}: ${e.message} (${b.image_urls[i]})`)
    }
  }
  console.log(`  images ${ok}/${b.image_urls.length} ✓`)
  console.log(`  → /custom-bike/${slug}`)
}

// ── Main ─────────────────────────────────────────────────────────────
const bikes = JSON.parse(fs.readFileSync(path.resolve(dataFile), 'utf8'))
  .filter(b => !only || only.includes(generateBikeSlug(b.title)))

let failed = 0
for (const b of bikes) {
  try {
    await seedBike(b)
  } catch (e) {
    failed++
    console.error(`  ✗ ${e.message}`)
  }
}
console.log(`\nDone: ${bikes.length - failed}/${bikes.length} bikes.`)
process.exit(failed ? 1 : 0)
