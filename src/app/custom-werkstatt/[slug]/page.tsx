import type { Metadata } from 'next'
import type React from 'react'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Footer from '@/components/layout/Footer'
import { BadgeCheck, MapPin, ArrowLeft, Globe, Instagram, Mail, Phone, Wrench, Settings, ShieldCheck, Zap, Palette, Pencil, Truck, Bike, RefreshCw, Flag, Mountain, Navigation, Leaf, Check, Flame, Layers, Droplets, Wind, Shield, Gauge, ClipboardCheck, Cog, Activity, Scissors } from 'lucide-react'
import BuilderContactButton from '@/components/messaging/BuilderContactButton'
import Header from '@/components/layout/Header'
import { BUILDERS, getBuilderBySlug, type Builder, type BuilderMedia } from '@/lib/data/builders'
import BuilderMapClient from './BuilderMapClient'
import HeroActions from './HeroActions'
import OpeningHoursWidget from '@/components/builder/OpeningHoursWidget'
import { createClient } from '@/lib/supabase/server'
import { generateBikeSlug } from '@/lib/utils/bikeSlug'

export const dynamicParams = true

const TAG_ICON_MAP: Record<string, React.ReactNode> = {
  'Komplettumbau':          <Wrench size={14} />,
  'Teilumbau':              <Settings size={14} />,
  'Teileumbau':             <Settings size={14} />,
  'Elektrik':               <Zap size={14} />,
  'Elektrikarbeiten':       <Zap size={14} />,
  'Lackierung':             <Palette size={14} />,
  'Folierung':              <Layers size={14} />,
  'Pulverbeschichtung':     <Droplets size={14} />,
  'Schweißen':              <Flame size={14} />,
  'Fräsen':                 <Cog size={14} />,
  'Sandstrahlen':           <Wind size={14} />,
  'Verzinken':              <Shield size={14} />,
  'Vergaser':               <Gauge size={14} />,
  'TÜV-Einzelabnahme':     <ShieldCheck size={14} />,
  'TÜV-Untersuchung':      <ClipboardCheck size={14} />,
  'Motorinstandsetzung':    <Wrench size={14} />,
  'Motorrevision':          <RefreshCw size={14} />,
  'Motordiagnose':          <Activity size={14} />,
  'Sattlerarbeiten':        <Scissors size={14} />,
  'Karosseriearbeiten':     <Wrench size={14} />,
  'Konzeption & Design':    <Pencil size={14} />,
  'Lieferung':              <Truck size={14} />,
  'Basis-Bike Beschaffung': <Bike size={14} />,
  'Restaurierung':          <RefreshCw size={14} />,
  'Cafe Racer':             <Flag size={14} />,
  'Bobber':                 <Bike size={14} />,
  'Scrambler':              <Mountain size={14} />,
  'Chopper':                <Wrench size={14} />,
  'Custom Paint':           <Palette size={14} />,
  'Tracker':                <Flag size={14} />,
  'Street':                 <Navigation size={14} />,
  'Enduro':                 <Leaf size={14} />,
}

