/** Sort bike images: cover first, then by position */
export function sortBikeImages<T extends { is_cover?: boolean; position: number }>(images: T[]): T[] {
  return [...images].sort((a, b) => {
    if (a.is_cover) return -1
    if (b.is_cover) return 1
    return a.position - b.position
  })
}

/** Sort bike images and extract URLs */
export function sortedBikeImageUrls(images: { is_cover?: boolean; position: number; url: string }[]): string[] {
  return sortBikeImages(images).map(i => i.url).filter(Boolean)
}
