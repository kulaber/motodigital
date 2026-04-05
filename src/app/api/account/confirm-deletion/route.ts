import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient as createAdmin } from '@supabase/supabase-js'

function extractStoragePath(url: string): string | null {
  const match = url.match(/\/storage\/v1\/object\/public\/[^/]+\/(.+)$/)
  return match ? match[1] : null
}

export async function GET(req: NextRequest) {
  const uid = req.nextUrl.searchParams.get('uid')
  const token = req.nextUrl.searchParams.get('t')
  const exp = req.nextUrl.searchParams.get('exp')
  const baseUrl = req.nextUrl.origin

  if (!uid || !token || !exp) {
    return NextResponse.redirect(new URL('/account-deleted?status=invalid', baseUrl))
  }

  const expires = parseInt(exp)
  if (isNaN(expires) || Date.now() > expires) {
    return NextResponse.redirect(new URL('/account-deleted?status=expired', baseUrl))
  }

  // Verify HMAC token
  const expected = crypto
    .createHmac('sha256', process.env.SUPABASE_SERVICE_ROLE_KEY!)
    .update(`delete:${uid}:${expires}`)
    .digest('hex')

  try {
    if (!crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected))) {
      return NextResponse.redirect(new URL('/account-deleted?status=invalid', baseUrl))
    }
  } catch {
    return NextResponse.redirect(new URL('/account-deleted?status=invalid', baseUrl))
  }

  const admin = createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  try {
    // ── 1. Clean up bike images from storage ──
    const { data: bikes } = await admin
      .from('bikes')
      .select('id')
      .eq('seller_id', uid)

    for (const bike of bikes ?? []) {
      const { data: images } = await admin
        .from('bike_images')
        .select('url, thumbnail_url')
        .eq('bike_id', bike.id)

      if (images?.length) {
        const paths = images
          .flatMap((img: { url: string; thumbnail_url?: string | null }) => [
            extractStoragePath(img.url),
            img.thumbnail_url ? extractStoragePath(img.thumbnail_url) : null,
          ])
          .filter(Boolean) as string[]

        if (paths.length > 0) {
          await admin.storage.from('bike-images').remove(paths)
        }
      }
    }

    // ── 2. Clean up builder media from storage ──
    const { data: builderMedia } = await admin
      .from('builder_media')
      .select('url, thumbnail_url')
      .eq('profile_id', uid)

    if (builderMedia?.length) {
      const mediaPaths = builderMedia
        .flatMap((m: { url: string; thumbnail_url?: string | null }) => [
          extractStoragePath(m.url),
          m.thumbnail_url ? extractStoragePath(m.thumbnail_url) : null,
        ])
        .filter(Boolean) as string[]

      if (mediaPaths.length > 0) {
        await admin.storage.from('builder-media').remove(mediaPaths)
      }
    }

    // ── 3. Clean up community post media from storage ──
    const { data: communityPosts } = await admin
      .from('community_posts')
      .select('media_urls')
      .eq('user_id', uid)

    for (const post of communityPosts ?? []) {
      const mediaUrls: string[] = post.media_urls ?? []
      if (mediaUrls.length > 0) {
        const paths = mediaUrls
          .map((url: string) => extractStoragePath(url))
          .filter(Boolean) as string[]
        if (paths.length > 0) {
          await admin.storage.from('community-media').remove(paths)
        }
      }
    }

    // ── 4. Clean up avatar from storage ──
    const { data: avatarFiles } = await admin.storage.from('avatars').list(uid)
    if (avatarFiles?.length) {
      await admin.storage.from('avatars').remove(avatarFiles.map(f => `${uid}/${f.name}`))
    }

    // ── 5. Delete auth user (cascades to profile → all FK-linked rows) ──
    const { error: authError } = await admin.auth.admin.deleteUser(uid)
    if (authError) {
      console.error('[Account Deletion] Auth delete error:', authError)
      return NextResponse.redirect(new URL('/account-deleted?status=error', baseUrl))
    }

    return NextResponse.redirect(new URL('/account-deleted?status=success', baseUrl))
  } catch (err) {
    console.error('[Account Deletion] Error:', err)
    return NextResponse.redirect(new URL('/account-deleted?status=error', baseUrl))
  }
}
