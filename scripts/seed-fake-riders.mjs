#!/usr/bin/env node
/**
 * Seed script: Create fake rider profiles for launch
 * Run: node scripts/seed-fake-riders.mjs
 *
 * Creates auth users with placeholder emails + fully filled rider profiles.
 * All locations are in Germany. These users can later be used for
 * automated posting, commenting, and liking on the Explore page.
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

// ── Fake Rider Data ─────────────────────────────────────────────────
const RIDERS = [
  {
    username: 'marcothebiker',
    full_name: 'Marco L.',
    bio: 'Yamaha SR500 Liebhaber. Wochenendtouren durch den Schwarzwald.',
    city: 'Freiburg',
    lat: 47.9990,
    lng: 7.8421,
    riding_style: 'flott',
    riding_styles: ['Café Racer', 'Classic'],
    instagram_url: 'https://www.instagram.com/marcothebiker',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face',
  },
  {
    username: 'jens.rides',
    full_name: 'Jens K.',
    bio: 'Scrambler-Fahrer aus Hamburg. Immer auf der Suche nach neuen Offroad-Strecken.',
    city: 'Hamburg',
    lat: 53.5511,
    lng: 9.9937,
    riding_style: 'legende',
    riding_styles: ['Scrambler', 'Adventure'],
    instagram_url: 'https://www.instagram.com/jens.rides',
    avatar_url: 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=400&h=400&fit=crop',
  },
  {
    username: 'KustomKarl68',
    full_name: 'Karl',
    bio: 'Alter Hase auf zwei Rädern. Fahre seit 30 Jahren Chopper. Harley oder garnix.',
    city: 'Dortmund',
    lat: 51.5136,
    lng: 7.4653,
    riding_style: 'cruiser',
    riding_styles: ['Chopper', 'Cruiser'],
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
  },
  {
    username: 'cx500toni',
    full_name: 'Toni B.',
    bio: 'Tracker-Builds sind mein Ding. Honda CX500 als Basis, der Rest ist Fantasie.',
    city: 'München',
    lat: 48.1351,
    lng: 11.5820,
    riding_style: 'legende',
    riding_styles: ['Tracker', 'Café Racer'],
    instagram_url: 'https://www.instagram.com/cx500toni',
    avatar_url: null,
  },
  {
    username: 'leo_ontwowheels',
    full_name: 'Leo H.',
    bio: 'Bobber-Enthusiast aus Berlin. Weniger ist mehr — cleane Lines, lauter Sound.',
    city: 'Berlin',
    lat: 52.5200,
    lng: 13.4050,
    riding_style: 'flott',
    riding_styles: ['Bobber', 'Custom'],
    instagram_url: 'https://www.instagram.com/leo_ontwowheels',
    tiktok_url: 'https://www.tiktok.com/@leo_ontwowheels',
    avatar_url: 'https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?w=400&h=400&fit=crop',
  },
  {
    username: 'max_goes_offroad',
    full_name: 'Max R.',
    bio: 'Enduro & Scrambler. Unter der Woche Büro, am Wochenende Schotter.',
    city: 'Stuttgart',
    lat: 48.7758,
    lng: 9.1829,
    riding_style: 'legende',
    riding_styles: ['Scrambler', 'Adventure'],
    avatar_url: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=400&h=400&fit=crop',
  },
  {
    username: 'olli750four',
    full_name: 'Olli',
    bio: 'Café Racer aus Köln. CB750 Four, Halbschale, Stummellenker — fertig.',
    city: 'Köln',
    lat: 50.9375,
    lng: 6.9603,
    riding_style: 'flott',
    riding_styles: ['Café Racer', 'Classic'],
    instagram_url: 'https://www.instagram.com/olli750four',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
  },
  {
    username: 'stephanschraubt',
    full_name: 'Stephan V.',
    bio: 'Ich schraube selbst. Aktuell: BMW R80 Umbau in der Garage. Updates folgen!',
    city: 'Leipzig',
    lat: 51.3397,
    lng: 12.3731,
    riding_style: 'flott',
    riding_styles: ['Café Racer', 'Brat Style'],
    instagram_url: 'https://www.instagram.com/stephanschraubt',
    avatar_url: 'https://images.unsplash.com/photo-1525160354320-d8e92641c563?w=400&h=400&fit=crop',
  },
  {
    username: 'flo_xr',
    full_name: 'Flo W.',
    bio: 'Flat Track Racing am Wochenende. XR750 Replica ist der Traum.',
    city: 'Nürnberg',
    lat: 49.4521,
    lng: 11.0767,
    riding_style: 'legende',
    riding_styles: ['Tracker', 'Flat Track'],
    avatar_url: null,
  },
  {
    username: 'panhead_michi',
    full_name: 'Michi S.',
    bio: 'Chopper-Fahrer seit \'98. Panhead im Starrrahmen — so muss das.',
    city: 'Hannover',
    lat: 52.3759,
    lng: 9.7320,
    riding_style: 'cruiser',
    riding_styles: ['Chopper', 'Oldschool'],
    instagram_url: 'https://www.instagram.com/panhead_michi',
    avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face',
  },
  {
    username: 'andre.ontour',
    full_name: 'André F.',
    bio: 'Langstrecke ist mein Ding. Alpen, Pyrenäen, Skandinavien — alles auf zwei Rädern.',
    city: 'Dresden',
    lat: 51.0504,
    lng: 13.7373,
    riding_style: 'cruiser',
    riding_styles: ['Touring', 'Adventure'],
    avatar_url: 'https://images.unsplash.com/photo-1558980394-4c7c9299fe96?w=400&h=400&fit=crop',
  },
  {
    username: 'renescrambles',
    full_name: 'René',
    bio: 'Ducati Scrambler als Daily Driver. Kaffee, Kurven, Repeat.',
    city: 'Frankfurt',
    lat: 50.1109,
    lng: 8.6821,
    riding_style: 'flott',
    riding_styles: ['Scrambler', 'Café Racer'],
    instagram_url: 'https://www.instagram.com/renescrambles',
    avatar_url: 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=400&h=400&fit=crop',
  },
  {
    username: '2takt_danny',
    full_name: 'Danny R.',
    bio: 'Zweitakt-Junkie. MZ, Simson, Jawa — Hauptsache es qualmt und stinkt.',
    city: 'Erfurt',
    lat: 50.9787,
    lng: 11.0328,
    riding_style: 'legende',
    riding_styles: ['Classic', 'Oldschool'],
    avatar_url: null,
  },
  {
    username: 'niklas.cb350',
    full_name: 'Niklas',
    bio: 'Brat Style aus Düsseldorf. Kleine Bikes, großer Spaß. Aktuell: Honda CB350.',
    city: 'Düsseldorf',
    lat: 51.2277,
    lng: 6.7735,
    riding_style: 'flott',
    riding_styles: ['Brat Style', 'Custom'],
    instagram_url: 'https://www.instagram.com/niklas.cb350',
    avatar_url: 'https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?w=400&h=400&fit=crop',
  },
  {
    username: 'iron883ben',
    full_name: 'Ben W.',
    bio: 'Sportster Iron 883. Keep it simple, ride it hard.',
    city: 'Bremen',
    lat: 53.0793,
    lng: 8.8017,
    riding_style: 'cruiser',
    riding_styles: ['Bobber', 'Cruiser'],
    avatar_url: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=400&h=400&fit=crop&crop=face',
  },
  {
    username: 'wrenchlife_chris',
    full_name: 'Chris B.',
    bio: 'Schrauber aus Leidenschaft. Garage > Sofa. Aktuelles Projekt: Kawasaki W650.',
    city: 'Mannheim',
    lat: 49.4875,
    lng: 8.4660,
    riding_style: 'flott',
    riding_styles: ['Café Racer', 'Classic'],
    avatar_url: null,
  },
  {
    username: 'lars.guzzi',
    full_name: 'Lars H.',
    bio: 'Moto Guzzi V7 — Italiener mit deutschem Wohnsitz. Sonntagsfahrer mit Stil.',
    city: 'Augsburg',
    lat: 48.3705,
    lng: 10.8978,
    riding_style: 'cruiser',
    riding_styles: ['Classic', 'Café Racer'],
    instagram_url: 'https://www.instagram.com/lars.guzzi',
    avatar_url: 'https://images.unsplash.com/photo-1622185135505-2d795003994a?w=400&h=400&fit=crop',
  },
  {
    username: 'jan_xsr700',
    full_name: 'Jan Z.',
    bio: 'Yamaha XSR700. Neo-Retro Gang. Fahre bei jedem Wetter.',
    city: 'Rostock',
    lat: 54.0924,
    lng: 12.0991,
    riding_style: 'legende',
    riding_styles: ['Café Racer', 'Custom'],
    avatar_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop&crop=face',
  },
  {
    username: 'bonnie_peter',
    full_name: 'Peter N.',
    bio: 'Triumph Bonneville T120. Roadtrips mit Zelt und Schlafsack. Freiheit pur.',
    city: 'Münster',
    lat: 51.9607,
    lng: 7.6261,
    riding_style: 'cruiser',
    riding_styles: ['Touring', 'Classic'],
    avatar_url: null,
  },
  {
    username: 'guzzi_alex',
    full_name: 'Alex K.',
    bio: 'Moto Guzzi Le Mans als Café Racer. Hubraum statt Turbo.',
    city: 'Regensburg',
    lat: 49.0134,
    lng: 12.1016,
    riding_style: 'flott',
    riding_styles: ['Café Racer', 'Classic'],
    instagram_url: 'https://www.instagram.com/guzzi_alex',
    avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face',
  },
]

// ── Main ─────────────────────────────────────────────────────────────
async function main() {
  console.log(`\nSeeding ${RIDERS.length} fake rider profiles...\n`)

  let created = 0
  let skipped = 0
  let failed = 0

  for (const rider of RIDERS) {
    // Check if username already exists
    const { data: existing } = await admin
      .from('profiles')
      .select('id')
      .eq('username', rider.username)
      .maybeSingle()

    if (existing) {
      console.log(`  ⏭  ${rider.username} — already exists, updating profile...`)
      await updateProfile(existing.id, rider)
      skipped++
      continue
    }

    // Create auth user
    const placeholderEmail = `bot-${rider.username}@motodigital.local`

    const { data: authUser, error: authError } = await admin.auth.admin.createUser({
      email: placeholderEmail,
      email_confirm: true,
      user_metadata: {
        role: 'rider',
        username: rider.username,
        full_name: rider.full_name,
      },
    })

    if (authError || !authUser.user) {
      console.error(`  ✗  ${rider.username} — auth failed: ${authError?.message}`)
      failed++
      continue
    }

    // Wait for handle_new_user trigger
    await new Promise(r => setTimeout(r, 1500))

    // Update profile with full data
    const success = await updateProfile(authUser.user.id, rider)
    if (success) {
      console.log(`  ✓  ${rider.username} (${rider.city})`)
      created++
    } else {
      failed++
    }
  }

  console.log(`\n────────────────────────────────`)
  console.log(`  Created: ${created}`)
  console.log(`  Skipped: ${skipped} (already existed)`)
  console.log(`  Failed:  ${failed}`)
  console.log(`  Total:   ${RIDERS.length}`)
  console.log(`────────────────────────────────\n`)
}

async function updateProfile(profileId, rider) {
  const { error } = await admin
    .from('profiles')
    .update({
      full_name: rider.full_name,
      bio: rider.bio,
      city: rider.city,
      lat: rider.lat,
      lng: rider.lng,
      riding_styles: rider.riding_styles,
      riding_style: rider.riding_style || 'cruiser',
      instagram_url: rider.instagram_url || null,
      tiktok_url: rider.tiktok_url || null,
      avatar_url: rider.avatar_url,
      onboarding_completed: true,
      onboarding_step: 3,
      slug: rider.username,
      is_bot: true,
    })
    .eq('id', profileId)

  if (error) {
    console.error(`  ✗  ${rider.username} — update failed: ${error.message}`)
    return false
  }
  return true
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
