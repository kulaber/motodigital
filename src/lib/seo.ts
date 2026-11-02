import type { Metadata } from 'next'

// Opts into large image previews (required for big thumbnails in Google
// Search and Discover) and unlimited snippets. A page that sets its own
// `robots` replaces the layout's object wholesale, so indexable pages use
// this constant instead of a bare { index: true, follow: true }.
export const INDEXABLE_ROBOTS: Metadata['robots'] = {
  index: true,
  follow: true,
  'max-image-preview': 'large',
  'max-snippet': -1,
  'max-video-preview': -1,
}

/**
 * First candidate that fits the ~60 characters Google shows of a title, else
 * the shortest. Pass candidates from most to least descriptive.
 */
export function fitTitle(candidates: string[], max = 60): string {
  return candidates.find((c) => c.length <= max) ?? candidates.reduce((a, b) => (b.length < a.length ? b : a))
}

/** "2026-11-02" → "2026-11-02T08:00:00+01:00" (Europe/Berlin, DST-aware). Full timestamps pass through. */
export function toBerlinIso(date: string): string {
  if (date.includes('T')) return date
  const offset = new Intl.DateTimeFormat('en-US', { timeZone: 'Europe/Berlin', timeZoneName: 'longOffset' })
    .formatToParts(new Date(`${date}T12:00:00Z`))
    .find((p) => p.type === 'timeZoneName')
    ?.value.replace('GMT', '')
  return `${date}T08:00:00${offset || '+00:00'}`
}

export function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
