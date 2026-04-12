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
    username: 'marco_sr500',
    full_name: 'Marco Lehmann',
    bio: 'Yamaha SR500 Liebhaber. Wochenendtouren durch den Schwarzwald.',
    city: 'Freiburg',
    lat: 47.9990,
    lng: 7.8421,
    riding_styles: ['Café Racer', 'Classic'],
    instagram_url: 'https://www.instagram.com/marco_sr500',
    avatar_url: 'https://api.dicebear.com/9.x/avataaars/png?seed=marco_sr500',
  },
  {
    username: 'jenni.rides',
    full_name: 'Jennifer Krause',
    bio: 'Scrambler-Fahrerin aus Hamburg. Immer auf der Suche nach neuen Offroad-Strecken.',
    city: 'Hamburg',
    lat: 53.5511,
    lng: 9.9937,
    riding_styles: ['Scrambler', 'Adventure'],
    instagram_url: 'https://www.instagram.com/jenni.rides',
    avatar_url: 'https://api.dicebear.com/9.x/avataaars/png?seed=jenni_rides',
  },
  {
    username: 'kustom_karl',
    full_name: 'Karl-Heinz Möller',
    bio: 'Alter Hase auf zwei Rädern. Fahre seit 30 Jahren Chopper. Harley oder garnix.',
    city: 'Dortmund',
    lat: 51.5136,
    lng: 7.4653,
    riding_styles: ['Chopper', 'Cruiser'],
    avatar_url: 'https://api.dicebear.com/9.x/avataaars/png?seed=kustom_karl',
  },
  {
    username: 'toni.tracker',
    full_name: 'Toni Bergmann',
    bio: 'Tracker-Builds sind mein Ding. Honda CX500 als Basis, der Rest ist Fantasie.',
    city: 'München',
    lat: 48.1351,
    lng: 11.5820,
    riding_styles: ['Tracker', 'Café Racer'],
    instagram_url: 'https://www.instagram.com/toni.tracker',
    avatar_url: 'https://api.dicebear.com/9.x/avataaars/png?seed=toni_tracker',
  },
  {
    username: 'lisa_bobber',
    full_name: 'Lisa Hartmann',
    bio: 'Bobber-Enthusiastin aus Berlin. Weniger ist mehr — cleane Lines, lauter Sound.',
    city: 'Berlin',
    lat: 52.5200,
    lng: 13.4050,
    riding_styles: ['Bobber', 'Custom'],
    instagram_url: 'https://www.instagram.com/lisa_bobber',
    tiktok_url: 'https://www.tiktok.com/@lisa_bobber',
    avatar_url: 'https://api.dicebear.com/9.x/avataaars/png?seed=lisa_bobber',
  },
  {
    username: 'max.enduro',
    full_name: 'Maximilian Reiter',
    bio: 'Enduro & Scrambler. Unter der Woche Büro, am Wochenende Schotter.',
    city: 'Stuttgart',
    lat: 48.7758,
    lng: 9.1829,
    riding_styles: ['Scrambler', 'Adventure'],
    avatar_url: 'https://api.dicebear.com/9.x/avataaars/png?seed=max_enduro',
  },
  {
    username: 'olli_caferacer',
    full_name: 'Oliver Brandt',
    bio: 'Café Racer aus Köln. CB750 Four, Halbschale, Stummellenker — fertig.',
    city: 'Köln',
    lat: 50.9375,
    lng: 6.9603,
    riding_styles: ['Café Racer', 'Classic'],
    instagram_url: 'https://www.instagram.com/olli_caferacer',
    avatar_url: 'https://api.dicebear.com/9.x/avataaars/png?seed=olli_caferacer',
  },
  {
    username: 'sarah.custom',
    full_name: 'Sarah Vogel',
    bio: 'Ich schraubt selbst. Aktuell: BMW R80 Umbau in der Garage. Updates folgen!',
    city: 'Leipzig',
    lat: 51.3397,
    lng: 12.3731,
    riding_styles: ['Café Racer', 'Brat Style'],
    instagram_url: 'https://www.instagram.com/sarah.custom',
    avatar_url: 'https://api.dicebear.com/9.x/avataaars/png?seed=sarah_custom',
  },
  {
    username: 'flo_flattrack',
    full_name: 'Florian Weber',
    bio: 'Flat Track Racing am Wochenende. XR750 Replica ist der Traum.',
    city: 'Nürnberg',
    lat: 49.4521,
    lng: 11.0767,
    riding_styles: ['Tracker', 'Flat Track'],
    avatar_url: 'https://api.dicebear.com/9.x/avataaars/png?seed=flo_flattrack',
  },
  {
    username: 'michi.chopper',
    full_name: 'Michael Schubert',
    bio: 'Chopper-Fahrer seit \'98. Panhead im Starrrahmen — so muss das.',
    city: 'Hannover',
    lat: 52.3759,
    lng: 9.7320,
    riding_styles: ['Chopper', 'Oldschool'],
    instagram_url: 'https://www.instagram.com/michi.chopper',
    avatar_url: 'https://api.dicebear.com/9.x/avataaars/png?seed=michi_chopper',
  },
  {
    username: 'anna_touring',
    full_name: 'Anna Fischer',
    bio: 'Langstrecke ist mein Ding. Alpen, Pyrenäen, Skandinavien — alles auf zwei Rädern.',
    city: 'Dresden',
    lat: 51.0504,
    lng: 13.7373,
    riding_styles: ['Touring', 'Adventure'],
    avatar_url: 'https://api.dicebear.com/9.x/avataaars/png?seed=anna_touring',
  },
  {
    username: 'rene.scrambler',
    full_name: 'René Koch',
    bio: 'Ducati Scrambler als Daily Driver. Kaffee, Kurven, Repeat.',
    city: 'Frankfurt',
    lat: 50.1109,
    lng: 8.6821,
    riding_styles: ['Scrambler', 'Café Racer'],
    instagram_url: 'https://www.instagram.com/rene.scrambler',
    avatar_url: 'https://api.dicebear.com/9.x/avataaars/png?seed=rene_scrambler',
  },
  {
    username: 'danny_twostroke',
    full_name: 'Daniel Richter',
    bio: 'Zweitakt-Junkie. MZ, Simson, Jawa — Hauptsache es qualmt und stinkt.',
    city: 'Erfurt',
    lat: 50.9787,
    lng: 11.0328,
    riding_styles: ['Classic', 'Oldschool'],
    avatar_url: 'https://api.dicebear.com/9.x/avataaars/png?seed=danny_twostroke',
  },
  {
    username: 'nina.bratstyle',
    full_name: 'Nina Schäfer',
    bio: 'Brat Style aus Düsseldorf. Kleine Bikes, großer Spaß. Aktuell: Honda CB350.',
    city: 'Düsseldorf',
    lat: 51.2277,
    lng: 6.7735,
    riding_styles: ['Brat Style', 'Custom'],
    instagram_url: 'https://www.instagram.com/nina.bratstyle',
    avatar_url: 'https://api.dicebear.com/9.x/avataaars/png?seed=nina_bratstyle',
  },
  {
    username: 'ben_iron',
    full_name: 'Benjamin Wolf',
    bio: 'Sportster Iron 883. Keep it simple, ride it hard.',
    city: 'Bremen',
    lat: 53.0793,
    lng: 8.8017,
    riding_styles: ['Bobber', 'Cruiser'],
    avatar_url: 'https://api.dicebear.com/9.x/avataaars/png?seed=ben_iron',
  },
  {
    username: 'chris.wrench',
    full_name: 'Christian Bauer',
    bio: 'Schrauber aus Leidenschaft. Garage > Sofa. Aktuelles Projekt: Kawasaki W650.',
    city: 'Mannheim',
    lat: 49.4875,
    lng: 8.4660,
    riding_styles: ['Café Racer', 'Classic'],
    avatar_url: 'https://api.dicebear.com/9.x/avataaars/png?seed=chris_wrench',
  },
  {
    username: 'lena.moto',
    full_name: 'Lena Hoffmann',
    bio: 'Moto Guzzi V7 — Italienerin mit deutschem Wohnsitz. Sonntagsfahrerin mit Stil.',
    city: 'Augsburg',
    lat: 48.3705,
    lng: 10.8978,
    riding_styles: ['Classic', 'Café Racer'],
    instagram_url: 'https://www.instagram.com/lena.moto',
    avatar_url: 'https://api.dicebear.com/9.x/avataaars/png?seed=lena_moto',
  },
  {
    username: 'jan_xsr',
    full_name: 'Jan Zimmermann',
    bio: 'Yamaha XSR700. Neo-Retro Gang. Fahre bei jedem Wetter.',
    city: 'Rostock',
    lat: 54.0924,
    lng: 12.0991,
    riding_styles: ['Café Racer', 'Custom'],
    avatar_url: 'https://api.dicebear.com/9.x/avataaars/png?seed=jan_xsr',
  },
  {
    username: 'petra.roadtrip',
    full_name: 'Petra Neumann',
    bio: 'Triumph Bonneville T120. Roadtrips mit Zelt und Schlafsack. Freiheit pur.',
    city: 'Münster',
    lat: 51.9607,
    lng: 7.6261,
    riding_styles: ['Touring', 'Classic'],
    avatar_url: 'https://api.dicebear.com/9.x/avataaars/png?seed=petra_roadtrip',
  },
  {
    username: 'alex.guzziracer',
    full_name: 'Alexander Klein',
    bio: 'Moto Guzzi Le Mans als Café Racer. Hubraum statt Turbo.',
    city: 'Regensburg',
    lat: 49.0134,
    lng: 12.1016,
    riding_styles: ['Café Racer', 'Classic'],
    instagram_url: 'https://www.instagram.com/alex.guzziracer',
    avatar_url: 'https://api.dicebear.com/9.x/avataaars/png?seed=alex_guzziracer',
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
      riding_style: rider.riding_styles[0],
      instagram_url: rider.instagram_url || null,
      tiktok_url: rider.tiktok_url || null,
      avatar_url: rider.avatar_url,
      onboarding_completed: true,
      onboarding_step: 3,
      slug: rider.username,
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
