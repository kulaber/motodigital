/**
 * Generates a URL-safe slug from a bike title.
 * Example: "Honda CB 750 Café Racer" → "honda-cb-750-cafe-racer"
 */
export function generateBikeSlug(title: string, _id?: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** Bike URLs take a slug or a legacy UUID; only UUIDs may go into an `id` filter (anything else is a 400). */
export function isBikeId(value: string): boolean {
  return UUID_PATTERN.test(value)
}
