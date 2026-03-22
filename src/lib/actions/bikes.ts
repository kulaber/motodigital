'use server'

import { createClient } from '@/lib/supabase/server'

export async function deleteBike(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Nicht autorisiert' }


  const { data: profile } = await (supabase.from('profiles') as any)
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (profile?.role !== 'superadmin') return { error: 'Keine Berechtigung' }

  // Delete related bike images first

  const { data: images } = await (supabase.from('bike_images') as any)
    .select('url')
    .eq('bike_id', id)

  if (images && images.length > 0) {
    const storagePaths = images
      .map((img: { url: string }) => {
        const match = img.url.match(/\/storage\/v1\/object\/public\/[^/]+\/(.+)$/)
        return match ? match[1] : null
      })
      .filter(Boolean) as string[]

    if (storagePaths.length > 0) {
    
      await (supabase.storage as any).from('bike-images').remove(storagePaths)
    }
  }


  const { error } = await (supabase.from('bikes') as any).delete().eq('id', id)

  if (error) return { error: error.message }
  return { success: true }
}
