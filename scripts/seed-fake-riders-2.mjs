#!/usr/bin/env node
/**
 * Seed script: Create 15 more fake rider profiles (batch 2)
 * Run: node scripts/seed-fake-riders-2.mjs
 *
 * - Profile pictures are motorcycle / custom bike images (not faces)
 * - Some riders have no avatar
 * - All have random visited_cities filled in
 * - No bikes added
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

// ── Fake Rider Data (Batch 2) ───────────────────────────────────────
const RIDERS = [
  {
    username: 'steffen_w800',
    full_name: 'Steffen M.',
    bio: 'Kawasaki W800 im Originalzustand. Retro ohne Kompromisse.',
    city: 'Kassel',
    lat: 51.3127,
    lng: 9.4797,
    riding_style: 'legende',
    riding_styles: ['Classic', 'Café Racer'],
    visited_cities: ['München', 'Hamburg', 'Schwarzwald', 'Eifel', 'Harz'],
    avatar_url: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=400&h=400&fit=crop',
  },
  {
    username: 'tanja.scrambles',
    full_name: 'Tanja P.',
    bio: 'Triumph Scrambler 1200. Feldwege sind meine Autobahn.',
    city: 'Kiel',
    lat: 54.3233,
    lng: 10.1228,
    riding_style: 'legende',
    riding_styles: ['Scrambler', 'Adventure'],
    instagram_url: 'https://www.instagram.com/tanja.scrambles',
    visited_cities: ['Dänemark', 'Ostseeküste', 'Rügen', 'Hamburg'],
    avatar_url: null,
  },
  {
    username: 'cb_philipp',
    full_name: 'Philipp G.',
    bio: 'Honda CB550 Café Racer. Selbst gebaut in der Hinterhof-Garage.',
    city: 'Mainz',
    lat: 49.9929,
    lng: 8.2473,
    riding_style: 'flott',
    riding_styles: ['Café Racer', 'Custom'],
    instagram_url: 'https://www.instagram.com/cb_philipp',
    visited_cities: ['Moseltal', 'Eifel', 'Schwarzwald', 'Elsass', 'Köln'],
    avatar_url: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=400&h=400&fit=crop',
  },
  {
    username: 'svenja.twostroke',
    full_name: 'Svenja D.',
    bio: 'Zweitakt-Seele. Fahre eine alte Yamaha RD350 — laut, schnell, illegal gut.',
    city: 'Braunschweig',
    lat: 52.2689,
    lng: 10.5268,
    riding_style: 'flott',
    riding_styles: ['Classic', 'Oldschool'],
    visited_cities: ['Harz', 'Goslar', 'Wernigerode', 'Berlin'],
    avatar_url: 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=400&h=400&fit=crop',
  },
  {
    username: 'chopper_dieter',
    full_name: 'Dieter S.',
    bio: 'Old School Chopper. Shovelhead im Starrahmen. Kein Blinker, kein Problem.',
    city: 'Essen',
    lat: 51.4556,
    lng: 7.0116,
    riding_style: 'cruiser',
    riding_styles: ['Chopper', 'Oldschool'],
    visited_cities: ['Niederlande', 'Belgien', 'Eifel', 'Sauerland', 'Hamburg', 'Sylt'],
    avatar_url: 'https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?w=400&h=400&fit=crop',
  },
  {
    username: 'melli.bonneville',
    full_name: 'Melanie R.',
    bio: 'Triumph Bonneville T100. Eleganz auf zwei Rädern. Weekend Rides nur bei Sonne.',
    city: 'Bonn',
    lat: 50.7374,
    lng: 7.0982,
    riding_style: 'cruiser',
    riding_styles: ['Classic', 'Touring'],
    instagram_url: 'https://www.instagram.com/melli.bonneville',
    visited_cities: ['Eifel', 'Moseltal', 'Luxemburg', 'Köln', 'Aachen'],
    avatar_url: null,
  },
  {
    username: 'lukas_tracker',
    full_name: 'Lukas B.',
    bio: 'Yamaha XS650 Tracker Build. Flat Track ist Lebenseinstellung.',
    city: 'Würzburg',
    lat: 49.7913,
    lng: 9.9534,
    riding_style: 'flott',
    riding_styles: ['Tracker', 'Flat Track'],
    visited_cities: ['Spessart', 'Rhön', 'Nürnberg', 'München', 'Alpen'],
    avatar_url: 'https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?w=400&h=400&fit=crop',
  },
  {
    username: 'katja.rides.north',
    full_name: 'Katja W.',
    bio: 'Royal Enfield Continental GT. Zwischen Deich und Düne unterwegs.',
    city: 'Oldenburg',
    lat: 53.1435,
    lng: 8.2146,
    riding_style: 'legende',
    riding_styles: ['Café Racer', 'Classic'],
    visited_cities: ['Nordsee', 'Ostfriesland', 'Bremerhaven', 'Cuxhaven'],
    avatar_url: null,
  },
  {
    username: 'r9t_nico',
    full_name: 'Nico F.',
    bio: 'BMW R nineT Pure. Puristisch, schnell, deutsch. Alpenpässe am liebsten.',
    city: 'Garmisch-Partenkirchen',
    lat: 47.4917,
    lng: 11.0958,
    riding_style: 'flott',
    riding_styles: ['Café Racer', 'Adventure'],
    instagram_url: 'https://www.instagram.com/r9t_nico',
    visited_cities: ['Stelvio', 'Timmelsjoch', 'Großglockner', 'Dolomiten', 'Gardasee', 'Innsbruck'],
    avatar_url: 'https://images.unsplash.com/photo-1558980394-4c7c9299fe96?w=400&h=400&fit=crop',
  },
  {
    username: 'jule_sr500',
    full_name: 'Jule K.',
    bio: 'Yamaha SR500 mit Kickstarter-Ritual. Jeder Start ein kleines Abenteuer.',
    city: 'Potsdam',
    lat: 52.3906,
    lng: 13.0645,
    riding_style: 'legende',
    riding_styles: ['Classic', 'Brat Style'],
    visited_cities: ['Berlin', 'Spreewald', 'Ostsee', 'Leipzig'],
    avatar_url: 'https://images.unsplash.com/photo-1525160354320-d8e92641c563?w=400&h=400&fit=crop',
  },
  {
    username: 'bobber_henning',
    full_name: 'Henning A.',
    bio: 'Harley Softail Slim als Bobber. Spring-Seat, Ape Hanger, schwarze Lackierung.',
    city: 'Lübeck',
    lat: 53.8655,
    lng: 10.6866,
    riding_style: 'cruiser',
    riding_styles: ['Bobber', 'Cruiser'],
    visited_cities: ['Ostsee', 'Hamburg', 'Travemünde', 'Dänemark', 'Fehmarn'],
    avatar_url: 'https://images.unsplash.com/photo-1558981359-219d6364c9c8?w=400&h=400&fit=crop',
  },
  {
    username: 'vera.enduro',
    full_name: 'Vera L.',
    bio: 'Husqvarna 701 Enduro. Dreck unter den Nägeln gehört dazu.',
    city: 'Freiburg',
    lat: 47.9990,
    lng: 7.8421,
    riding_style: 'legende',
    riding_styles: ['Adventure', 'Scrambler'],
    instagram_url: 'https://www.instagram.com/vera.enduro',
    visited_cities: ['Schwarzwald', 'Vogesen', 'Schweiz', 'Bodensee'],
    avatar_url: null,
  },
  {
    username: 'ducati_marcel',
    full_name: 'Marcel T.',
    bio: 'Ducati Sport Classic 1000. V-Twin Sound ist Musik. Kurvenräuber aus dem Saarland.',
    city: 'Saarbrücken',
    lat: 49.2402,
    lng: 6.9969,
    riding_style: 'flott',
    riding_styles: ['Café Racer', 'Custom'],
    instagram_url: 'https://www.instagram.com/ducati_marcel',
    visited_cities: ['Lothringen', 'Luxemburg', 'Eifel', 'Hunsrück', 'Vogesen', 'Nürburgring'],
    avatar_url: 'https://images.unsplash.com/photo-1558980394-da1f85d3b540?w=400&h=400&fit=crop',
  },
  {
    username: 'simson_erik',
    full_name: 'Erik O.',
    bio: 'Simson S51 Enduro. Ostdeutsche Legende, 60 km/h reichen völlig.',
    city: 'Chemnitz',
    lat: 50.8278,
    lng: 12.9214,
    riding_style: 'legende',
    riding_styles: ['Classic', 'Oldschool'],
    visited_cities: ['Erzgebirge', 'Leipzig', 'Dresden', 'Sächsische Schweiz', 'Thüringer Wald'],
    avatar_url: null,
  },
  {
    username: 'norton_frank',
    full_name: 'Frank H.',
    bio: 'Norton Commando 961. British Iron mit deutschem TÜV. Seltener Anblick auf der Straße.',
    city: 'Wiesbaden',
    lat: 50.0782,
    lng: 8.2398,
    riding_style: 'flott',
    riding_styles: ['Classic', 'Café Racer'],
    instagram_url: 'https://www.instagram.com/norton_frank',
    visited_cities: ['Taunus', 'Rheingau', 'Moseltal', 'Frankfurt', 'Heidelberg'],
    avatar_url: 'https://images.unsplash.com/photo-1622185135505-2d795003994a?w=400&h=400&fit=crop',
  },
]

// ── Main ─────────────────────────────────────────────────────────────
async function main() {
  console.log(`\nSeeding ${RIDERS.length} fake rider profiles (batch 2)...\n`)

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
      visited_cities: rider.visited_cities || [],
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
