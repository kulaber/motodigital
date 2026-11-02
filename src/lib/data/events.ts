export type Event = {
  id: string
  slug: string
  name: string
  date_start: string | null
  date_end: string | null
  location: string
  description: string
  tags: string[]
  url?: string | null
  image?: string | null
  gallery_images?: string[] | null
  videos?: string[] | null
  // Locale-agnostic JSONB variants populated by migration 073
  name_i18n?: Record<string, string> | null
  description_i18n?: Record<string, string> | null
  location_i18n?: Record<string, string> | null
}

/** Extract YouTube video ID from any standard URL format */
export function youtubeId(url: string): string | null {
  if (!url) return null
  const patterns = [
    /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ]
  for (const re of patterns) {
    const m = url.match(re)
    if (m) return m[1]
  }
  return null
}

/** True when there is no upcoming edition on record: the last one is over, or there is no date */
export function isAwaitingNextDate(event: Pick<Event, 'date_start' | 'date_end'>, today: string): boolean {
  const end = event.date_end ?? event.date_start
  return !end || end < today
}

/**
 * Date range as running text: "vom 3. bis 5. September 2027" / "from 3 to 5 September 2027",
 * or "am 3. September 2027" / "on 3 September 2027" for a single day. Empty without a date.
 */
export function eventDatePhrase(event: Pick<Event, 'date_start' | 'date_end'>, locale: string): string {
  if (!event.date_start) return ''
  const de = locale !== 'en'
  const lang = de ? 'de-DE' : 'en-GB'
  const start = new Date(event.date_start + 'T00:00:00')
  const end = event.date_end && event.date_end !== event.date_start ? new Date(event.date_end + 'T00:00:00') : null
  const full = (d: Date) => d.toLocaleDateString(lang, { day: 'numeric', month: 'long', year: 'numeric' })
  if (!end) return `${de ? 'am' : 'on'} ${full(start)}`
  const sameMonth = start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()
  const from = sameMonth
    ? `${start.getDate()}${de ? '.' : ''}`
    : start.toLocaleDateString(lang, { day: 'numeric', month: 'long', ...(start.getFullYear() !== end.getFullYear() && { year: 'numeric' }) })
  return de ? `vom ${from} bis ${full(end)}` : `from ${from} to ${full(end)}`
}

/** Format date range for display (e.g. "01.–03.09.2026") */
export function formatEventDate(event: Pick<Event, 'date_start' | 'date_end'>): string {
  if (!event.date_start) return ''
  const start = new Date(event.date_start + 'T00:00:00')
  const end = event.date_end ? new Date(event.date_end + 'T00:00:00') : null

  const day = (d: Date) => String(d.getDate()).padStart(2, '0')
  const month = (d: Date) => String(d.getMonth() + 1).padStart(2, '0')
  const year = (d: Date) => String(d.getFullYear())

  if (!end || event.date_start === event.date_end) {
    return `${day(start)}.${month(start)}.${year(start)}`
  }

  // Same month & year
  if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
    return `${day(start)}.–${day(end)}.${month(end)}.${year(end)}`
  }

  // Different months
  return `${day(start)}.${month(start)}.–${day(end)}.${month(end)}.${year(end)}`
}
