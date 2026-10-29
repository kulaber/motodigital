// Cache tags for public Supabase data. Public pages read through
// createPublicClient(), which tags every request with the groups below based
// on the tables it touches. Writes revalidate the groups of the tables they
// change, so cached pages refresh right away instead of waiting for the timer.

export const PUBLIC_DATA_TAGS = ['bikes', 'profiles', 'workshops', 'events', 'brands'] as const
export type PublicDataTag = (typeof PUBLIC_DATA_TAGS)[number]

/** Catch-all tag on every public request — revalidating it refreshes everything. */
export const ALL_PUBLIC_DATA_TAG = 'public-data'

/**
 * Time-based fallback (seconds) for writes that bypass the app, e.g. seed
 * scripts or edits in the Supabase dashboard.
 */
export const PUBLIC_DATA_REVALIDATE = 600

const TABLE_TAGS: Record<string, PublicDataTag> = {
  bikes: 'bikes',
  bike_images: 'bikes',
  profiles: 'profiles',
  builder_media: 'profiles',
  workshops: 'workshops',
  events: 'events',
  base_bikes: 'brands',
  base_bike_brands: 'brands',
  // RPCs (path /rest/v1/rpc/<name>)
  founding_member_count: 'workshops',
}

// Embedded resources in a PostgREST select: `rel(…)`, `alias:rel(…)`, `rel!hint(…)`
const EMBED_PATTERN = /([a-z_]+)(?::([a-z_]+))?(?:![a-z_]+)?\(/g

/** Cache tags for a PostgREST URL: its table plus every embedded resource. */
export function tagsForRestUrl(url: string): string[] {
  const { pathname, searchParams } = new URL(url)
  const names: (string | undefined)[] = [pathname.split('/').pop()]
  for (const [, first, second] of (searchParams.get('select') ?? '').matchAll(EMBED_PATTERN)) {
    names.push(first, second)
  }

  const tags = new Set<string>([ALL_PUBLIC_DATA_TAG])
  for (const name of names) {
    const tag = name && TABLE_TAGS[name]
    if (tag) tags.add(tag)
  }
  return [...tags]
}
