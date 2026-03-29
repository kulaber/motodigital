'use server'

import { createClient } from '@/lib/supabase/server'

/** Helper: extract storage path from Supabase public URL */
function extractStoragePath(url: string): string | null {
  const match = url.match(/\/storage\/v1\/object\/public\/[^/]+\/(.+)$/)
  return match ? match[1] : null
}

/** Delete custom werkstatt (builder) + all associated bikes — superadmin only */
export async function deleteBuilder(profileId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Nicht autorisiert' }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase.from('profiles') as any)
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (profile?.role !== 'superadmin') return { error: 'Keine Berechtigung' }

  // 1. Find all bikes belonging to this builder
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: bikes } = await (supabase.from('bikes') as any)
    .select('id')
    .eq('seller_id', profileId) as { data: { id: string }[] | null }

  // 2. Delete bike images (storage + DB) for each bike
  for (const bike of bikes ?? []) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: images } = await (supabase.from('bike_images') as any)
      .select('url, thumbnail_url')
      .eq('bike_id', bike.id)

    if (images && images.length > 0) {
      const storagePaths = images
        .flatMap((img: { url: string; thumbnail_url?: string | null }) => [
          extractStoragePath(img.url),
          img.thumbnail_url ? extractStoragePath(img.thumbnail_url) : null,
        ])
        .filter(Boolean) as string[]

      if (storagePaths.length > 0) {
        await (supabase.storage as any).from('bike-images').remove(storagePaths)
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('bike_images') as any).delete().eq('bike_id', bike.id)
  }

  // 3. Delete all bikes
  if (bikes && bikes.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('bikes') as any).delete().eq('seller_id', profileId)
  }

  // 4. Delete builder media (storage + DB)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: media } = await (supabase.from('builder_media') as any)
    .select('url, thumbnail_url')
    .eq('profile_id', profileId)

  if (media && media.length > 0) {
    const mediaPaths = media
      .flatMap((m: { url: string; thumbnail_url?: string | null }) => [
        extractStoragePath(m.url),
        m.thumbnail_url ? extractStoragePath(m.thumbnail_url) : null,
      ])
      .filter(Boolean) as string[]

    if (mediaPaths.length > 0) {
      await (supabase.storage as any).from('builder-media').remove(mediaPaths)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('builder_media') as any).delete().eq('profile_id', profileId)
  }

  // 5. Delete the profile itself
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('profiles') as any).delete().eq('id', profileId)

  if (error) return { error: error.message }
  return { success: true }
}
