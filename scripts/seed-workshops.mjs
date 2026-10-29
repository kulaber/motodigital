#!/usr/bin/env node
/**
 * Seed script: Create/update unclaimed workshop profiles from a JSON file
 *
 * Run (Dev-DB from .env.local):
 *   node scripts/seed-workshops.mjs scripts/data/workshops-batch-1.json [--only=slug1,slug2]
 *
 * Run against Prod (credentials via env, explicit flag required):
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
 *     node scripts/seed-workshops.mjs scripts/data/workshops-batch-1.json --prod
 *
 * Idempotent: an existing unclaimed profile (placeholder email) with the same
 * username is updated and its media replaced. Claimed profiles are never touched.
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const PROD_REF = 'ikhgfynzghfhnviwvupo'
const PLACEHOLDER_DOMAIN = '@motodigital.local'
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
  console.error('Usage: node scripts/seed-workshops.mjs <data.json> [--only=a,b] [--prod]')
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
const MAPBOX_TOKEN = env.NEXT_PUBLIC_MAPBOX_TOKEN

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
async function downloadImage(url) {
  let res = await fetch(url, { headers: { 'User-Agent': UA } })
  // WordPress-style resized variant missing → fall back to the original
  const stripped = url.replace(/-\d+x\d+(\.\w+)$/, '$1')
  if (!res.ok && stripped !== url) res = await fetch(stripped, { headers: { 'User-Agent': UA } })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const contentType = res.headers.get('content-type') || 'image/jpeg'
  if (!contentType.startsWith('image/')) throw new Error(`not an image (${contentType})`)
  return { buffer: Buffer.from(await res.arrayBuffer()), contentType }
}

// Avatar is rendered as a cropped square → center the logo on a solid square
async function squareLogo({ buffer }, background) {
  const logo = await sharp(buffer, { density: 300 }).resize(400, 400, { fit: 'inside' }).png().toBuffer()
  const out = await sharp({ create: { width: 512, height: 512, channels: 4, background } })
    .composite([{ input: logo, gravity: 'center' }])
    .png()
    .toBuffer()
  return { buffer: out, contentType: 'image/png' }
}

async function downscale(image) {
  if (!sharp) return image
  const { width } = await sharp(image.buffer).metadata()
  if (!width || width <= MAX_IMAGE_WIDTH) return image
  const buffer = await sharp(image.buffer).rotate().resize({ width: MAX_IMAGE_WIDTH }).jpeg({ quality: 85 }).toBuffer()
  return { buffer, contentType: 'image/jpeg' }
}

function extFor(contentType) {
  if (contentType.includes('png')) return 'png'
  if (contentType.includes('webp')) return 'webp'
  return 'jpg'
}

async function uploadToStorage(profileId, fileName, buffer, contentType) {
  const storagePath = `${profileId}/${fileName}`
  const { error } = await admin.storage
    .from('builder-media')
    .upload(storagePath, buffer, { contentType, upsert: true })
  if (error) throw new Error(`Upload failed (${fileName}): ${error.message}`)
  return admin.storage.from('builder-media').getPublicUrl(storagePath).data.publicUrl
}

async function geocode(address) {
  if (!MAPBOX_TOKEN) return null
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?country=de,at,ch,nl,fr&limit=1&access_token=${MAPBOX_TOKEN}`
  const res = await fetch(url)
  if (!res.ok) return null
  const [lng, lat] = (await res.json()).features?.[0]?.center ?? []
  return lat && lng ? { lat, lng } : null
}

async function findOrCreateProfile(w) {
  const { data: existing } = await admin
    .from('profiles')
    .select('id')
    .eq('username', w.username)
    .maybeSingle()

  if (existing) {
    const { data: { user } } = await admin.auth.admin.getUserById(existing.id)
    if (!user?.email?.endsWith(PLACEHOLDER_DOMAIN)) {
      throw new Error(`"${w.username}" exists and is claimed — skipping`)
    }
    console.log(`  exists (unclaimed) → updating ${existing.id}`)
    return existing.id
  }

  const { data, error } = await admin.auth.admin.createUser({
    email: `unclaimed-${crypto.randomUUID()}${PLACEHOLDER_DOMAIN}`,
    email_confirm: true,
    user_metadata: { role: 'custom-werkstatt', username: w.username, full_name: w.name },
  })
  if (error || !data.user) throw new Error(`Auth user creation failed: ${error?.message}`)

  // handle_new_user trigger creates profile + workshop row
  await new Promise(r => setTimeout(r, 1500))
  console.log(`  created ${data.user.id}`)
  return data.user.id
}

// ── Seed one workshop ────────────────────────────────────────────────
async function seedWorkshop(w) {
  console.log(`\n▶ ${w.name}`)
  const profileId = await findOrCreateProfile(w)

  let { lat, lng } = w
  if (lat == null || lng == null) {
    const geo = await geocode(w.address)
    if (geo) ({ lat, lng } = geo)
    console.log(geo ? `  geocoded ${lat.toFixed(5)}, ${lng.toFixed(5)}` : '  ⚠ geocoding failed')
  }

  const { error: updateError } = await admin
    .from('profiles')
    .update({
      full_name: w.name,
      slug: w.username,
      bio: w.bio,
      bio_long: w.bio_long,
      city: w.city,
      address: w.address,
      lat,
      lng,
      specialty: w.specialty,
      since_year: w.since_year ?? null,
      tags: w.tags,
      bases: w.bases ?? null,
      website_url: w.website_url ?? null,
      instagram_url: w.instagram_url ?? null,
      youtube_url: w.youtube_url ?? null,
      opening_hours: w.opening_hours ?? null,
      onboarding_completed: true,
      onboarding_step: 99,
    })
    .eq('id', profileId)
  if (updateError) throw new Error(`Profile update failed: ${updateError.message}`)

  await admin.from('workshops').update({ name: w.name, city: w.city }).eq('owner_id', profileId)

  // Logo (logo_bg: pad onto a square of that color, needed for wide or white logos)
  if (w.logo_url) {
    try {
      let logo = await downloadImage(w.logo_url)
      if (w.logo_bg && sharp) logo = await squareLogo(logo, w.logo_bg)
      const { buffer, contentType } = logo
      const avatarUrl = await uploadToStorage(profileId, `avatar.${extFor(contentType)}`, buffer, contentType)
      await admin.from('profiles').update({ avatar_url: avatarUrl }).eq('id', profileId)
      console.log('  logo ✓')
    } catch (e) {
      console.warn(`  ⚠ logo: ${e.message}`)
    }
  }

  // Cover + gallery (replace all existing media)
  await admin.from('builder_media').delete().eq('builder_id', profileId)
  const images = [w.cover_url, ...(w.gallery_urls ?? [])].filter(Boolean)
  let ok = 0
  for (let i = 0; i < images.length; i++) {
    try {
      const { buffer, contentType } = await downscale(await downloadImage(images[i]))
      const fileName = `${i === 0 ? 'cover' : 'gallery'}-${Date.now()}-${i}.${extFor(contentType)}`
      const url = await uploadToStorage(profileId, fileName, buffer, contentType)
      await admin.from('builder_media').insert({
        builder_id: profileId,
        url,
        type: 'image',
        title: i === 0 ? 'cover' : null,
        position: i,
      })
      ok++
    } catch (e) {
      console.warn(`  ⚠ image ${i}: ${e.message} (${images[i]})`)
    }
  }
  console.log(`  images ${ok}/${images.length} ✓`)
  console.log(`  → /custom-werkstatt/${w.username}`)
}

// ── Main ─────────────────────────────────────────────────────────────
const workshops = JSON.parse(fs.readFileSync(path.resolve(dataFile), 'utf8'))
  .filter(w => !only || only.includes(w.username))

let failed = 0
for (const w of workshops) {
  try {
    await seedWorkshop(w)
  } catch (e) {
    failed++
    console.error(`  ✗ ${e.message}`)
  }
}
console.log(`\nDone: ${workshops.length - failed}/${workshops.length} workshops.`)
process.exit(failed ? 1 : 0)
