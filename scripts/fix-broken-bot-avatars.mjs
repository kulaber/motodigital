#!/usr/bin/env node
/**
 * Replace the dead Unsplash URL `photo-1525160354320-d8e92641c563` (returns 404)
 * with a working motorcycle photo on every fake-rider (is_bot = true) profile
 * that still references it. Affects Juri K. (juri_sr500), Stephan V.
 * (stephanschraubt) and any batch-3 bots that drew it from the rotated pool.
 *
 * Run: node scripts/fix-broken-bot-avatars.mjs
 *
 * Idempotent: if no rows match, the script reports zero updates and exits.
 * Reads SUPABASE_URL + SERVICE_ROLE_KEY from .env.local — make sure the file
 * points at the environment you intend to fix (dev vs. prod).
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

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

const BROKEN_URL = 'https://images.unsplash.com/photo-1525160354320-d8e92641c563?w=400&h=400&fit=crop'
const REPLACEMENT_URL = 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=400&h=400&fit=crop'

console.log(`Connecting to ${SUPABASE_URL}`)
console.log(`Replacing broken avatar on bot profiles…`)

const { data: affected, error: selectErr } = await admin
  .from('profiles')
  .select('id, username, full_name')
  .eq('is_bot', true)
  .eq('avatar_url', BROKEN_URL)

if (selectErr) {
  console.error('Lookup failed:', selectErr)
  process.exit(1)
}

if (!affected || affected.length === 0) {
  console.log('No bot profiles with the broken URL found. Nothing to do.')
  process.exit(0)
}

console.log(`Found ${affected.length} affected bot profile(s):`)
for (const p of affected) {
  console.log(`  - ${p.username} (${p.full_name})`)
}

const { error: updateErr, count } = await admin
  .from('profiles')
  .update({ avatar_url: REPLACEMENT_URL }, { count: 'exact' })
  .eq('is_bot', true)
  .eq('avatar_url', BROKEN_URL)

if (updateErr) {
  console.error('Update failed:', updateErr)
  process.exit(1)
}

console.log(`✓ Updated ${count ?? affected.length} avatar(s) → ${REPLACEMENT_URL}`)
