export type Build = {
  slug: string
  title: string
  tagline: string
  style: string
  base: string
  year: number
  price: string
  city: string
  country: string
  verified: boolean
  buildYear: number
  buildDuration: string
  description: string
  modifications: string[]
  engine: string
  displacement: string
  builder: {
    name: string
    slug: string
    initials: string
    city: string
    specialty: string
    verified: boolean
  }
  coverImg: string
  images: string[]
  videoUrl?: string
  publishedAt?: string   // ISO date string, e.g. '2026-03-16'
  href?: string          // override link (for Supabase bikes)
  role?: string          // seller role: 'custom-werkstatt' | 'rider'
  viewCount?: number     // number of page views
  listingType?: 'showcase' | 'for_sale'
  priceAmount?: number | null
  priceOnRequest?: boolean
}
