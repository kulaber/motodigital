'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { PUBLIC_DATA_TAGS, type PublicDataTag } from '@/lib/cache/public-data'
import { revalidatePublicData } from '@/lib/cache/revalidate'

const tagsSchema = z.array(z.enum(PUBLIC_DATA_TAGS)).min(1)

/**
 * Refresh cached public pages after a signed-in user changed public data from
 * the browser. Runs as a Server Action, so Next also clears the client router
 * cache and the next navigation shows the change.
 */
export async function refreshPublicData(tags: PublicDataTag[]) {
  const parsed = tagsSchema.safeParse(tags)
  if (!parsed.success) return

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  revalidatePublicData(...parsed.data)
}