async function geocode(query: string): Promise<{ lat: number; lng: number } | null> {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
  if (!token) return null
  try {
    const res = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${token}&limit=1&types=place,address&language=de`,
      { next: { revalidate: 86400 } }
    )
    if (!res.ok) return null
    const json = await res.json()
    const [lng, lat] = json.features?.[0]?.center ?? []
    return lng && lat ? { lat, lng } : null
  } catch { return null }
}

async function getBuilderBySlugFromDB(slug: string): Promise<Builder | null> {
  const supabase = await createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: row } = await (supabase.from('profiles') as any)
    .select('id, full_name, slug, bio, bio_long, city, specialty, since_year, tags, bases, address, lat, lng, rating, featured, instagram_url, website_url, tiktok_url, avatar_url')
    .eq('slug', slug)
    .eq('role', 'custom-werkstatt')
    .maybeSingle()

  if (!row) return null

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [{ data: mediaRows }, { data: bikeRows }] = await Promise.all([
    (supabase.from('builder_media') as any)
      .select('url, type, title')
      .eq('builder_id', row.id)
      .order('position', { ascending: true }),
    (supabase.from('bikes') as any)
      .select('id, slug, title, make, model, year, style, price, bike_images(url, is_cover)')
      .eq('seller_id', row.id)
      .in('status', ['active', 'draft'])
      .order('created_at', { ascending: false }),
  ])

  const name = (row.full_name as string | null) ?? 'Unbekannt'
  const media: BuilderMedia[] = (mediaRows ?? []).map((m: Record<string, unknown>) => ({
    url:   m.url as string,
    type:  m.type as 'image' | 'video',
    title: (m.title as string | null) ?? undefined,
  }))

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const featuredBuilds = (bikeRows ?? []).map((b: any) => {
    const images: { url: string; is_cover: boolean }[] = b.bike_images ?? []
    const coverImg = images.find(i => i.is_cover)?.url ?? images[0]?.url ?? null
    return {
      title: b.title as string,
      slug:  (b.slug as string | null) ?? generateBikeSlug(b.title as string, b.id as string),
      base:  [b.make, b.model].filter(Boolean).join(' '),
      style: (b.style as string) ?? '',
      year:  (b.year as number) ?? new Date().getFullYear(),
      img:   coverImg ?? '',
    }
  })

  // Resolve coordinates — use DB values or geocode from city/address
  let lat: number | undefined = (row.lat as number | null) ?? undefined
  let lng: number | undefined = (row.lng as number | null) ?? undefined
  if ((!lat || !lng) && (row.address || row.city)) {
    const coords = await geocode((row.address ?? row.city) as string)
    if (coords) { lat = coords.lat; lng = coords.lng }
  }

  return {
    id:          row.id as string,
    slug:        row.slug as string,
    initials:    name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase(),
    name,
    city:        (row.city as string | null) ?? '',
    address:     (row.address as string | null) ?? undefined,
    lat,
    lng,
    specialty:   (row.specialty as string | null) ?? '',
    builds:      featuredBuilds.length,
    rating:      (row.rating as number | null) ?? 5.0,
    verified:    false,
    featured:    (row.featured as boolean | null) ?? false,
    since:       (row.since_year as number | null)?.toString() ?? '',
    tags:        (row.tags as string[] | null) ?? [],
    bio:         (row.bio as string | null) ?? '',
    bioLong:     (row.bio_long as string | null) ?? '',
    bases:       (row.bases as string[] | null) ?? [],
    instagram:   (row.instagram_url as string | null) ?? undefined,
    website:     (row.website_url as string | null) ?? undefined,
    avatarUrl:   (row.avatar_url as string | null) ?? undefined,
    media,
    featuredBuilds,
  }
}

function StarRating({ rating, light }: { rating: number; light?: boolean }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => {
        const filled = rating >= i
        const half = !filled && rating >= i - 0.5
        return (
          <svg key={i} width="13" height="13" viewBox="0 0 24 24" className={filled || half ? 'text-[#06a5a5]' : (light ? 'text-[#DDDDDD]' : 'text-white/25')}>
            {half ? (
              <>
                <defs>
                  <linearGradient id={`h${i}`}>
                    <stop offset="50%" stopColor="currentColor" />
                    <stop offset="50%" stopColor="transparent" />
                  </linearGradient>
                </defs>
                <path fill={`url(#h${i})`} stroke="currentColor" strokeWidth="1.5"
                  d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </>
            ) : (
              <path fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5"
                d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            )}
          </svg>
        )
      })}
      <span className={`ml-1 text-xs font-semibold ${light ? 'text-[#717171]' : 'text-white/80'}`}>{rating.toFixed(1)}</span>
    </span>
  )
}

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const builder = (await getBuilderBySlugFromDB(slug)) ?? getBuilderBySlug(slug)
  if (!builder) return {}
  return {
    title: `${builder.name} — Builder auf MotoDigital`,
    description: builder.bioLong || builder.bio,
  }
}

