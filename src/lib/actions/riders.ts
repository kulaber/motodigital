'use server'

import { createClient } from '@/lib/supabase/server'

/** Helper: extract storage path from Supabase public URL */
function extractStoragePath(url: string): string | null {
  const match = url.match(/\/storage\/v1\/object\/public\/[^/]+\/(.+)$/)
  return match ? match[1] : null
}

/** Delete rider — superadmin only. Cleans up all storage files before cascade-deleting the profile. */
export async function deleteRider(riderId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Nicht autorisiert' }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: me } = await (supabase.from('profiles') as any)
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (me?.role !== 'superadmin') return { error: 'Keine Berechtigung' }

  // 1. Clean up avatar files (avatars bucket)
  const { data: avatarFiles } = await supabase.storage.from('avatars').list(riderId)
  if (avatarFiles?.length) {
    await supabase.storage.from('avatars').remove(avatarFiles.map(f => `${riderId}/${f.name}`))
  }

  // 2. Clean up builder-media files (cover, gallery, workshop avatar)
  const { data: builderFiles } = await supabase.storage.from('builder-media').list(riderId)
  if (builderFiles?.length) {
    await supabase.storage.from('builder-media').remove(builderFiles.map(f => `${riderId}/${f.name}`))
  }

  // 3. Clean up bike-images (user's bikes → bike_images)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: bikes } = await (supabase.from('bikes') as any)
    .select('id')
    .eq('seller_id', riderId)

  if (bikes?.length) {
    for (const bike of bikes) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: images } = await (supabase.from('bike_images') as any)
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
          await (supabase.storage as any).from('bike-images').remove(paths)
        }
      }
    }
  }

  // 4. Clean up community-media (community_posts.media_urls)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: posts } = await (supabase.from('community_posts') as any)
    .select('media_urls')
    .eq('user_id', riderId)

  if (posts?.length) {
    const mediaPaths = posts
      .flatMap((p: { media_urls: string[] | null }) => p.media_urls ?? [])
      .map((url: string) => extractStoragePath(url))
      .filter(Boolean) as string[]
    if (mediaPaths.length > 0) {
      await supabase.storage.from('community-media').remove(mediaPaths)
    }
  }

  // 5. Clean up chat-images
  const { data: chatFiles } = await supabase.storage.from('chat-images').list(riderId)
  if (chatFiles?.length) {
    await supabase.storage.from('chat-images').remove(chatFiles.map(f => `${riderId}/${f.name}`))
  }

  // 6. Delete profile — cascades to bikes, bike_images, builder_media, community_posts, etc.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('profiles') as any)
    .delete()
    .eq('id', riderId)

  if (error) return { error: error.message }
  return { success: true }
}
