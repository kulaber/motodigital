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
