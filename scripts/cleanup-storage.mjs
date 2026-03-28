/**
 * Supabase Storage Cleanup Script
 * Finds and removes orphaned files that are no longer referenced in the database.
 *
 * Usage:
 *   node scripts/cleanup-storage.mjs          # Dry run (audit only)
 *   node scripts/cleanup-storage.mjs --delete  # Actually delete orphaned files
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// Parse .env.local manually (no dotenv dependency needed)
const envPath = resolve(process.cwd(), '.env.local')
const envContent = readFileSync(envPath, 'utf-8')
for (const line of envContent.split('\n')) {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith('#')) continue
  const eqIdx = trimmed.indexOf('=')
  if (eqIdx === -1) continue
  const key = trimmed.slice(0, eqIdx).trim()
  const val = trimmed.slice(eqIdx + 1).trim()
  if (!process.env[key]) process.env[key] = val
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY)
const DRY_RUN = !process.argv.includes('--delete')

if (DRY_RUN) {
  console.log('\n🔍  DRY RUN — nur Audit, nichts wird gelöscht.\n    Zum Löschen: node scripts/cleanup-storage.mjs --delete\n')
} else {
  console.log('\n🗑️   DELETE MODE — verwaiste Dateien werden gelöscht!\n')
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Recursively list all files in a bucket (handles nested folders) */
async function listAllFiles(bucket, prefix = '') {
  const files = []
  const { data, error } = await supabase.storage.from(bucket).list(prefix, { limit: 1000 })
  if (error) { console.error(`  Error listing ${bucket}/${prefix}:`, error.message); return files }

  for (const item of data ?? []) {
    const path = prefix ? `${prefix}/${item.name}` : item.name
    if (item.id) {
      // It's a file
      files.push(path)
    } else {
      // It's a folder — recurse
      const nested = await listAllFiles(bucket, path)
      files.push(...nested)
    }
  }
  return files
}

