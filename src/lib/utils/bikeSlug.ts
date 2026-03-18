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
