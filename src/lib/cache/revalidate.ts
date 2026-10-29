import { revalidateTag } from 'next/cache'
import type { PublicDataTag } from './public-data'

/**
 * Refresh cached public pages after a server-side write (API routes, webhooks,
 * Server Actions). Browser code calls the `refreshPublicData` action instead.
 */
export function revalidatePublicData(...tags: PublicDataTag[]) {
  for (const tag of new Set(tags)) revalidateTag(tag)
}
