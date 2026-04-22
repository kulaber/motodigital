#!/usr/bin/env node
/**
 * Seed script: Create 23 more fake rider profiles (batch 3)
 * Run: node scripts/seed-fake-riders-3.mjs
 *
 * - Avatars: only motorcycle/custom-bike Unsplash images (cafe racer,
 *   scrambler, custom, triumph) — reusing the verified-working photo IDs
 *   from batch 2. Some riders intentionally have no avatar (null).
 * - All locations in Germany. visited_cities filled where it fits.
 * - Marked is_bot=true via updateProfile().
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

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// ── Avatar pool: only motorcycle / custom bike Unsplash photos
//    (verified-working IDs reused from batch 2 — searches: custom motorcycle,
//    cafe racer, scrambler, triumph). Use null to opt out of an avatar.
const AVATAR_POOL = [
  'https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1525160354320-d8e92641c563?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1558980394-4c7c9299fe96?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1558980394-da1f85d3b540?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1558981359-219d6364c9c8?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1622185135505-2d795003994a?w=400&h=400&fit=crop',
]

const A = (i) => AVATAR_POOL[i % AVATAR_POOL.length]

// ── Fake Rider Data (Batch 3) ───────────────────────────────────────
const RIDERS = [
  {
    username: 'thunder_basti',
    full_name: 'Sebastian H.',
    bio: 'Triumph Thruxton 1200 R. Café Racer aus Karlsruhe, jeden Sonntag im Schwarzwald.',
    city: 'Karlsruhe',
    lat: 49.0069,
    lng: 8.4037,
    riding_style: 'flott',
    riding_styles: ['Café Racer', 'Classic'],
    instagram_url: 'https://www.instagram.com/thunder_basti',
    visited_cities: ['Schwarzwald', 'Elsass', 'Vogesen', 'Freiburg'],
    avatar_url: A(0),
  },
  {
    username: 'mirko.scramble',
    full_name: 'Mirko K.',
    bio: 'BMW R nineT Scrambler. Schotterpisten und kleine Landstraßen, lieber als Autobahn.',
    city: 'Bonn',
    lat: 50.7374,
    lng: 7.0982,
    riding_style: 'legende',
    riding_styles: ['Scrambler', 'Adventure'],
    instagram_url: 'https://www.instagram.com/mirko.scramble',
    visited_cities: ['Eifel', 'Mosel', 'Ardennen', 'Köln'],
    avatar_url: A(1),
  },
  {
    username: 'cb750_hannes',
    full_name: 'Hannes B.',
    bio: 'Honda CB750 K2 Café Racer, selbst aufgebaut. Schrauben ist mein Therapieersatz.',
    city: 'Wuppertal',
    lat: 51.2562,
    lng: 7.1508,
    riding_style: 'flott',
    riding_styles: ['Café Racer', 'Classic'],
    visited_cities: ['Bergisches Land', 'Sauerland', 'Eifel'],
    avatar_url: A(2),
  },
  {
    username: 'nando.bonnie',
    full_name: 'Nando R.',
    bio: 'Triumph Bonneville T100. Wochenende = Bike, Kaffee, Landstraße. In der Reihenfolge.',
    city: 'Wiesbaden',
    lat: 50.0782,
    lng: 8.2398,
    riding_style: 'cruiser',
    riding_styles: ['Classic', 'Café Racer'],
    instagram_url: 'https://www.instagram.com/nando.bonnie',
    visited_cities: ['Rheingau', 'Taunus', 'Odenwald', 'Mainz'],
    avatar_url: A(3),
  },
  {
    username: 'kev_xs650',
    full_name: 'Kevin T.',
    bio: 'Yamaha XS650 Brat. Kein Schnickschnack, nur Lenker, Sitzbank, Auspuff.',
    city: 'Bielefeld',
    lat: 52.0302,
    lng: 8.5325,
    riding_style: 'flott',
    riding_styles: ['Brat Style', 'Café Racer'],
    visited_cities: ['Teutoburger Wald', 'Sauerland', 'Münsterland'],
    avatar_url: null,
  },
  {
    username: 'ingo.rides',
    full_name: 'Ingo M.',
    bio: 'Ducati Scrambler Icon. Pendle täglich, fahre am Wochenende ohne Ziel.',
    city: 'Heidelberg',
    lat: 49.3988,
    lng: 8.6724,
    riding_style: 'flott',
    riding_styles: ['Scrambler', 'Café Racer'],
    instagram_url: 'https://www.instagram.com/ingo.rides',
    visited_cities: ['Odenwald', 'Pfälzerwald', 'Schwarzwald'],
    avatar_url: A(4),
  },
  {
    username: 'thommy_cb',
    full_name: 'Thomas K.',
    bio: 'Honda CB400 Four Café Racer. Klein, kurvig, leicht — alles was zählt.',
    city: 'Saarbrücken',
    lat: 49.2402,
    lng: 6.9969,
    riding_style: 'flott',
    riding_styles: ['Café Racer', 'Classic'],
    visited_cities: ['Saarschleife', 'Vogesen', 'Luxemburg', 'Pfalz'],
    avatar_url: A(5),
  },
  {
    username: 'jakob.tracker',
    full_name: 'Jakob W.',
    bio: 'Yamaha SR400 Tracker. Flat-Track-Optik mit Straßenzulassung. Klingt böser als es ist.',
    city: 'Lübeck',
    lat: 53.8655,
    lng: 10.6866,
    riding_style: 'legende',
    riding_styles: ['Tracker', 'Flat Track'],
    instagram_url: 'https://www.instagram.com/jakob.tracker',
    visited_cities: ['Ostseeküste', 'Travemünde', 'Hamburg', 'Rostock'],
    avatar_url: A(6),
  },
  {
    username: 'matze.r80',
    full_name: 'Matthias D.',
    bio: 'BMW R80 Monolever Custom. Boxer für die Ewigkeit. Liebe auf den ersten Blick.',
    city: 'Magdeburg',
    lat: 52.1205,
    lng: 11.6276,
    riding_style: 'cruiser',
    riding_styles: ['Custom', 'Classic'],
    visited_cities: ['Harz', 'Thüringer Wald', 'Sachsen'],
    avatar_url: null,
  },
  {
    username: 'lasse.scrambler',
    full_name: 'Lasse S.',
    bio: 'Triumph Scrambler 900. Ich liebe es wenn Leute auf Tankstellen Fragen stellen.',
    city: 'Oldenburg',
    lat: 53.1435,
    lng: 8.2146,
    riding_style: 'flott',
    riding_styles: ['Scrambler', 'Custom'],
    instagram_url: 'https://www.instagram.com/lasse.scrambler',
    visited_cities: ['Nordsee', 'Ostfriesland', 'Bremen', 'Hamburg'],
    avatar_url: A(7),
  },
  {
    username: 'cafe.racer.tom',
    full_name: 'Tom F.',
    bio: 'Suzuki GS550 Café Racer. Aluminium-Tank von Hand gedengelt. Stolz wie Bolle.',
    city: 'Würzburg',
    lat: 49.7913,
    lng: 9.9534,
    riding_style: 'flott',
    riding_styles: ['Café Racer', 'Custom'],
    instagram_url: 'https://www.instagram.com/cafe.racer.tom',
    visited_cities: ['Spessart', 'Rhön', 'Steigerwald', 'Frankenwald'],
    avatar_url: A(8),
  },
  {
    username: 'robin.bonneville',
    full_name: 'Robin J.',
    bio: 'Triumph Bonneville Bobber. Tief, breit, lautes Grinsen.',
    city: 'Heilbronn',
    lat: 49.1427,
    lng: 9.2109,
    riding_style: 'cruiser',
    riding_styles: ['Bobber', 'Custom'],
    instagram_url: 'https://www.instagram.com/robin.bonneville',
    tiktok_url: 'https://www.tiktok.com/@robin.bonneville',
    visited_cities: ['Schwäbische Alb', 'Stuttgart', 'Heidelberg'],
    avatar_url: A(9),
  },
  {
    username: 'enzo_motoguzzi',
    full_name: 'Enzo P.',
    bio: 'Moto Guzzi V9 Bobber. Italienisches Design, deutsches Wetter.',
    city: 'Ulm',
    lat: 48.4011,
    lng: 9.9876,
    riding_style: 'cruiser',
    riding_styles: ['Bobber', 'Classic'],
    visited_cities: ['Bodensee', 'Allgäu', 'Schwarzwald', 'Schweiz'],
    avatar_url: A(0),
  },
  {
    username: 'wendelin.classic',
    full_name: 'Wendelin H.',
    bio: 'Norton Commando 850. Englischer Klassiker, fährt nur bei Sonnenschein.',
    city: 'Tübingen',
    lat: 48.5216,
    lng: 9.0576,
    riding_style: 'cruiser',
    riding_styles: ['Classic', 'Café Racer'],
    visited_cities: ['Schwäbische Alb', 'Schwarzwald', 'Donautal'],
    avatar_url: null,
  },
  {
    username: 'fabi.streettracker',
    full_name: 'Fabian U.',
    bio: 'XSR700 zum Street Tracker umgebaut. Daily Driver, kein Garagenkönig.',
    city: 'Erlangen',
    lat: 49.5897,
    lng: 11.0078,
    riding_style: 'legende',
    riding_styles: ['Tracker', 'Custom'],
    instagram_url: 'https://www.instagram.com/fabi.streettracker',
    visited_cities: ['Frankenwald', 'Fichtelgebirge', 'Bayreuth'],
    avatar_url: A(1),
  },
  {
    username: 'simon.cb',
    full_name: 'Simon K.',
    bio: 'Honda CB500T Café Racer. Aus Berlin in den Brandenburgischen Norden — immer.',
    city: 'Potsdam',
    lat: 52.3906,
    lng: 13.0645,
    riding_style: 'flott',
    riding_styles: ['Café Racer', 'Classic'],
    instagram_url: 'https://www.instagram.com/simon.cb',
    visited_cities: ['Spreewald', 'Mecklenburg', 'Berlin'],
    avatar_url: A(2),
  },
  {
    username: 'jonas.scram',
    full_name: 'Jonas E.',
    bio: 'Triumph Scrambler 1200 XE. Forstwege > Autobahn. Punkt.',
    city: 'Konstanz',
    lat: 47.6603,
    lng: 9.1758,
    riding_style: 'legende',
    riding_styles: ['Scrambler', 'Adventure'],
    visited_cities: ['Bodensee', 'Vorarlberg', 'Allgäu', 'Schweiz'],
    avatar_url: A(3),
  },
  {
    username: 'paul.bratstyle',
    full_name: 'Paul O.',
    bio: 'Yamaha XV750 Brat. Selbst geschweißter Heckrahmen, eigenen Sattler gefunden.',
    city: 'Göttingen',
    lat: 51.5413,
    lng: 9.9158,
    riding_style: 'flott',
    riding_styles: ['Brat Style', 'Custom'],
    instagram_url: 'https://www.instagram.com/paul.bratstyle',
    visited_cities: ['Harz', 'Solling', 'Weserbergland'],
    avatar_url: A(4),
  },
  {
    username: 'ralf_w650',
    full_name: 'Ralf K.',
    bio: 'Kawasaki W650 Café Racer. Speichenräder, Lederpad, kein Display.',
    city: 'Aschaffenburg',
    lat: 49.9769,
    lng: 9.1436,
    riding_style: 'flott',
    riding_styles: ['Café Racer', 'Classic'],
    visited_cities: ['Spessart', 'Odenwald', 'Rhön'],
    avatar_url: null,
  },
  {
    username: 'benni.tracker',
    full_name: 'Benni L.',
    bio: 'Honda Dominator NX650 Tracker-Umbau. Robust, leicht, geländegängig.',
    city: 'Cottbus',
    lat: 51.7563,
    lng: 14.3329,
    riding_style: 'legende',
    riding_styles: ['Tracker', 'Scrambler'],
    instagram_url: 'https://www.instagram.com/benni.tracker',
    visited_cities: ['Spreewald', 'Lausitz', 'Sächsische Schweiz'],
    avatar_url: A(5),
  },
  {
    username: 'arne_chopper',
    full_name: 'Arne D.',
    bio: 'Harley Shovelhead Chopper. Selbst aufgebaut, fährt seit 12 Jahren störungsfrei.',
    city: 'Flensburg',
    lat: 54.7937,
    lng: 9.4460,
    riding_style: 'cruiser',
    riding_styles: ['Chopper', 'Oldschool'],
    visited_cities: ['Dänemark', 'Sylt', 'Ostseeküste'],
    avatar_url: null,
  },
  {
    username: 'mads.thruxton',
    full_name: 'Mads V.',
    bio: 'Triumph Thruxton R. Café Racer pur, jedes Wochenende auf der Strecke.',
    city: 'Trier',
    lat: 49.7596,
    lng: 6.6441,
    riding_style: 'flott',
    riding_styles: ['Café Racer', 'Classic'],
    instagram_url: 'https://www.instagram.com/mads.thruxton',
    visited_cities: ['Mosel', 'Eifel', 'Luxemburg', 'Saarland'],
    avatar_url: A(6),
  },
  {
    username: 'henrik.boxer',
    full_name: 'Henrik P.',
    bio: 'BMW R100R Custom. Boxermotor, simple Elektrik, alles selbst gemacht.',
    city: 'Marburg',
    lat: 50.8022,
    lng: 8.7665,
    riding_style: 'cruiser',
    riding_styles: ['Custom', 'Classic'],
    visited_cities: ['Vogelsberg', 'Sauerland', 'Rhön', 'Westerwald'],
    avatar_url: A(7),
  },
]

// ── Main ─────────────────────────────────────────────────────────────
async function main() {
  console.log(`\nSeeding ${RIDERS.length} fake rider profiles (batch 3)...`)
  console.log(`Target: ${SUPABASE_URL}\n`)

  let created = 0
  let skipped = 0
  let failed = 0

  for (const rider of RIDERS) {
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
    await new Promise((r) => setTimeout(r, 1500))

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
      visited_cities: rider.visited_cities || null,
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

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