export function generateStaticParams() {
  return BUILDERS.map(b => ({ slug: b.slug }))
}

export default async function BuilderProfilePage({ params }: Props) {
  const { slug } = await params
  const builder = (await getBuilderBySlugFromDB(slug)) ?? getBuilderBySlug(slug)
  if (!builder) notFound()

  const coverImage = builder.media.find(m => m.type === 'image')

  return (
    <div className="min-h-screen bg-white text-[#222222]">
      <Header activePage="custom-werkstatt" />

      {/* ── MOBILE HERO ── */}
      <div className="sm:hidden relative w-full h-[52vh] min-h-[340px] max-h-[520px] overflow-hidden">
        {coverImage ? (
          <Image src={coverImage.url} alt={builder.name} fill sizes="100vw" className="object-cover" priority />
        ) : (
          <div className="absolute inset-0 bg-[#1a1a1a]" />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />

        {/* Top: Back + Save/Share */}
        <div className="absolute top-0 left-0 right-0 z-10 pt-4 px-4">
          <div className="flex items-center justify-between">
            <Link href="/custom-werkstatt"
              className="inline-flex items-center gap-1.5 bg-black/50 text-white text-xs font-medium px-2.5 py-1.5 rounded-full backdrop-blur-sm hover:bg-black/60 transition-colors">
              <ArrowLeft size={13} /> Zurück
            </Link>
            <HeroActions name={builder.name} builderId={builder.id ?? null} slug={slug} iconOnly />
          </div>
        </div>

        {/* Bottom: Profile info */}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-6">
          <div className="flex items-end gap-3">
            <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-[#06a5a5] border-2 border-white/20 overflow-hidden flex items-center justify-center shadow-lg">
              {builder.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={builder.avatarUrl} alt={builder.name} className="w-full h-full object-cover" />
              ) : (
                <Image src="/pin-logo.svg" alt="Logo" width={36} height={36} className="w-8 h-8 opacity-90" />
              )}
            </div>
            <div className="flex-1 min-w-0 pb-1">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <h1 className="text-xl font-bold text-white tracking-tight">
                  {builder.name}
                </h1>
                {builder.verified && (
                  <span className="inline-flex items-center gap-1 bg-white/15 border border-white/20 text-white text-[11px] font-semibold px-2 py-0.5 rounded-full">
                    <BadgeCheck size={10} /> Verifiziert
                  </span>
                )}
                {builder.featured && (
                  <span className="inline-flex items-center bg-[#06a5a5]/20 border border-[#06a5a5]/30 text-[#06a5a5] text-[11px] font-semibold px-2 py-0.5 rounded-full">
                    Top Custom Werkstatt
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-white/75">
                <span className="flex items-center gap-1"><MapPin size={11} /> {builder.city}</span>
                <StarRating rating={builder.rating} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── DESKTOP HERO ── */}
      <div className="hidden sm:block relative w-full h-[52vh] min-h-[340px] max-h-[520px] overflow-hidden">
        {coverImage ? (
          <Image src={coverImage.url} alt={builder.name} fill sizes="100vw" className="object-cover" priority />
        ) : (
          <div className="absolute inset-0 bg-[#1a1a1a]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />
        <div className="absolute top-0 left-0 right-0 pt-20 px-4 sm:px-5 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <Link href="/custom-werkstatt"
              className="inline-flex items-center gap-1.5 text-xs text-white/60 hover:text-white transition-colors">
              <ArrowLeft size={13} /> Alle Custom Werkstätten
            </Link>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-5 lg:px-8 pb-6 sm:pb-8">
          <div className="max-w-7xl mx-auto flex items-end gap-4">
            <div className="flex-shrink-0 w-14 h-14 sm:w-20 sm:h-20 rounded-2xl bg-[#06a5a5] border-2 border-white/20 overflow-hidden flex items-center justify-center shadow-lg">
              {builder.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={builder.avatarUrl} alt={builder.name} className="w-full h-full object-cover" />
              ) : (
                <Image src="/pin-logo.svg" alt="Logo" width={36} height={36} className="w-8 h-8 sm:w-11 sm:h-11 opacity-90" />
              )}
            </div>
            <div className="flex-1 min-w-0 pb-1">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <h1 className="text-xl sm:text-3xl font-bold text-white tracking-tight">
                  {builder.name}
                </h1>
                {builder.verified && (
                  <span className="inline-flex items-center gap-1 bg-white/15 border border-white/20 text-white text-[11px] font-semibold px-2 py-0.5 rounded-full">
                    <BadgeCheck size={10} /> Verifiziert
                  </span>
                )}
                {builder.featured && (
                  <span className="hidden sm:inline-flex items-center bg-[#06a5a5]/20 border border-[#06a5a5]/30 text-[#06a5a5] text-[11px] font-semibold px-2 py-0.5 rounded-full">
                    Top Custom Werkstatt
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-white/75">
                <span className="flex items-center gap-1"><MapPin size={11} /> {builder.city}</span>
                <StarRating rating={builder.rating} />
              </div>
            </div>
            <div className="hidden sm:block">
              <HeroActions name={builder.name} builderId={builder.id ?? null} slug={slug} />
            </div>
          </div>
        </div>
      </div>

      <div className="h-8" />

      {/* ── FEATURED BUILDS — full width, prominent ── */}
      {builder.featuredBuilds.length > 0 && (
        <section className="pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-8">
            <div className="flex items-end justify-between mb-5">
              <div>
                <p className="text-xs font-semibold text-[#717171] uppercase tracking-widest mb-1">Custom Bikes</p>
                <h2 className="text-base font-bold text-[#222222] tracking-tight">
                  Projekte von {builder.name}
                </h2>
              </div>
              <span className="text-sm text-[#B0B0B0]">{builder.featuredBuilds.length} {builder.featuredBuilds.length === 1 ? 'Custom Bike' : 'Custom Bikes'}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {builder.featuredBuilds.map(build => {
                const card = (
                  <div className="group">
                    {/* Image */}
                    <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-[#F7F7F7] mb-3 relative">
                      {build.img ? (
                        <img
                          src={build.img}
                          alt={build.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-2xl font-bold text-[#DDDDDD]">{build.style || 'Build'}</span>
                        </div>
                      )}
                      {/* Style badge overlay */}
                      <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-widest bg-white/90 backdrop-blur-sm text-[#222222] px-2.5 py-1 rounded-full shadow-sm">
                        {build.style}
                      </span>
                    </div>
                    {/* Info */}
                    <p className="text-sm font-semibold text-[#222222] leading-snug mb-0.5 group-hover:text-[#06a5a5] transition-colors">
                      {build.title}
                    </p>
                    <p className="text-xs text-[#717171]">{build.base} · {build.year}</p>
                  </div>
                )
                return build.slug ? (
                  <Link key={build.title} href={`/custom-bike/${build.slug}`}>{card}</Link>
                ) : (
                  <div key={build.title}>{card}</div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── CONTENT ── */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 items-start">

            {/* LEFT */}
            <div>
              {/* About */}
              <div className="bg-white border border-[#EBEBEB] rounded-2xl p-5 sm:p-6 mb-4">
                <h2 className="text-base font-bold text-[#222222] tracking-tight mb-3">Über {builder.name}</h2>
                <p className="text-sm text-[#717171] leading-relaxed">{builder.bioLong}</p>

                {builder.bases.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-[#EBEBEB]">
                    <p className="text-xs text-[#B0B0B0] mb-2">Bevorzugte Basis-Bikes</p>
                    <div className="flex flex-wrap gap-2">
                      {builder.bases.map(base => (
                        <span key={base} className="text-xs text-[#717171] bg-[#F7F7F7] border border-[#EBEBEB] px-2.5 py-1 rounded-full font-medium">
                          {base}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Leistungen */}
              <div className="bg-white border border-[#EBEBEB] rounded-2xl p-5 mb-4">
                <h2 className="text-base font-bold text-[#222222] tracking-tight mb-4 sm:mb-5">Leistungen</h2>
                {/* Mobile: chip row */}
                <div className="flex flex-wrap gap-2 sm:hidden">
                  {builder.tags.map(tag => (
                    <span key={tag} className="flex items-center gap-1.5 text-xs font-medium text-[#717171] bg-[#F7F7F7] border border-[#EBEBEB] px-3 py-1.5 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
                {/* Desktop: grid cards */}
                <div className="hidden sm:grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {builder.tags.map(tag => {
                    const icon = TAG_ICON_MAP[tag] ?? <Check size={14} />
                    return (
                      <div key={tag} className="flex items-center gap-3 bg-[#F7F7F7] hover:bg-[#F0F0F0] rounded-xl px-3.5 py-3 transition-colors group">
                        <span className="text-[#06a5a5] flex-shrink-0">{icon}</span>
                        <span className="text-xs font-semibold text-[#222222] leading-snug">{tag}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Team */}
              {builder.team && builder.team.length > 0 && (
                <div className="bg-white border border-[#EBEBEB] rounded-2xl p-5 sm:p-6 mb-4">
                  <div className="flex items-center gap-2 mb-5">
                    <h2 className="text-base font-bold text-[#222222] tracking-tight">Team</h2>
                    <span className="ml-auto text-[10px] text-[#B0B0B0] font-medium">{builder.team.length} {builder.team.length === 1 ? 'Person' : 'Personen'}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {builder.team.map(member => (
                      <div key={member.name} className="flex flex-col p-4 bg-[#F7F7F7] rounded-2xl border border-[#EBEBEB] hover:border-[#DDDDDD] transition-all duration-200">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="relative w-14 h-14 flex-shrink-0 rounded-full overflow-hidden ring-2 ring-[#DDDDDD] ring-offset-2 ring-offset-white">
                            {member.avatar ? (
                              <Image src={member.avatar} alt={member.name} fill sizes="56px" className="object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-[#06a5a5]">
                                <Image src="/pin-logo.svg" alt="Logo" width={28} height={28} className="opacity-90" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-[#222222] leading-tight">{member.name}</p>
                            <span className="inline-block mt-1.5 text-[10px] font-semibold text-[#717171] bg-[#F7F7F7] border border-[#EBEBEB] px-2.5 py-0.5 rounded-full">
                              {member.role}
                            </span>
                          </div>
                        </div>
                        {(member.email || member.phone) && (
                          <div className="flex flex-col gap-2 pt-3 border-t border-[#EBEBEB]">
                            {member.email && (
                              <a href={`mailto:${member.email}`} className="flex items-center gap-2.5 text-xs text-[#717171] hover:text-[#222222] transition-colors group">
                                <span className="w-8 h-8 rounded-lg bg-[#F7F7F7] group-hover:bg-[#EBEBEB] flex items-center justify-center flex-shrink-0 transition-colors">
                                  <Mail size={13} />
                                </span>
                                <span className="truncate">{member.email}</span>
                              </a>
                            )}
                            {member.phone && (
                              <a href={`tel:${member.phone}`} className="flex items-center gap-2.5 text-xs text-[#717171] hover:text-[#222222] transition-colors group">
                                <span className="w-8 h-8 rounded-lg bg-[#F7F7F7] group-hover:bg-[#EBEBEB] flex items-center justify-center flex-shrink-0 transition-colors">
                                  <Phone size={13} />
                                </span>
                                <span>{member.phone}</span>
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Map */}
              {builder.lat && builder.lng && (
                <div className="bg-white border border-[#EBEBEB] rounded-2xl overflow-hidden mb-4">
                  <div className="px-5 pt-4 pb-3">
                    <h2 className="text-base font-bold text-[#222222] tracking-tight">So findest du {builder.name}</h2>
                  </div>
                  <BuilderMapClient
                    lat={builder.lat}
                    lng={builder.lng}
                    name={builder.name}
                    address={builder.address}
                  />
                  <div className="px-5 py-3 border-t border-[#EBEBEB]">
                    <div className="flex items-start gap-2">
                      <MapPin size={12} className="text-[#717171] mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-[#717171] leading-snug">
                        {builder.address ?? builder.city}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT sidebar */}
            <div className="flex flex-col gap-4 lg:sticky lg:top-24">

              {/* Contact CTA */}
              <div className="bg-white border border-[#DDDDDD] rounded-2xl p-5">
                <p className="text-base font-bold text-[#222222] tracking-tight mb-1">{builder.name} kontaktieren</p>
                <p className="text-xs text-[#717171] leading-relaxed mb-4">
                  Schreib direkt an {builder.name}.
                </p>
                {builder.id ? (
                  <BuilderContactButton
                    builderId={builder.id}
                    builderFirstName={builder.name.split(' ')[0]}
                    builderName={builder.name}
                  />
                ) : (
                  <a href="/auth/login"
                    className="block w-full bg-[#06a5a5] text-white text-sm font-semibold py-3 rounded-xl text-center hover:bg-[#058f8f] transition-all">
                    {builder.name} kontaktieren
                  </a>
                )}
              </div>

              {/* Opening hours */}
              {builder.openingHours && builder.openingHours.length > 0 && (
                <OpeningHoursWidget openingHours={builder.openingHours} />
              )}

              {/* Payment */}
              {builder.paymentMethods && builder.paymentMethods.length > 0 && (
                <div className="bg-white border border-[#EBEBEB] rounded-2xl p-5">
                  <h2 className="text-base font-bold text-[#222222] tracking-tight mb-4">Zahlungsmöglichkeiten</h2>
                  <div className="flex flex-wrap gap-1.5">
                    {builder.paymentMethods.map(method => (
                      <span key={method} className="text-[10px] font-medium text-[#717171] bg-[#F7F7F7] border border-[#EBEBEB] px-2.5 py-1 rounded-full">
                        {method}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Links */}
              {(builder.instagram || builder.website) && (
                <div className="bg-white border border-[#EBEBEB] rounded-2xl p-5">
                  <p className="text-base font-bold text-[#222222] tracking-tight mb-3">Links</p>
                  <div className="flex flex-col gap-2.5">
                    {builder.instagram && (
                      <a
                        href={`https://instagram.com/${builder.instagram.replace('@', '')}`}
                        target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2.5 text-xs text-[#717171] hover:text-[#222222] transition-colors group"
                      >
                        <Instagram size={13} className="flex-shrink-0 transition-colors" />
                        <span>{builder.instagram}</span>
                      </a>
                    )}
                    {builder.website && (
                      <a
                        href={builder.website.startsWith('http') ? builder.website : `https://${builder.website}`}
                        target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2.5 text-xs text-[#717171] hover:text-[#222222] transition-colors group"
                      >
                        <Globe size={13} className="flex-shrink-0 transition-colors" />
                        <span>{builder.website}</span>
                      </a>
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </section>

      {/* Sticky CTA */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 px-4 py-3">
        <div className="max-w-md mx-auto">
          <a href="#contact"
            className="flex items-center justify-center w-full text-sm font-semibold bg-[#06a5a5] hover:bg-[#058f8f] text-white rounded-full py-3 shadow-lg transition-colors">
            {builder.name} kontaktieren
          </a>
        </div>
      </div>

      <Footer />
    </div>
  )
}
