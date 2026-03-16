import type { OpeningHours } from '@/lib/data/builders'

const DAY_IDX: Record<string, number> = {
  Mo: 1, Di: 2, Mi: 3, Do: 4, Fr: 5, Sa: 6, So: 0,
  Montag: 1, Dienstag: 2, Mittwoch: 3, Donnerstag: 4,
  Freitag: 5, Samstag: 6, Sonntag: 0,
}

export function parseDays(label: string): number[] {
  const range = label.match(/^(\w+)\s*[–-]\s*(\w+)$/)
  if (range) {
    const start = DAY_IDX[range[1]], end = DAY_IDX[range[2]]
    if (start !== undefined && end !== undefined) {
      const days: number[] = []
      let d = start
      while (days.length <= 7) {
        days.push(d)
        if (d === end) break
        d = (d + 1) % 7
      }
      return days
    }
  }
  if (label === 'Wochenende') return [6, 0]
  if (label.includes('&')) {
    return label.split('&').flatMap(s => {
      const i = DAY_IDX[s.trim()]
      return i !== undefined ? [i] : []
    })
  }
  const i = DAY_IDX[label]
  return i !== undefined ? [i] : []
}

function toMin(t: string) {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

export type OpenStatus =
  | { open: true;  closesAt: string; todayHours: string }
  | { open: false; opensAt?: string; todayHours?: string; reason?: 'appointment' | 'closed' }

export function calcOpenStatus(hours: OpeningHours[], now: Date): OpenStatus {
  const dow = now.getDay()
  const cur = now.getHours() * 60 + now.getMinutes()

  for (const entry of hours) {
    if (!parseDays(entry.day).includes(dow)) continue
    if (entry.hours === 'Geschlossen')           return { open: false, reason: 'closed',      todayHours: entry.hours }
    if (entry.hours === 'Nur nach Vereinbarung') return { open: false, reason: 'appointment', todayHours: entry.hours }

    const m = entry.hours.match(/(\d{2}:\d{2})\s*[–-]\s*(\d{2}:\d{2})/)
    if (!m) return { open: false, todayHours: entry.hours }

    const openMin = toMin(m[1]), closeMin = toMin(m[2])
    if (cur >= openMin && cur < closeMin) return { open: true,  closesAt: m[2], todayHours: entry.hours }
    if (cur < openMin)                    return { open: false, opensAt: m[1],  todayHours: entry.hours }
    return { open: false, reason: 'closed', todayHours: entry.hours }
  }
  return { open: false }
}

export function isOpenNow(hours: OpeningHours[] | undefined, now: Date): boolean {
  if (!hours?.length) return false
  return calcOpenStatus(hours, now).open
}

const DAY_LABELS = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa']

export function nextOpening(hours: OpeningHours[], from: Date): string | null {
  for (let delta = 1; delta <= 7; delta++) {
    const next = new Date(from)
    next.setDate(next.getDate() + delta)
    const dow = next.getDay()
    for (const entry of hours) {
      if (!parseDays(entry.day).includes(dow)) continue
      const m = entry.hours.match(/(\d{2}:\d{2})\s*[–-]\s*(\d{2}:\d{2})/)
      if (!m) continue
      return `${delta === 1 ? 'Morgen' : DAY_LABELS[dow]}, ${m[1]} Uhr`
    }
  }
  return null
}
