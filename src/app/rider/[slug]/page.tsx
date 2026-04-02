import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Instagram, Globe } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import RiderMapClient from './RiderMapClient'
import AuthGate from './AuthGate'
import FollowButton from '@/components/rider/FollowButton'
import RiderContactButton from '@/components/rider/RiderContactButton'
import { Pencil, Wrench } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { generateBikeSlug } from '@/lib/utils/bikeSlug'
import { EVENTS } from '@/lib/data/events'

export const dynamicParams = true

interface RiderProfile {
  id: string
  slug: string
  name: string
  initials: string
  bio: string
  city: string
  avatarUrl?: string
  lat?: number
  lng?: number
  tags: string[]
  ridingStyle?: string
  visitedCities: string[]
  visitedCityCoords: { name: string; lat: number; lng: number; country?: string }[]
  events: {
    slug: string
    name: string
    image?: string
  }[]
  instagram?: string
  tiktok?: string
  website?: string
  bikes: {
    title: string
    slug: string
    base: string
    style: string
    img: string
  }[]
}

async function geocode(query: string): Promise<{ lat: number; lng: number; country?: string } | null> {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
  if (!token) return null
  try {
    const res = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${token}&limit=1&types=place,address,region&language=de`,
      { next: { revalidate: 86400 } }
    )
    if (!res.ok) return null
    const json = await res.json()
    const feature = json.features?.[0]
    const [lng, lat] = feature?.center ?? []
    if (!lng || !lat) return null
    const ctx = (feature?.context as { id: string; text: string }[] | undefined) ?? []
    const country = ctx.find((c: { id: string }) => c.id.startsWith('country.'))?.text ?? undefined
    return { lat, lng, country }
  } catch { return null }
}

async function getRiderBySlug(slug: string): Promise<RiderProfile | null> {
  const supabase = await createClient()
  const cols = 'id, full_name, slug, username, bio, city, avatar_url, lat, lng, tags, riding_style, visited_cities, instagram_url, tiktok_url, website_url'

  // Try slug + username lookups in parallel (2 queries instead of 2 sequential)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [{ data: bySlug }, { data: byUsername }] = await Promise.all([
    (supabase.from('profiles') as any).select(cols).eq('slug', slug).eq('role', 'rider').maybeSingle(),
    (supabase.from('profiles') as any).select(cols).eq('username', slug).eq('role', 'rider').maybeSingle(),
  ])

  let row = bySlug ?? byUsername

  if (!row) {
    // Last resort: try matching by generated slug from full_name
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: allRiders } = await (supabase.from('profiles') as any)
      .select(cols)
      .eq('role', 'rider')
      .limit(100)

    row = (allRiders ?? []).find((r: Record<string, unknown>) => {
      const name = (r.full_name as string | null) ?? ''
      const generated = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      return generated === slug
    }) ?? null
  }

  if (!row) return null

  // Fetch bikes and event interests in parallel (no dependency between them)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [{ data: bikeRows }, { data: eventRows }] = await Promise.all([
    (supabase.from('bikes') as any)
      .select('id, slug, title, make, model, style, bike_images(id, url, is_cover, position)')
      .eq('seller_id', row.id)
      .in('status', ['active', 'draft'])
      .order('created_at', { ascending: false }),
    (supabase.from('event_interest') as any)
      .select('event_slug')
      .eq('user_id', row.id),
  ])

  const name = (row.full_name as string | null) ?? 'Unbekannt'

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bikes = (bikeRows ?? []).map((b: any) => {
    const images: { url: string; is_cover: boolean; position: number }[] = b.bike_images ?? []
    const cover = images.find(i => i.is_cover)?.url ?? images.sort((a: { position: number }, z: { position: number }) => a.position - z.position)[0]?.url ?? ''
    return {
      title: b.title as string,
      slug: (b.slug as string | null) ?? generateBikeSlug(b.title as string, b.id as string),
      base: [b.make, b.model].filter(Boolean).join(' '),
      style: (b.style as string) ?? '',
      img: cover,
    }
  })

  let lat: number | undefined = (row.lat as number | null) ?? undefined
  let lng: number | undefined = (row.lng as number | null) ?? undefined
  if ((!lat || !lng) && row.city) {
    const coords = await geocode(row.city as string)
    if (coords) { lat = coords.lat; lng = coords.lng }
  }

  // Geocode visited cities in parallel
  const visitedRaw = (row.visited_cities as string[] | null) ?? []
  let visitedCityCoords: { name: string; lat: number; lng: number; country?: string }[] = []
  if (visitedRaw.length > 0) {
    const results = await Promise.all(visitedRaw.map(async (cityName) => {
      const geo = await geocode(cityName)
      return geo ? { name: cityName, lat: geo.lat, lng: geo.lng, country: geo.country } : null
    }))
    visitedCityCoords = results.filter(Boolean) as typeof visitedCityCoords
  }

  return {
    id: row.id as string,
    slug: row.slug as string,
    name,
    initials: name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase(),
    bio: (row.bio as string | null) ?? '',
    city: (row.city as string | null) ?? '',
    avatarUrl: (row.avatar_url as string | null) ?? undefined,
    lat,
    lng,
    tags: (row.tags as string[] | null) ?? [],
    ridingStyle: (row.riding_style as string | null) ?? undefined,
    visitedCities: visitedRaw,
    visitedCityCoords,
    events: ((eventRows ?? []) as { event_slug: string }[])
      .map(e => EVENTS.find(ev => ev.slug === e.event_slug))
      .filter(Boolean)
      .map(ev => ({ slug: ev!.slug, name: ev!.name, image: ev!.image })),
    instagram: (row.instagram_url as string | null) ?? undefined,
    tiktok: (row.tiktok_url as string | null) ?? undefined,
    website: (row.website_url as string | null) ?? undefined,
    bikes,
  }
}

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const rider = await getRiderBySlug(slug)
  if (!rider) return {}
  return {
    title: `${rider.name} — Rider auf MotoDigital`,
    description: rider.bio || `${rider.name} ist Rider auf MotoDigital.`,
  }
}

export default async function RiderProfilePage({ params }: Props) {
  const { slug } = await params
  const supabaseAuth = await createClient()
  const { data: { user } } = await supabaseAuth.auth.getUser()
  const rider = await getRiderBySlug(slug)
  if (!rider) notFound()

  const isOwnProfile = user?.id === rider.id

  const content = (
    <div className="min-h-screen bg-white text-[#222222]">
      <Header activePage="explore" />

      {/* ── HERO ── */}
      <section className="bg-[#F7F7F7] border-b border-[#222222]/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-5 lg:px-8 py-10 sm:py-14">

          <div className="flex flex-wrap items-center gap-4 sm:gap-5">
            <div className="relative flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#06a5a5] border-2 border-white overflow-hidden flex items-center justify-center shadow-lg">
              {rider.avatarUrl ? (
                <Image src={rider.avatarUrl} alt={rider.name} fill sizes="96px" className="object-cover" />
              ) : (
                <span className="text-2xl sm:text-3xl font-bold text-white">{rider.initials}</span>
              )}
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-[#222222] tracking-tight">{rider.name}</h1>
              {rider.city && (
                <p className="text-sm text-[#717171] flex items-center gap-1 mt-1">
                  <MapPin size={12} /> {rider.city}
                </p>
              )}
              <span className="inline-flex items-center mt-2 text-[10px] font-semibold uppercase tracking-widest bg-[#222222]/6 text-[#222222]/50 border border-[#222222]/8 px-2.5 py-0.5 rounded-full">
                Rider
              </span>
            </div>

            {/* Actions — right-aligned on desktop, below on mobile */}
            <div className="flex items-center gap-2.5 sm:ml-auto">
              {isOwnProfile ? (
                <>
                  <Link
                    href="/dashboard/profile"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-[#222222] bg-white border border-[#DDDDDD] hover:border-[#222222] px-4 py-2 rounded-full transition-colors"
                  >
                    <Pencil size={13} />
                    Profil bearbeiten
                  </Link>
                  <Link
                    href="/dashboard/meine-garage"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-[#222222] bg-white border border-[#DDDDDD] hover:border-[#222222] px-4 py-2 rounded-full transition-colors"
                  >
                    <Wrench size={13} />
                    Garage bearbeiten
                  </Link>
                </>
              ) : (
                <>
                  <FollowButton riderId={rider.id} riderFirstName={rider.name.split(' ')[0]} />
                  <RiderContactButton riderId={rider.id} riderName={rider.name} />
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── CONTENT ── */}
      <section className="py-10 sm:py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-5 lg:px-8">
          {/* Mobile: single column, Desktop: two columns with independent stacking */}
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 items-start">
            {/* ── Left Column ── */}
            <div className="flex flex-col gap-4 w-full lg:w-1/2">
              {/* Garage */}
              {rider.bikes.length > 0 && (
                <div className="bg-white border border-[#EBEBEB] rounded-2xl p-5 sm:p-6">
                  <div className="flex items-end justify-between mb-6">
                    <h2 className="text-lg font-bold text-[#222222] tracking-tight">Meine Garage</h2>
                    <span className="text-xs text-[#B0B0B0]">{rider.bikes.length} {rider.bikes.length === 1 ? 'Bike' : 'Bikes'}</span>
                  </div>
                  <div className="grid grid-cols-1 gap-5">
                    {rider.bikes.map(bike => (
                      <Link key={bike.slug} href={`/custom-bike/${bike.slug}`} className="group">
                        <div className="aspect-[16/10] rounded-2xl overflow-hidden bg-[#F7F7F7] mb-3 relative">
                          {bike.img ? (
                            <Image src={bike.img} alt={bike.title} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="text-lg font-bold text-[#DDDDDD]">{bike.style?.replace(/_/g, ' ') || 'Bike'}</span>
                            </div>
                          )}
                          {bike.style && (
                            <span className="absolute top-2 left-2 text-[10px] font-bold uppercase tracking-widest bg-white/90 backdrop-blur-sm text-[#222222] px-2 py-0.5 rounded-full">
                              {bike.style.replace(/_/g, ' ')}
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-semibold text-[#222222] group-hover:text-[#06a5a5] transition-colors leading-snug mb-0.5">
                          {bike.title}
                        </p>
                        <p className="text-xs text-[#717171]">{bike.base}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Bio */}
              {rider.bio && (
                <div className="bg-white border border-[#EBEBEB] rounded-2xl p-5 sm:p-6">
                  <h2 className="text-base font-bold text-[#222222] tracking-tight mb-3">Über {rider.name}</h2>
                  <p className="text-sm text-[#717171] leading-relaxed">{rider.bio}</p>
                </div>
              )}

              {/* Fahrstil */}
              {rider.ridingStyle && (
                <div className="bg-white border border-[#EBEBEB] rounded-2xl p-5">
                  <h2 className="text-base font-bold text-[#222222] tracking-tight mb-3">Fahrstil</h2>
                  <span className="text-sm text-[#222222]">
                    {rider.ridingStyle === 'cruiser' && '☀️ Ruhiger Cruiser'}
                    {rider.ridingStyle === 'flott' && '💨☀️ Flotter Fahrer'}
                    {rider.ridingStyle === 'legende' && '🏍💨☀️ Lebensmüde Legende'}
                  </span>
                </div>
              )}

              {/* Events */}
              {rider.events.length > 0 && (
                <div className="bg-white border border-[#EBEBEB] rounded-2xl p-5">
                  <h2 className="text-base font-bold text-[#222222] tracking-tight mb-4">
                    {rider.name.split(' ')[0]} nimmt an folgenden Events teil:
                  </h2>
                  <div className="grid grid-cols-2 gap-3">
                    {rider.events.map(event => (
                      <Link key={event.slug} href={`/events/${event.slug}`} className="group relative aspect-[4/3] rounded-xl overflow-hidden">
                        {event.image ? (
                          <Image src={event.image} alt={event.name} fill sizes="(max-width: 1024px) 50vw, 25vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                        ) : (
                          <div className="absolute inset-0 bg-[#111111]" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-3">
                          <span className="text-xs font-bold text-white leading-tight drop-shadow-sm">
                            {event.name}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Interessen */}
              {rider.tags.length > 0 && (
                <div className="bg-white border border-[#EBEBEB] rounded-2xl p-5">
                  <h2 className="text-base font-bold text-[#222222] tracking-tight mb-3">Interessen</h2>
                  <div className="flex flex-wrap gap-2">
                    {rider.tags.map(tag => (
                      <span key={tag} className="text-xs font-medium text-[#717171] bg-[#F7F7F7] border border-[#EBEBEB] px-3 py-1.5 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ── Right Column ── */}
            <div className="flex flex-col gap-4 w-full lg:w-1/2">
              {/* Visited Cities */}
              {rider.visitedCityCoords.length > 0 && (
                <div className="bg-white border border-[#EBEBEB] rounded-2xl p-5">
                  <h2 className="text-base font-bold text-[#222222] tracking-tight mb-4">{rider.name} war mit dem Motorrad hier:</h2>
                  <div className="grid grid-cols-3 gap-3">
                    {rider.visitedCityCoords.map(city => (
                      <div key={city.name} className="bg-[#111111] rounded-xl p-3 flex flex-col items-center justify-center aspect-square">
                        <div className="text-[10px] text-[#2AABAB] tracking-wide mb-1">★ ★ ★ ★ ★</div>
                        <Image src="/pin-logo.svg" alt="MotoDigital" width={28} height={28} className="mb-1.5 opacity-80" />
                        <span className="text-[10px] font-bold text-white text-center leading-tight truncate w-full">{city.name}</span>
                        {city.country && (
                          <span className="text-[8px] text-white/40 mt-0.5 truncate w-full text-center">{city.country}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Map */}
              {rider.lat && rider.lng && (
                <div className="bg-white border border-[#EBEBEB] rounded-2xl overflow-hidden">
                  <RiderMapClient lat={rider.lat} lng={rider.lng} city={rider.city} visitedCities={rider.visitedCityCoords} riderName={rider.name} />
                  {rider.city && (
                    <div className="px-5 py-3 border-t border-[#EBEBEB]">
                      <div className="flex items-center gap-2">
                        <MapPin size={12} className="text-[#717171] flex-shrink-0" />
                        <p className="text-xs text-[#717171]">{rider.city}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Links */}
              {(rider.instagram || rider.website) && (
                <div className="bg-white border border-[#EBEBEB] rounded-2xl p-5">
                  <p className="text-base font-bold text-[#222222] tracking-tight mb-3">Links</p>
                  <div className="flex flex-col gap-2.5">
                    {rider.instagram && (
                      <a
                        href={`https://instagram.com/${rider.instagram.replace('@', '')}`}
                        target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2.5 text-xs text-[#717171] hover:text-[#222222] transition-colors"
                      >
                        <Instagram size={13} className="flex-shrink-0" />
                        <span>{rider.instagram}</span>
                      </a>
                    )}
                    {rider.website && (
                      <a
                        href={rider.website.startsWith('http') ? rider.website : `https://${rider.website}`}
                        target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2.5 text-xs text-[#717171] hover:text-[#222222] transition-colors"
                      >
                        <Globe size={13} className="flex-shrink-0" />
                        <span>{rider.website}</span>
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )

  if (!user) {
    return <AuthGate />
  }

  return content
}
