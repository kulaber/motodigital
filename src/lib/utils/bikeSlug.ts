/**
 * Generates a URL-safe slug from a bike title + UUID.
 * Example: "Hondi Mondi", "1fc256e5-..." → "hondi-mondi-1fc256e5"
 */
export function generateBikeSlug(title: string, id: string): string {
  const kebab = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return `${kebab}-${id.slice(0, 8)}`
}
