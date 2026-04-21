import { routing, type Locale } from '@/i18n/routing'

export type I18nText = Record<string, string> | null | undefined

/**
 * Read a localized string from a JSONB `*_i18n` column.
 *
 * Picks the requested locale if present; otherwise falls back to the
 * default locale (DE). If both miss, falls back to the provided legacy
 * value (for pre-migration rows).
 */
export function localizedText(
  i18n: I18nText,
  locale: Locale | string,
  legacy?: string | null,
): string {
  if (i18n && typeof i18n === 'object') {
    const map = i18n as Record<string, string>
    if (typeof map[locale] === 'string' && map[locale].trim()) return map[locale]
    const def = map[routing.defaultLocale]
    if (typeof def === 'string' && def.trim()) return def
    // Last resort: any non-empty locale
    const anyVal = Object.values(map).find((v) => typeof v === 'string' && v.trim())
    if (anyVal) return anyVal
  }
  return legacy ?? ''
}

/**
 * Build a JSONB value for writing to a `*_i18n` column. Strips empty
 * strings so the DB only holds meaningful content per locale.
 */
export function buildI18n(values: Partial<Record<Locale, string>>): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [k, v] of Object.entries(values)) {
    if (typeof v === 'string' && v.trim()) out[k] = v
  }
  return out
}

/**
 * Pick the set of locales that actually have content.
 */
export function availableLocales(i18n: I18nText): string[] {
  if (!i18n || typeof i18n !== 'object') return []
  return Object.entries(i18n as Record<string, string>)
    .filter(([, v]) => typeof v === 'string' && v.trim())
    .map(([k]) => k)
}
