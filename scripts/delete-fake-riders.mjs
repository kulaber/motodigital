#!/usr/bin/env node
/**
 * Cleanup script: Delete all is_bot=true profiles (fake riders)
 * Run against a specific project by setting env inline:
 *   NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
 *     node scripts/delete-fake-riders.mjs
 *
 * Falls back to .env.local if env vars are not set.
 * Deletes via auth.admin.deleteUser() — profile row cascades.
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
  console.error('Missing SUPABASE_URL or SERVICE_ROLE_KEY')
  process.exit(1)
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function main() {
  console.log(`\nDeleting fake riders on: ${SUPABASE_URL}\n`)

  const { data: bots, error } = await admin
    .from('profiles')
    .select('id, username')
    .eq('is_bot', true)

  if (error) {
    console.error('Failed to list bots:', error.message)
    process.exit(1)
  }

  if (!bots || bots.length === 0) {
    console.log('No bot profiles found. Nothing to delete.')
    return
  }

  console.log(`Found ${bots.length} bot profiles. Deleting...\n`)

  let deleted = 0
  let failed = 0

  for (const bot of bots) {
    const { error: delErr } = await admin.auth.admin.deleteUser(bot.id)
    if (delErr) {
      console.error(`  ✗  ${bot.username} — ${delErr.message}`)
      failed++
    } else {
      console.log(`  ✓  ${bot.username}`)
      deleted++
    }
  }

  console.log(`\n────────────────────────────────`)
  console.log(`  Deleted: ${deleted}`)
  console.log(`  Failed:  ${failed}`)
  console.log(`────────────────────────────────\n`)
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
