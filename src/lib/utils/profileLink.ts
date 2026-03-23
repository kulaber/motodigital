export function getProfileUrl(role: string | null, slug: string | null): string | null {
  if (!slug) return null
  if (role === 'custom-werkstatt') return `/custom-werkstatt/${slug}`
  if (role === 'rider') return `/rider/${slug}`
  return null
}
