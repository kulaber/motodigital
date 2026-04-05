'use server'

import { createClient } from '@/lib/supabase/server'

/** Helper: extract storage path from Supabase public URL */
function extractStoragePath(url: string): string | null {
  const match = url.match(/\/storage\/v1\/object\/public\/[^/]+\/(.+)$/)
  return match ? match[1] : null
}

/** Helper: delete all bike_images storage files for a bike */
async function deleteBikeStorage(supabase: Awaited<ReturnType<typeof createClient>>, bikeId: string) {
  const { data: images } = await (supabase.from('bike_images') as any)
    .select('url, thumbnail_url')
    .eq('bike_id', bikeId)

  if (!images || images.length === 0) return

  const storagePaths = images
    .flatMap((img: { url: string; thumbnail_url?: string | null }) => [
      extractStoragePath(img.url),
      img.thumbnail_url ? extractStoragePath(img.thumbnail_url) : null,
    ])
    .filter(Boolean) as string[]

  if (storagePaths.length > 0) {
    const { error: storageErr } = await (supabase.storage as any).from('bike-images').remove(storagePaths)
    if (storageErr) console.error('Storage remove bike-images failed:', storageErr.message)
  }
}

/** Delete bike — superadmin only */
export async function deleteBike(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Nicht autorisiert' }

  const { data: profile } = await (supabase.from('profiles') as any)
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (profile?.role !== 'superadmin') return { error: 'Keine Berechtigung' }

  await deleteBikeStorage(supabase, id)

  const { error } = await (supabase.from('bikes') as any).delete().eq('id', id)

  if (error) return { error: error.message }
  return { success: true }
}

/** Delete own bike — owner only */
export async function deleteOwnBike(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Nicht autorisiert' }

  // Verify ownership
  const { data: bike } = await (supabase.from('bikes') as any)
    .select('seller_id')
    .eq('id', id)
    .maybeSingle()

  if (!bike) return { error: 'Bike nicht gefunden' }
  if (bike.seller_id !== user.id) return { error: 'Keine Berechtigung' }

  await deleteBikeStorage(supabase, id)

  const { error } = await (supabase.from('bikes') as any).delete().eq('id', id)

  if (error) return { error: error.message }
  return { success: true }
}
