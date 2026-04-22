#!/usr/bin/env node
/**
 * Migration: rename all female fake-rider bot profiles to male equivalents
 * and replace female face-avatars with motorcycle Unsplash photos.
 *
 * Run: node scripts/migrate-fake-riders-to-male.mjs
 *
 * Idempotent: if a row was already migrated (old username not found),
 * the step is skipped. Updates matching bot profiles in place — the
 * profile id / auth user / posts / likes / rides remain intact.
 *
 * The auth user's placeholder email (bot-<old-username>@motodigital.local)
 * is also rewritten so the email prefix matches the new username.
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

// ── Rename map ───────────────────────────────────────────────────────
// Each entry: the field set overridden when the old username is found.
// `new_avatar_url` is only set where the old record had a female face
// avatar that needs replacing with a motorcycle photo.
const RENAMES = [
  // ── batch 1 ─────────────────────────────────────────────────────
  {
    old_username: 'jenni.rides',
    new_username: 'jens.rides',
    new_full_name: 'Jens K.',
    new_bio: 'Scrambler-Fahrer aus Hamburg. Immer auf der Suche nach neuen Offroad-Strecken.',
    new_instagram_url: 'https://www.instagram.com/jens.rides',
    new_avatar_url: 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=400&h=400&fit=crop',
  },
  {
    old_username: 'lisaontwowheels',
    new_username: 'leo_ontwowheels',
    new_full_name: 'Leo H.',
    new_bio: 'Bobber-Enthusiast aus Berlin. Weniger ist mehr — cleane Lines, lauter Sound.',
    new_instagram_url: 'https://www.instagram.com/leo_ontwowheels',
    new_tiktok_url: 'https://www.tiktok.com/@leo_ontwowheels',
    new_avatar_url: 'https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?w=400&h=400&fit=crop',
  },
  {
    old_username: 'sarahschraubt',
    new_username: 'stephanschraubt',
    new_full_name: 'Stephan V.',
    new_bio: 'Ich schraube selbst. Aktuell: BMW R80 Umbau in der Garage. Updates folgen!',
    new_instagram_url: 'https://www.instagram.com/stephanschraubt',
    new_avatar_url: 'https://images.unsplash.com/photo-1525160354320-d8e92641c563?w=400&h=400&fit=crop',
  },
  {
    old_username: 'anna.ontour',
    new_username: 'andre.ontour',
    new_full_name: 'André F.',
    new_avatar_url: 'https://images.unsplash.com/photo-1558980394-4c7c9299fe96?w=400&h=400&fit=crop',
  },
  {
    old_username: 'nina.cb350',
    new_username: 'niklas.cb350',
    new_full_name: 'Niklas',
    new_instagram_url: 'https://www.instagram.com/niklas.cb350',
    new_avatar_url: 'https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?w=400&h=400&fit=crop',
  },
  {
    old_username: 'lena.guzzi',
    new_username: 'lars.guzzi',
    new_full_name: 'Lars H.',
    new_bio: 'Moto Guzzi V7 — Italiener mit deutschem Wohnsitz. Sonntagsfahrer mit Stil.',
    new_instagram_url: 'https://www.instagram.com/lars.guzzi',
    new_avatar_url: 'https://images.unsplash.com/photo-1622185135505-2d795003994a?w=400&h=400&fit=crop',
  },
  {
    old_username: 'bonnie_petra',
    new_username: 'bonnie_peter',
    new_full_name: 'Peter N.',
  },

  // ── batch 2 ─────────────────────────────────────────────────────
  {
    old_username: 'tanja.scrambles',
    new_username: 'timo.scrambles',
    new_full_name: 'Timo P.',
    new_instagram_url: 'https://www.instagram.com/timo.scrambles',
  },
  {
    old_username: 'svenja.twostroke',
    new_username: 'sven.twostroke',
    new_full_name: 'Sven D.',
  },
  {
    old_username: 'melli.bonneville',
    new_username: 'malte.bonneville',
    new_full_name: 'Malte R.',
    new_instagram_url: 'https://www.instagram.com/malte.bonneville',
  },
  {
    old_username: 'katja.rides.north',
    new_username: 'kai.rides.north',
    new_full_name: 'Kai W.',
  },
  {
    old_username: 'jule_sr500',
    new_username: 'juri_sr500',
    new_full_name: 'Juri K.',
  },
  {
    old_username: 'vera.enduro',
    new_username: 'volker.enduro',
    new_full_name: 'Volker L.',
    new_instagram_url: 'https://www.instagram.com/volker.enduro',
  },

  // ── batch 3 ─────────────────────────────────────────────────────
  {
    old_username: 'mira.scramble',
    new_username: 'mirko.scramble',
    new_full_name: 'Mirko K.',
    new_instagram_url: 'https://www.instagram.com/mirko.scramble',
  },
  {
    old_username: 'nadine.bonnie',
    new_username: 'nando.bonnie',
    new_full_name: 'Nando R.',
    new_instagram_url: 'https://www.instagram.com/nando.bonnie',
  },
  {
    old_username: 'isabel.rides',
    new_username: 'ingo.rides',
    new_full_name: 'Ingo M.',
    new_instagram_url: 'https://www.instagram.com/ingo.rides',
  },
  {
    old_username: 'jana.tracker',
    new_username: 'jakob.tracker',
    new_full_name: 'Jakob W.',
    new_instagram_url: 'https://www.instagram.com/jakob.tracker',
  },
  {
    old_username: 'lara.scrambler',
    new_username: 'lasse.scrambler',
    new_full_name: 'Lasse S.',
    new_instagram_url: 'https://www.instagram.com/lasse.scrambler',
  },
  {
    old_username: 'rebecca.bonneville',
    new_username: 'robin.bonneville',
    new_full_name: 'Robin J.',
    new_instagram_url: 'https://www.instagram.com/robin.bonneville',
    new_tiktok_url: 'https://www.tiktok.com/@robin.bonneville',
  },
  {
    old_username: 'svetlana.cb',
    new_username: 'simon.cb',
    new_full_name: 'Simon K.',
    new_instagram_url: 'https://www.instagram.com/simon.cb',
  },
  {
    old_username: 'pia.bratstyle',
    new_username: 'paul.bratstyle',
    new_full_name: 'Paul O.',
    new_bio: 'Yamaha XV750 Brat. Selbst geschweißter Heckrahmen, eigenen Sattler gefunden.',
    new_instagram_url: 'https://www.instagram.com/paul.bratstyle',
  },
  {
    old_username: 'beata.tracker',
    new_username: 'benni.tracker',
    new_full_name: 'Benni L.',
    new_instagram_url: 'https://www.instagram.com/benni.tracker',
  },
  {
    old_username: 'mara.thruxton',
    new_username: 'mads.thruxton',
    new_full_name: 'Mads V.',
    new_instagram_url: 'https://www.instagram.com/mads.thruxton',
  },
]

async function main() {
  console.log(`\nMigrating ${RENAMES.length} fake rider profiles to male equivalents...`)
  console.log(`Target: ${SUPABASE_URL}\n`)

  let renamed = 0
  let already = 0
  let missing = 0
  let failed = 0

  for (const r of RENAMES) {
    const { data: existing, error: selErr } = await admin
      .from('profiles')
      .select('id')
      .eq('username', r.old_username)
      .maybeSingle()

    if (selErr) {
      console.error(`  ✗  ${r.old_username} — lookup failed: ${selErr.message}`)
      failed++
      continue
    }

    if (!existing) {
      const { data: already_migrated } = await admin
        .from('profiles')
        .select('id')
        .eq('username', r.new_username)
        .maybeSingle()

      if (already_migrated) {
        console.log(`  ⏭  ${r.old_username} → ${r.new_username} — already migrated`)
        already++
      } else {
        console.log(`  ?  ${r.old_username} — not in DB (nothing to do)`)
        missing++
      }
      continue
    }

    // Update profile row
    const patch = {
      username: r.new_username,
      slug: r.new_username,
      full_name: r.new_full_name,
    }
    if (r.new_bio !== undefined) patch.bio = r.new_bio
    if (r.new_instagram_url !== undefined) patch.instagram_url = r.new_instagram_url
    if (r.new_tiktok_url !== undefined) patch.tiktok_url = r.new_tiktok_url
    if (r.new_avatar_url !== undefined) patch.avatar_url = r.new_avatar_url

    const { error: updErr } = await admin
      .from('profiles')
      .update(patch)
      .eq('id', existing.id)

    if (updErr) {
      console.error(`  ✗  ${r.old_username} → ${r.new_username} — profile update failed: ${updErr.message}`)
      failed++
      continue
    }

    // Rewrite auth user email so bot-<username>@motodigital.local stays in sync
    const newEmail = `bot-${r.new_username}@motodigital.local`
    const { error: authErr } = await admin.auth.admin.updateUserById(existing.id, {
      email: newEmail,
      user_metadata: {
        role: 'rider',
        username: r.new_username,
        full_name: r.new_full_name,
      },
    })

    if (authErr) {
      console.error(`  ⚠  ${r.new_username} — profile updated but auth email rename failed: ${authErr.message}`)
      // Don't count as failure — profile migration itself succeeded.
    }

    console.log(`  ✓  ${r.old_username} → ${r.new_username} (${r.new_full_name})`)
    renamed++
  }

  console.log(`\n────────────────────────────────`)
  console.log(`  Renamed:          ${renamed}`)
  console.log(`  Already migrated: ${already}`)
  console.log(`  Missing in DB:    ${missing}`)
  console.log(`  Failed:           ${failed}`)
  console.log(`  Total entries:    ${RENAMES.length}`)
  console.log(`────────────────────────────────\n`)
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
