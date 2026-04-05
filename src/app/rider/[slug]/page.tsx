import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Instagram, Globe, Calendar, Settings, ArrowLeft } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import RiderMapClient from './RiderMapClient'
import FollowButton from '@/components/rider/FollowButton'
import RiderContactButton from '@/components/rider/RiderContactButton'
import { Pencil, Wrench } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { generateBikeSlug } from '@/lib/utils/bikeSlug'
import type { Event } from '@/lib/data/events'
import { formatEventDate } from '@/lib/data/events'
import VisitedCitiesCarousel from './VisitedCitiesCarousel'
import FollowerListModal from '@/components/rider/FollowerListModal'

export const dynamicParams = true

interface RiderProfile {
  id: string
  slug: string
  name: string
  initials: string
  bio: string
  city: string
  avatarUrl?: string
  coverImageUrl?: string
  isOnline: boolean
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
    date_start?: string
    date_end?: string
    location?: string
  }[]
  followerCount: number
  followingCount: number
  instagram?: string
  tiktok?: string
  website?: string
  bikes: {
    title: string
    slug: string
    base: string
    style: string
    img: string
    listingType: string
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
  const cols = 'id, full_name, slug, username, bio, city, avatar_url, lat, lng, tags, riding_style, visited_cities, instagram_url, tiktok_url, website_url, last_seen_at'

  // Try slug + username lookups in parallel (2 queries instead of 2 sequential)
  const [{ data: bySlug }, { data: byUsername }] = await Promise.all([
    (supabase.from('profiles') as any).select(cols).eq('slug', slug).eq('role', 'rider').maybeSingle(),
    (supabase.from('profiles') as any).select(cols).eq('username', slug).eq('role', 'rider').maybeSingle(),
  ])

  let row = bySlug ?? byUsername

  if (!row) {
    // Last resort: try matching by generated slug from full_name
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

  // Fetch bikes, event interests, cover image, and follow counts in parallel
  const [{ data: bikeRows }, { data: eventRows }, { data: coverRow }, { count: followerCount }, { count: followingCount }] = await Promise.all([
    (supabase.from('bikes') as any)
      .select('id, slug, title, make, model, style, listing_type, bike_images(id, url, is_cover, position)')
      .eq('seller_id', row.id)
      .in('status', ['active', 'draft'])
      .order('created_at', { ascending: false }),
    (supabase.from('event_interest') as any)
      .select('event_slug')
      .eq('user_id', row.id),
    (supabase.from('builder_media') as any)
      .select('url')
      .eq('builder_id', row.id)
      .eq('title', 'cover')
      .maybeSingle(),
    (supabase.from('followers') as any)
      .select('*', { count: 'exact', head: true })
      .eq('following_id', row.id),
    (supabase.from('followers') as any)
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', row.id),
  ])

  const name = (row.full_name as string | null) ?? 'Unbekannt'

  const bikes = (bikeRows ?? []).map((b: any) => {
    const images: { url: string; is_cover: boolean; position: number }[] = b.bike_images ?? []
    const cover = images.find(i => i.is_cover)?.url ?? images.sort((a: { position: number }, z: { position: number }) => a.position - z.position)[0]?.url ?? ''
    return {
      title: b.title as string,
      slug: (b.slug as string | null) ?? generateBikeSlug(b.title as string, b.id as string),
      base: [b.make, b.model].filter(Boolean).join(' '),
      style: ({ cafe_racer: 'Cafe Racer', bobber: 'Bobber', scrambler: 'Scrambler', tracker: 'Tracker', chopper: 'Chopper', naked: 'Naked', street: 'Street', enduro: 'Enduro', other: 'Basis-Bike' } as Record<string, string>)[b.style] ?? ((b.style as string) ?? '').replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
      img: cover,
      listingType: (b.listing_type as string) ?? 'showcase',
    }
  })

  // Geocode rider city + visited cities + fetch events — all in parallel
  const visitedRaw = (row.visited_cities as string[] | null) ?? []
  const eventSlugs = ((eventRows ?? []) as { event_slug: string }[]).map(e => e.event_slug)

  const [cityGeo, visitedResults, eventsResult] = await Promise.all([
    // Geocode rider's city if no coords
    ((!row.lat && !row.lng && row.city) ? geocode(row.city as string) : Promise.resolve(null)),
    // Geocode all visited cities in parallel
    Promise.all(visitedRaw.map(async (cityName) => {
      const geo = await geocode(cityName)
      return geo ? { name: cityName, lat: geo.lat, lng: geo.lng, country: geo.country } : null
    })),
    // Fetch event details
    eventSlugs.length > 0
      ? (supabase.from('events') as any).select('slug, name, image, date_start, date_end, location').in('slug', eventSlugs)
      : Promise.resolve({ data: [] }),
  ])

  let lat: number | undefined = (row.lat as number | null) ?? undefined
  let lng: number | undefined = (row.lng as number | null) ?? undefined
  if (cityGeo) { lat = cityGeo.lat; lng = cityGeo.lng }

  const visitedCityCoords = visitedResults.filter(Boolean) as { name: string; lat: number; lng: number; country?: string }[]

  const events = ((eventsResult.data ?? []) as Pick<Event, 'slug' | 'name' | 'image' | 'date_start' | 'date_end' | 'location'>[]).map(ev => ({
    slug: ev.slug,
    name: ev.name,
    image: ev.image ?? undefined,
    date_start: ev.date_start ?? undefined,
    date_end: ev.date_end ?? undefined,
    location: ev.location ?? undefined,
  }))

  const lastSeen = row.last_seen_at ? new Date(row.last_seen_at as string).getTime() : 0
  const isOnline = Date.now() - lastSeen < 3 * 60 * 1000

  return {
    id: row.id as string,
    slug: row.slug as string,
    name,
    initials: name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase(),
    bio: (row.bio as string | null) ?? '',
    city: (row.city as string | null) ?? '',
    isOnline,
    avatarUrl: (row.avatar_url as string | null) ?? undefined,
    lat,
    lng,
    tags: (row.tags as string[] | null) ?? [],
    ridingStyle: (row.riding_style as string | null) ?? undefined,
    visitedCities: visitedRaw,
    visitedCityCoords,
    coverImageUrl: (coverRow?.url as string | null) ?? undefined,
    followerCount: followerCount ?? 0,
    followingCount: followingCount ?? 0,
    events,
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

      {/* ── COVER BANNER ── */}
      <div className="relative w-full h-44 sm:h-56 lg:h-64 bg-[#1a8a8a] overflow-hidden">
        <Image
          src={rider.coverImageUrl ?? '/og-image.jpg'}
          alt="Titelbild"
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
        {!isOwnProfile && (
          <Link
            href="/explore"
            className="lg:hidden absolute top-3 left-3 w-9 h-9 bg-white border border-black/8 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors z-10"
          >
            <ArrowLeft size={16} className="text-[#111111]" />
          </Link>
        )}
        {isOwnProfile && (
          <Link
            href="/dashboard/account"
            className="lg:hidden absolute top-3 right-3 w-9 h-9 bg-white border border-black/8 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors z-10"
          >
            <Settings size={16} className="text-[#111111]" />
          </Link>
        )}
      </div>

      {/* ── HERO ── */}
      <section className="bg-white border-b border-[#222222]/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-5 lg:px-8">
          {/* Avatar row — only avatar overlaps cover */}
          <div className="flex items-end justify-between -mt-14 sm:-mt-16">
            <div className="relative flex-shrink-0">
              <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-[#2AABAB] border-4 border-white overflow-hidden flex items-center justify-center shadow-lg">
                {rider.avatarUrl ? (
                  <Image src={rider.avatarUrl} alt={rider.name} fill sizes="128px" className="object-cover" />
                ) : (
                  <div className="p-6 sm:p-7">
                    <Image src="/pin-logo.svg" alt="MotoDigital" width={128} height={128} className="w-full h-full object-contain" />
                  </div>
                )}
              </div>
              {rider.isOnline && (
                <span className="absolute bottom-2 right-2 w-4 h-4 bg-green-500 border-[3px] border-white rounded-full" />
              )}
            </div>

            {/* Actions — top right, desktop only (non-owner) */}
            {!isOwnProfile && (
              <div className="hidden lg:flex items-center gap-2.5 pb-1">
                <FollowButton riderId={rider.id} />
                <RiderContactButton riderId={rider.id} riderName={rider.name} riderAvatarUrl={rider.avatarUrl} />
              </div>
            )}
          </div>

          {/* Profile info — all on white background */}
          <div className="pt-3 pb-6 sm:pb-8">
            {/* Name + Stats */}
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-[#222222] tracking-tight">{rider.name}</h1>
                {rider.city && (
                  <p className="text-sm text-[#717171] flex items-center gap-1 mt-0.5">
                    <MapPin size={12} /> {rider.city}
                  </p>
                )}
              </div>

              {/* Follower / Following */}
              <FollowerListModal
                riderId={rider.id}
                riderName={rider.name}
                followerCount={rider.followerCount}
                followingCount={rider.followingCount}
              />
            </div>

            {/* Bio */}
            {rider.bio && (
              <p className="text-sm text-[#717171] truncate max-w-lg mt-1">{rider.bio}</p>
            )}

            {/* Actions — below bio, mobile only */}
            {isOwnProfile ? (
              <div className="flex items-center gap-2.5 mt-4 lg:hidden">
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
              </div>
            ) : (
              <div className="flex items-center gap-2.5 mt-4 lg:hidden">
                <FollowButton riderId={rider.id} />
                <RiderContactButton riderId={rider.id} riderName={rider.name} riderAvatarUrl={rider.avatarUrl} />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── CONTENT ── */}
      <section className="py-10 sm:py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-5 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
            {/* ── Main Column (60%) ── */}
            <div className="flex flex-col gap-5 w-full lg:w-[60%]">
              {/* Garage — Dark Mode, 2-col grid */}
              {rider.bikes.length > 0 && (
                <div className="bg-[#111111] rounded-2xl p-5 sm:p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <h2 className="text-xl font-bold text-white tracking-tight">{isOwnProfile ? 'Meine Garage' : `Garage von ${rider.name.split(' ')[0]}`}</h2>
                    <span className="text-xs text-white/30 ml-auto">{rider.bikes.length} {rider.bikes.length === 1 ? 'Bike' : 'Bikes'}</span>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {rider.bikes.map(bike => (
                      <Link key={bike.slug} href={`/custom-bike/${bike.slug}`} className="group">
                        <div className="aspect-[4/3] rounded-xl overflow-hidden bg-[#1a1a1a] mb-2.5 relative">
                          {bike.img ? (
                            <Image src={bike.img} alt={bike.title} fill sizes="(max-width: 1024px) 50vw, 30vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="text-sm font-bold text-white/20">{bike.style?.replace(/_/g, ' ') || 'Bike'}</span>
                            </div>
                          )}
                          {bike.style && (
                            <span className="absolute top-2 left-2 text-[9px] font-bold uppercase tracking-widest bg-[#06a5a5] text-white px-2 py-0.5 rounded-full">
                              {bike.style.replace(/_/g, ' ')}
                            </span>
                          )}
                          {bike.listingType === 'for_sale' && (
                            <span className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm border border-[#06a5a5]/30 text-[#06a5a5] text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full">
                              Zu verkaufen
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-semibold text-white group-hover:text-[#06a5a5] transition-colors leading-snug mb-0.5 truncate">
                          {bike.title}
                        </p>
                        <p className="text-xs text-white/40">{bike.base}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Visited Cities */}
              {rider.visitedCityCoords.length > 0 && (
                <VisitedCitiesCarousel cities={rider.visitedCityCoords} riderName={rider.name} />
              )}

              {/* Map — shown when rider has location OR visited cities */}
              {((rider.lat && rider.lng) || rider.visitedCityCoords.length > 0) && (
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
            </div>

            {/* ── Sidebar (40%) — sticky ── */}
            <div className="flex flex-col gap-4 w-full lg:w-[40%] lg:sticky lg:top-20">
              {/* Fahrstil */}
              {rider.ridingStyle && (
                <div className="bg-white border border-[#EBEBEB] rounded-2xl p-5">
                  <h2 className="text-base font-bold text-[#222222] tracking-tight mb-3">Fahrstil von {rider.name.split(' ')[0]}</h2>
                  <div className="flex items-center gap-2 text-sm text-[#717171]">
                    <span className="text-base leading-none">
                      {rider.ridingStyle === 'cruiser' && '☀️'}
                      {rider.ridingStyle === 'flott' && '💨'}
                      {rider.ridingStyle === 'legende' && '🏍'}
                    </span>
                    <span>
                      {rider.ridingStyle === 'cruiser' && 'Ruhiger Cruiser'}
                      {rider.ridingStyle === 'flott' && 'Flotter Fahrer'}
                      {rider.ridingStyle === 'legende' && 'Lebensmüde Legende'}
                    </span>
                  </div>
                </div>
              )}

              {/* Interessen — Teal Pills */}
              {rider.tags.length > 0 && (
                <div className="bg-white border border-[#EBEBEB] rounded-2xl p-5">
                  <h2 className="text-base font-bold text-[#222222] tracking-tight mb-3">Interessen</h2>
                  <div className="flex flex-wrap gap-2">
                    {rider.tags.map(tag => (
                      <span key={tag} className="text-xs font-medium text-[#06a5a5] bg-[#06a5a5]/8 border border-[#06a5a5]/15 px-3 py-1.5 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Events */}
              {rider.events.length > 0 && (
                <div className="bg-white border border-[#EBEBEB] rounded-2xl p-5">
                  <h2 className="text-base font-bold text-[#222222] tracking-tight mb-3">{rider.name.split(' ')[0]} nimmt an folgenden Events teil</h2>
                  <div className="flex flex-col gap-1.5">
                    {rider.events.map(event => (
                      <Link
                        key={event.slug}
                        href={`/events/${event.slug}`}
                        className="group flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-[#F7F7F7] transition-colors"
                      >
                        <div className="relative flex-shrink-0 w-9 h-9 rounded-lg overflow-hidden bg-[#F7F7F7] border border-[#EBEBEB]">
                          {event.image ? (
                            <Image src={event.image} alt={event.name} fill sizes="36px" className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Calendar size={14} className="text-[#999999]" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[13px] font-medium text-[#222222] group-hover:text-[#06a5a5] transition-colors truncate">
                            {event.name}
                          </p>
                          <p className="text-[11px] text-[#999999] flex items-center gap-1.5 mt-0.5">
                            {(event.date_start || event.date_end) && (
                              <span>{formatEventDate({ date_start: event.date_start ?? null, date_end: event.date_end ?? null })}</span>
                            )}
                            {(event.date_start || event.date_end) && event.location && (
                              <span className="text-[#DDDDDD]">&middot;</span>
                            )}
                            {event.location && (
                              <span className="truncate">{event.location}</span>
                            )}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Links */}
              {(rider.instagram || rider.tiktok || rider.website) && (
                <div className="bg-white border border-[#EBEBEB] rounded-2xl p-5">
                  <p className="text-base font-bold text-[#222222] tracking-tight mb-3">Links</p>
                  <div className="flex flex-col gap-2.5">
                    {rider.instagram && (
                      <a
                        href={rider.instagram.startsWith('http') ? rider.instagram : `https://instagram.com/${rider.instagram.replace('@', '')}`}
                        target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2.5 text-xs text-[#717171] hover:text-[#222222] transition-colors"
                      >
                        <Instagram size={13} className="flex-shrink-0" />
                        <span>Zum Instagram Profil</span>
                      </a>
                    )}
                    {rider.tiktok && (
                      <a
                        href={rider.tiktok.startsWith('http') ? rider.tiktok : `https://tiktok.com/@${rider.tiktok.replace('@', '')}`}
                        target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2.5 text-xs text-[#717171] hover:text-[#222222] transition-colors"
                      >
                        <Globe size={13} className="flex-shrink-0" />
                        <span>Zum TikTok Profil</span>
                      </a>
                    )}
                    {rider.website && (
                      <a
                        href={rider.website.startsWith('http') ? rider.website : `https://${rider.website}`}
                        target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2.5 text-xs text-[#717171] hover:text-[#222222] transition-colors"
                      >
                        <Globe size={13} className="flex-shrink-0" />
                        <span>Zur Website</span>
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

  return content
}
