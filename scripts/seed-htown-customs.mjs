#!/usr/bin/env node
/**
 * Seed script: Create H-Town Customs workshop profile
 * Run: node scripts/seed-htown-customs.mjs
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

// ── Workshop Data ────────────────────────────────────────────────────
const WORKSHOP = {
  name: 'H-Town Customs',
  username: 'h-town-customs',
  bio: 'Meisterbetrieb für Harley-Davidson in Isernhagen bei Hannover. Import, Umbau & Service seit 2015.',
  bio_long: `H-Town Customs ist ein Meisterbetrieb in Isernhagen bei Hannover, der sich auf den Import und Umbau von Harley-Davidson Motorrädern aus den USA spezialisiert hat. Inhaber Nico Schröder bringt über ein Jahrzehnt Erfahrung in der Motorrad-Customisierung und Reparatur mit.

Der Kunde ist König – dieses Motto steht bei H-Town Customs im Mittelpunkt. Jeder Umbau wird individuell nach den Wünschen des Kunden realisiert. Von der ersten Beratung bis zur fertigen Maschine wird transparent kommuniziert, welche Modifikationen möglich sind und wo Kompromisse nötig werden.

Neben Custom Bikes bietet H-Town Customs den kompletten Werkstatt-Service: Inspektionen, TÜV-Abnahmen (§21 und §29), Power Vision Tuning, Unfallschadenreparatur und Ersatzteilversorgung über namhafte Händler wie Motorcycle Storehouse, Custom Chrome und The Jekyll and Hyde Company.`,
  city: 'Isernhagen',
  address: 'Siemensstraße 11, 30916 Isernhagen, Deutschland',
  lat: 52.4376,
  lng: 9.8475,
  specialty: 'Chopper · Custom',
  since_year: 2015,
  tags: [
    'Komplettumbau',
    'Teileumbau',
    'TÜV-Einzelabnahme',
    'TÜV-Untersuchung',
    'Motorinstandsetzung',
    'Motordiagnose',
    'Elektrik',
  ],
  bases: ['Harley-Davidson'],
  website_url: 'https://www.htown-customs.de',
  instagram_url: 'https://www.instagram.com/h.town.customs',
  opening_hours: [
    { day: 'Mo', hours: '08:30–17:00' },
    { day: 'Di', hours: '08:30–17:00' },
    { day: 'Mi', hours: '08:30–17:00' },
    { day: 'Do', hours: '08:30–17:00' },
    { day: 'Fr', hours: '08:30–15:00' },
    { day: 'Sa', hours: '10:00–13:00' },
    { day: 'So', hours: 'Geschlossen' },
  ],
}

// ── Image URLs from their website ────────────────────────────────────
const COVER_IMAGE_URL = 'https://www.htown-customs.de/upload/large/bg-header_927_large_WURtNJ1lR0.jpg'

const GALLERY_IMAGE_URLS = [
  'https://www.htown-customs.de/upload/resized/werkstattbereich_resized_k-CRWxcC4H.jpg',
  'https://www.htown-customs.de/upload/resized/night-rod-special-umbau-1_resized_1ArIkfzA8r.jpeg',
  'https://www.htown-customs.de/upload/galleries/gallery_652e01f077bfda9ac8f1dd9b/resized/night-rod-special-umbau-2_resized_CWe-y3s6mn.jpeg',
  'https://www.htown-customs.de/upload/galleries/gallery_652e01f077bfda9ac8f1dd9b/resized/night-rod-special-umbau-3_resized_dPvBkoqLdN.jpeg',
  'https://www.htown-customs.de/upload/galleries/gallery_652e01f077bfda9ac8f1dd9b/resized/night-rod-special-umbau-4_resized_oDoy-5M7yw.jpeg',
  'https://www.htown-customs.de/upload/galleries/gallery_652e01f077bfda9ac8f1dd9b/resized/night-rod-special-umbau-5_resized_STiVTv97k.jpeg',
]

const LOGO_URL = 'https://www.htown-customs.de/images/social_branding.png'

// ── Helper: Download image as buffer ─────────────────────────────────
async function downloadImage(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to download ${url}: ${res.status}`)
  const buffer = Buffer.from(await res.arrayBuffer())
  const contentType = res.headers.get('content-type') || 'image/jpeg'
  return { buffer, contentType }
}

// ── Helper: Upload to Supabase Storage ───────────────────────────────
async function uploadToStorage(profileId, fileName, buffer, contentType) {
  const storagePath = `${profileId}/${fileName}`
  const { error } = await admin.storage
    .from('builder-media')
    .upload(storagePath, buffer, {
      contentType,
      upsert: true,
    })
  if (error) throw new Error(`Upload failed (${fileName}): ${error.message}`)

  const { data: { publicUrl } } = admin.storage
    .from('builder-media')
    .getPublicUrl(storagePath)

  return publicUrl
}

// ── Main ─────────────────────────────────────────────────────────────
async function main() {
  console.log('Creating H-Town Customs workshop...\n')

  // 1. Check if already exists
  const { data: existing } = await admin
    .from('profiles')
    .select('id')
    .eq('username', WORKSHOP.username)
    .maybeSingle()

  if (existing) {
    console.log(`Workshop "${WORKSHOP.username}" already exists (id: ${existing.id}).`)
    console.log('Updating profile and uploading images...\n')
    await updateProfile(existing.id)
    return
  }

  // 2. Create auth user with placeholder email
  const placeholderEmail = `unclaimed-${crypto.randomUUID()}@motodigital.local`
  console.log(`Creating auth user with placeholder: ${placeholderEmail}`)

  const { data: authUser, error: authError } = await admin.auth.admin.createUser({
    email: placeholderEmail,
    email_confirm: true,
    user_metadata: {
      role: 'custom-werkstatt',
      username: WORKSHOP.username,
    },
  })

  if (authError || !authUser.user) {
    console.error('Auth user creation failed:', authError?.message)
    process.exit(1)
  }

  const profileId = authUser.user.id
  console.log(`Auth user created: ${profileId}`)

  // Wait a moment for the handle_new_user trigger
  await new Promise(r => setTimeout(r, 2000))

  await updateProfile(profileId)
}

async function updateProfile(profileId) {
  // 3. Update profile with all data
  console.log('Updating profile data...')
  const { error: updateError } = await admin
    .from('profiles')
    .update({
      full_name: WORKSHOP.name,
      bio: WORKSHOP.bio,
      bio_long: WORKSHOP.bio_long,
      city: WORKSHOP.city,
      address: WORKSHOP.address,
      lat: WORKSHOP.lat,
      lng: WORKSHOP.lng,
      specialty: WORKSHOP.specialty,
      since_year: WORKSHOP.since_year,
      tags: WORKSHOP.tags,
      bases: WORKSHOP.bases,
      website_url: WORKSHOP.website_url,
      instagram_url: WORKSHOP.instagram_url,
      opening_hours: WORKSHOP.opening_hours,
    })
    .eq('id', profileId)

  if (updateError) {
    console.error('Profile update failed:', updateError.message)
    process.exit(1)
  }
  console.log('Profile data updated.\n')

  // 4. Upload logo/avatar
  console.log('Uploading logo...')
  try {
    const { buffer, contentType } = await downloadImage(LOGO_URL)
    const ext = contentType.includes('png') ? 'png' : 'jpg'
    const avatarUrl = await uploadToStorage(profileId, `avatar.${ext}`, buffer, contentType)
    await admin.from('profiles').update({ avatar_url: avatarUrl }).eq('id', profileId)
    console.log(`Logo uploaded: avatar.${ext}`)
  } catch (e) {
    console.warn('Logo upload failed:', e.message)
  }

  // 5. Upload cover image
  console.log('\nUploading cover image...')
  try {
    const { buffer, contentType } = await downloadImage(COVER_IMAGE_URL)
    const coverFileName = `cover-${Date.now()}.jpg`
    const coverUrl = await uploadToStorage(profileId, coverFileName, buffer, contentType)

    // Delete existing cover media records
    await admin.from('builder_media').delete().eq('builder_id', profileId).eq('title', 'cover')

    await admin.from('builder_media').insert({
      builder_id: profileId,
      url: coverUrl,
      type: 'image',
      title: 'cover',
      position: 0,
    })
    console.log(`Cover uploaded: ${coverFileName}`)
  } catch (e) {
    console.warn('Cover upload failed:', e.message)
  }

  // 6. Upload gallery images
  console.log('\nUploading gallery images...')
  for (let i = 0; i < GALLERY_IMAGE_URLS.length; i++) {
    const url = GALLERY_IMAGE_URLS[i]
    const label = url.split('/').pop()
    try {
      const { buffer, contentType } = await downloadImage(url)
      const ext = contentType.includes('png') ? 'png' : contentType.includes('webp') ? 'webp' : 'jpg'
      const fileName = `gallery-${Date.now()}-${i}.${ext}`
      const publicUrl = await uploadToStorage(profileId, fileName, buffer, contentType)

      await admin.from('builder_media').insert({
        builder_id: profileId,
        url: publicUrl,
        type: 'image',
        title: null,
        position: i + 1,
      })
      console.log(`  [${i + 1}/${GALLERY_IMAGE_URLS.length}] ${label}`)
    } catch (e) {
      console.warn(`  [${i + 1}] Failed: ${e.message}`)
    }
  }

  console.log('\nDone! Workshop "H-Town Customs" created successfully.')
  console.log(`Profile ID: ${profileId}`)
  console.log(`Public URL: /custom-werkstatt/${WORKSHOP.username}`)
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
