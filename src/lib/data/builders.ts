export type BuilderMedia = {
  url: string
  type: 'image' | 'video'
  title?: string
}

export type TeamMember = {
  name: string
  role: string
  initials: string
  email?: string
  phone?: string
  avatar?: string
}

export type OpeningHours = {
  day: string
  hours: string
}

export type Builder = {
  id?: string        // Supabase profile UUID
  slug: string
  initials: string
  name: string
  city: string
  address?: string
  lat?: number
  lng?: number
  specialty: string
  builds: number
  rating: number
  verified: boolean
  featured: boolean
  since: string
  tags: string[]
  bio: string
  bioLong: string
  bases: string[]
  instagram?: string
  youtube?: string
  website?: string
  avatarUrl?: string
  media: BuilderMedia[]
  galleryImages?: BuilderMedia[]
  team?: TeamMember[]
  openingHours?: OpeningHours[]
  paymentMethods?: string[]
  featuredBuilds: {
    title: string
    slug?: string
    base: string
    style: string
    year: number
    img: string
    listingType?: string | null
  }[]
}