/** Build public URL for a storage path */
function publicUrl(bucket, path) {
  return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`
}

/** Remove orphans from a bucket */
async function removeOrphans(bucket, orphanPaths) {
  if (orphanPaths.length === 0) return
  // Supabase storage.remove() accepts max ~1000 paths per call
  const batchSize = 100
  for (let i = 0; i < orphanPaths.length; i += batchSize) {
    const batch = orphanPaths.slice(i, i + batchSize)
    const { error } = await supabase.storage.from(bucket).remove(batch)
    if (error) console.error(`  Error deleting batch from ${bucket}:`, error.message)
  }
}

// ─── Bucket Cleaners ─────────────────────────────────────────────────────────

async function cleanBikeImages() {
  console.log('━━━ bike-images ━━━')
  const files = await listAllFiles('bike-images')
  console.log(`  Dateien im Bucket: ${files.length}`)
  if (files.length === 0) return []

  // Get all referenced URLs from bike_images table
  const { data: rows } = await supabase.from('bike_images').select('url, thumbnail_url')
  const referencedUrls = new Set()
  for (const row of rows ?? []) {
    if (row.url) referencedUrls.add(row.url)
    if (row.thumbnail_url) referencedUrls.add(row.thumbnail_url)
  }

  const orphans = files.filter(f => !referencedUrls.has(publicUrl('bike-images', f)))
  console.log(`  Referenziert in DB: ${referencedUrls.size}`)
  console.log(`  Verwaist: ${orphans.length}`)
  orphans.forEach(f => console.log(`    ❌ ${f}`))

  if (!DRY_RUN && orphans.length > 0) {
    await removeOrphans('bike-images', orphans)
    console.log(`  ✅ ${orphans.length} Dateien gelöscht`)
  }
  return orphans
}

async function cleanBuilderMedia() {
  console.log('\n━━━ builder-media ━━━')
  const files = await listAllFiles('builder-media')
  console.log(`  Dateien im Bucket: ${files.length}`)
  if (files.length === 0) return []

  // Referenced in builder_media.url
  const { data: mediaRows } = await supabase.from('builder_media').select('url')
  // Referenced in profiles.avatar_url (workshops store avatars here)
  const { data: profileRows } = await supabase.from('profiles').select('avatar_url')

  const referencedUrls = new Set()
  for (const row of mediaRows ?? []) {
    if (row.url) referencedUrls.add(row.url)
  }
  for (const row of profileRows ?? []) {
    if (row.avatar_url && row.avatar_url.includes('builder-media')) {
      referencedUrls.add(row.avatar_url)
    }
  }

  const orphans = files.filter(f => !referencedUrls.has(publicUrl('builder-media', f)))
  console.log(`  Referenziert in DB: ${referencedUrls.size}`)
  console.log(`  Verwaist: ${orphans.length}`)
  orphans.forEach(f => console.log(`    ❌ ${f}`))

  if (!DRY_RUN && orphans.length > 0) {
    await removeOrphans('builder-media', orphans)
    console.log(`  ✅ ${orphans.length} Dateien gelöscht`)
  }
  return orphans
}

async function cleanCommunityMedia() {
  console.log('\n━━━ community-media ━━━')
  const files = await listAllFiles('community-media')
  console.log(`  Dateien im Bucket: ${files.length}`)
  if (files.length === 0) return []

  // Referenced in community_posts.media_urls (text[] column)
  const { data: posts } = await supabase.from('community_posts').select('media_urls')
  const referencedUrls = new Set()
  for (const post of posts ?? []) {
    for (const url of post.media_urls ?? []) {
      referencedUrls.add(url)
    }
  }

  const orphans = files.filter(f => !referencedUrls.has(publicUrl('community-media', f)))
  console.log(`  Referenziert in DB: ${referencedUrls.size}`)
  console.log(`  Verwaist: ${orphans.length}`)
  orphans.forEach(f => console.log(`    ❌ ${f}`))

  if (!DRY_RUN && orphans.length > 0) {
    await removeOrphans('community-media', orphans)
    console.log(`  ✅ ${orphans.length} Dateien gelöscht`)
  }
  return orphans
}

async function cleanAvatars() {
  console.log('\n━━━ avatars ━━━')
  const files = await listAllFiles('avatars')
  console.log(`  Dateien im Bucket: ${files.length}`)
  if (files.length === 0) return []

  // Referenced in profiles.avatar_url
  const { data: profiles } = await supabase.from('profiles').select('avatar_url')
  const referencedUrls = new Set()
  for (const row of profiles ?? []) {
    if (row.avatar_url && row.avatar_url.includes('/avatars/')) {
      referencedUrls.add(row.avatar_url)
    }
  }

  const orphans = files.filter(f => !referencedUrls.has(publicUrl('avatars', f)))
  console.log(`  Referenziert in DB: ${referencedUrls.size}`)
  console.log(`  Verwaist: ${orphans.length}`)
  orphans.forEach(f => console.log(`    ❌ ${f}`))

  if (!DRY_RUN && orphans.length > 0) {
    await removeOrphans('avatars', orphans)
    console.log(`  ✅ ${orphans.length} Dateien gelöscht`)
  }
  return orphans
}

async function cleanChatImages() {
  console.log('\n━━━ chat-images ━━━')
  const files = await listAllFiles('chat-images')
  console.log(`  Dateien im Bucket: ${files.length}`)
  if (files.length === 0) return []

  // Referenced in messages.body as [img:URL] or direct URL
  const { data: messages } = await supabase.from('messages').select('body')
  const referencedUrls = new Set()
  for (const msg of messages ?? []) {
    if (!msg.body) continue
    // Extract URLs from [img:URL] pattern
    const imgMatches = msg.body.matchAll(/\[img:(https?:\/\/[^\]]+)\]/g)
    for (const m of imgMatches) referencedUrls.add(m[1])
    // Also check for direct storage URLs in body
    if (msg.body.includes('chat-images')) referencedUrls.add(msg.body)
  }

  const orphans = files.filter(f => !referencedUrls.has(publicUrl('chat-images', f)))
  console.log(`  Referenziert in DB: ${referencedUrls.size}`)
  console.log(`  Verwaist: ${orphans.length}`)
  orphans.forEach(f => console.log(`    ❌ ${f}`))

  if (!DRY_RUN && orphans.length > 0) {
    await removeOrphans('chat-images', orphans)
    console.log(`  ✅ ${orphans.length} Dateien gelöscht`)
  }
  return orphans
}

async function cleanBuildMedia() {
  console.log('\n━━━ build-media ━━━')
  const files = await listAllFiles('build-media')
  console.log(`  Dateien im Bucket: ${files.length}`)
  if (files.length === 0) return []

  // Referenced in build_posts.media_urls (text[] column)
  const { data: posts } = await supabase.from('build_posts').select('media_urls')
  const referencedUrls = new Set()
  for (const post of posts ?? []) {
    for (const url of post.media_urls ?? []) {
      referencedUrls.add(url)
    }
  }

  const orphans = files.filter(f => !referencedUrls.has(publicUrl('build-media', f)))
  console.log(`  Referenziert in DB: ${referencedUrls.size}`)
  console.log(`  Verwaist: ${orphans.length}`)
  orphans.forEach(f => console.log(`    ❌ ${f}`))

  if (!DRY_RUN && orphans.length > 0) {
    await removeOrphans('build-media', orphans)
    console.log(`  ✅ ${orphans.length} Dateien gelöscht`)
  }
  return orphans
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const results = {
    'bike-images': await cleanBikeImages(),
    'builder-media': await cleanBuilderMedia(),
    'community-media': await cleanCommunityMedia(),
    'avatars': await cleanAvatars(),
    'chat-images': await cleanChatImages(),
    'build-media': await cleanBuildMedia(),
  }

  const totalOrphans = Object.values(results).reduce((sum, arr) => sum + arr.length, 0)

  console.log('\n══════════════════════════════════════')
  console.log(`  Gesamt verwaiste Dateien: ${totalOrphans}`)
  if (DRY_RUN && totalOrphans > 0) {
    console.log('  → Zum Löschen: node scripts/cleanup-storage.mjs --delete')
  } else if (!DRY_RUN && totalOrphans > 0) {
    console.log('  ✅ Alle verwaisten Dateien wurden gelöscht.')
  } else {
    console.log('  ✅ Keine verwaisten Dateien gefunden!')
  }
  console.log('══════════════════════════════════════\n')
}

main().catch(err => { console.error('Fatal:', err); process.exit(1) })
