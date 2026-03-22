import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Merge Tailwind classes safely */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Format price as EUR */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(amount)
}

/** Format relative time (e.g. "vor 3 Tagen") */
export function formatRelativeTime(date: string): string {
  const rtf = new Intl.RelativeTimeFormat('de', { numeric: 'auto' })
  const diff = (new Date(date).getTime() - Date.now()) / 1000
  const ranges: [number, Intl.RelativeTimeFormatUnit][] = [
    [60, 'seconds'],
    [3600, 'minutes'],
    [86400, 'hours'],
    [2592000, 'days'],
    [Infinity, 'months'],
  ]
  for (const [limit, unit] of ranges) {
    if (Math.abs(diff) < limit) {
      const divisors: Record<string, number> = {
        seconds: 1, minutes: 60, hours: 3600, days: 86400, months: 2592000,
      }
      return rtf.format(Math.round(diff / divisors[unit]), unit)
    }
  }
  return date
}

/** Extract city from a Mapbox address string, e.g. "Frankfurter Straße 20, 03185 Peitz, Deutschland" → "Peitz" */
export function cityFromAddress(address: string): string {
  const parts = address.split(',').map(p => p.trim()).filter(Boolean)
  if (parts.length >= 2) {
    const segment = parts[parts.length - 2]
    const match = segment.match(/^\d+\s+(.+)$/)
    return match ? match[1] : segment
  }
  return address
}
