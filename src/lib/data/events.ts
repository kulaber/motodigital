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
