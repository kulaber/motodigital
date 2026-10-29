import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import { PUBLIC_DATA_REVALIDATE, tagsForRestUrl } from '@/lib/cache/public-data'

/**
 * Cookieless Supabase client for public reads in Server Components.
 *
 * Unlike `@/lib/supabase/server` it never touches `cookies()`, so pages using
 * it stay statically rendered (ISR) instead of hitting the database on every
 * request. Responses go through the Next.js Data Cache, tagged per table
 * group (see `@/lib/cache/public-data`).
 *
 * It only sees what the `anon` role may read — never use it for
 * user-specific data.
 */
export function createPublicClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      global: {
        fetch: (input, init) => {
          const url = input instanceof Request ? input.url : String(input)
          return fetch(input, {
            ...init,
            cache: 'force-cache',
            next: { revalidate: PUBLIC_DATA_REVALIDATE, tags: tagsForRestUrl(url) },
          })
        },
      },
    }
  )
}
