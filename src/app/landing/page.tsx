import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Send, Map as MapIcon, MessageCircle, ShieldCheck, Users, Route, Compass, Bike, Sparkles, HeartHandshake } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import StickySearch from './StickySearch'
import type { Builder } from '@/lib/data/builders'
import BuilderCarousel from '@/components/ui/BuilderCarousel'
import EventsCarousel from '@/components/landing/EventsCarousel'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { unstable_cache } from 'next/cache'
import { cityFromAddress, countryFromAddress } from '@/lib/utils'
import { generateBikeSlug } from '@/lib/utils/bikeSlug'
import BikePlaceholder from '@/components/bike/BikePlaceholder'

export const metadata: Metadata = {
  title: 'MotoDigital — Custom Bikes, Builder & Builds',
  description: 'Die erste Plattform für Custom Motorrad Kultur. Finde Builder, kaufe Builds, starte dein Projekt.',
}

const STYLE_LABELS: Record<string, string> = {
  naked: 'Naked', cafe_racer: 'Cafe Racer', bobber: 'Bobber',
  scrambler: 'Scrambler', tracker: 'Tracker', chopper: 'Chopper',
  street: 'Street', enduro: 'Enduro', other: 'Basis-Bike',
}

interface FeaturedBuild {
  slug: string; href?: string; title: string; style: string; base: string; year?: number | null; builder: string; city: string; img: string | null; role?: string; listingType?: string | null; priceAmount?: number | null; priceOnRequest?: boolean | null; publishedAt?: string
}

const USPS = [
  { icon: <MapIcon size={20} className="text-[#06a5a5]" />,          title: 'Builder & Rider',   desc: 'Die erste Plattform, die Builder und Rider direkt verbindet — ohne Umwege.' },
  { icon: <Send size={20} className="text-[#06a5a5]" />,         title: 'Custom Anfragen',   desc: 'Stelle direkt eine Anfrage bei deiner Wunschwerkstatt — mit Preisübersicht und allen Details.' },
  { icon: <MessageCircle size={20} className="text-[#06a5a5]" />,title: 'Direkter Kontakt',  desc: 'Schreib Builder direkt an — kein Social Media Chaos, nur echte Anfragen.' },
  { icon: <ShieldCheck size={20} className="text-[#06a5a5]" />,  title: 'Marketplace',       desc: 'Custom Builds kaufen & verkaufen — direkt vom Builder.' },
]

const RIDER_FEATURES = [
  { icon: <Users size={20} />,           title: 'Vernetzen',              desc: 'Finde Rider in deiner Nähe und vernetze dich mit Gleichgesinnten.' },
  { icon: <Route size={20} />,           title: 'Fahrten planen',         desc: 'Plane Fahrten, veröffentliche Routen und finde Mitfahrer.' },
  { icon: <Compass size={20} />,         title: 'Explore',               desc: 'Entdecke Builds, Stories und Inspirationen aus der Community.' },
  { icon: <Bike size={20} />,            title: 'Bike Showcase',          desc: 'Präsentiere dein eigenes Bike mit Fotos und Details.' },
  { icon: <Sparkles size={20} />,        title: 'Inspirationen',          desc: 'Hol dir Ideen für deinen nächsten Umbau oder dein erstes Projekt.' },
  { icon: <HeartHandshake size={20} />,  title: 'Gleichgesinnte treffen', desc: 'Triff andere Rider bei Events, Ausfahrten und Treffen.' },
]

function dbRowToBuilder(row: Record<string, unknown>): Builder {
  const name    = (row.full_name as string | null) ?? 'Unbekannt'
  const address = (row.address   as string | null) ?? undefined
  const rawCity = (row.city as string | null)
  const city    = address ? cityFromAddress(address) : (rawCity ?? '')
  const country = address ? countryFromAddress(address) : ''
  return {
    id:          row.id as string,
    slug:        row.slug as string,
    initials:    name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase(),
    name,
    city,
    country,
    address,
    lat:         (row.lat as number | null) ?? undefined,
    lng:         (row.lng as number | null) ?? undefined,
    specialty:   (row.specialty as string | null) ?? '',
    builds:      0,
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
    media:       ((row.builder_media as {url:string;type:string;title?:string;position?:number}[] | null) ?? [])
                   .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
                   .map(m => ({ url: m.url, type: m.type as 'image'|'video', title: m.title ?? undefined })),
    featuredBuilds: [],
  }
}

// ── Cached data fetching (revalidates every 2 minutes) ──
const getLandingData = unstable_cache(
  async () => {
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )

    const [{ data: bikeRows }, { data: dbRows }, { data: eventRows }] = await Promise.all([
      supabase.from('bikes')
        .select('id, title, make, model, style, year, city, slug, seller_id, listing_type, price_amount, price_on_request, created_at, bike_images(url, is_cover, position)')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(6),
      supabase.from('profiles')
        .select('id, full_name, slug, bio, bio_long, city, specialty, since_year, tags, bases, address, lat, lng, rating, featured, instagram_url, website_url, builder_media(url, type, title, position)')
        .eq('role', 'custom-werkstatt')
        .not('slug', 'is', null)
        .order('created_at', { ascending: false })
        .limit(10),
      supabase.from('events')
        .select('id, slug, name, date_start, date_end, location, tags, image')
        .gte('date_start', new Date().toISOString().split('T')[0])
        .order('date_start', { ascending: true })
        .limit(7),
    ])

    const sellerIds: string[] = [...new Set<string>((bikeRows ?? []).map((r: any) => r.seller_id))]
    const workshopIds = (dbRows ?? []).map((r: any) => r.id as string)

    const [{ data: sellerProfiles }, { data: bikeCounts }] = await Promise.all([
      sellerIds.length > 0
        ? supabase.from('profiles').select('id, full_name, role').in('id', sellerIds)
        : Promise.resolve({ data: [] as any[] }),
      workshopIds.length > 0
        ? supabase.from('bikes').select('seller_id').in('seller_id', workshopIds).eq('status', 'active')
        : Promise.resolve({ data: [] as any[] }),
    ])

    return {
      bikeRows: bikeRows ?? [],
      dbRows: dbRows ?? [],
      sellerProfiles: sellerProfiles ?? [],
      bikeCounts: bikeCounts ?? [],
      eventRows: eventRows ?? [],
    }
  },
  ['landing-page-data'],
  { revalidate: 120 }
)

export default async function LandingPage() {
  const { bikeRows, dbRows, sellerProfiles, bikeCounts, eventRows } = await getLandingData()

  const sellerName: Record<string, string> = Object.fromEntries(
    (sellerProfiles as { id: string; full_name: string | null; role: string | null }[]).map(p => [p.id, p.full_name ?? ''])
  )
  const sellerRole: Record<string, string> = Object.fromEntries(
    (sellerProfiles as { id: string; full_name: string | null; role: string | null }[]).map(p => [p.id, p.role ?? 'rider'])
  )

  const dbBuilds: FeaturedBuild[] = (bikeRows ?? []).map((r: any) => {
    const imgs: { url: string; is_cover: boolean; position: number }[] = r.bike_images ?? []
    const cover = imgs.find((i: any) => i.is_cover)?.url ?? imgs.sort((a: any, b: any) => a.position - b.position)[0]?.url ?? null
    return {
      slug:    r.id as string,
      href:    `/custom-bike/${r.slug ?? generateBikeSlug(r.title, r.id)}`,
      title:   r.title as string,
      style:   STYLE_LABELS[r.style] ?? (r.style as string),
      base:    `${r.make} ${r.model}`,
      year:    r.year as number | null,
      builder: sellerName[r.seller_id] ?? '',
      city:    (r.city as string) ?? '',
      img:     cover,
      listingType: r.listing_type as string | null,
      priceAmount: r.price_amount as number | null,
      priceOnRequest: r.price_on_request as boolean | null,
      publishedAt: r.created_at as string | undefined,
      role:    sellerRole[r.seller_id] ?? 'rider',
    }
  })

  const BUILDS: FeaturedBuild[] = dbBuilds

  // Count bikes per workshop
  const bikeCountMap = new Map<string, number>()
  for (const row of bikeCounts as { seller_id: string }[]) {
    bikeCountMap.set(row.seller_id, (bikeCountMap.get(row.seller_id) ?? 0) + 1)
  }

  const dbBuilders: Builder[] = (dbRows ?? []).map((row: Record<string, unknown>) => ({
    ...dbRowToBuilder(row),
    builds: bikeCountMap.get(row.id as string) ?? 0,
  }))

  const builders = dbBuilders.slice(0, 10)

  // Events data for teaser section
  const events = (eventRows as any[]).slice(0, 7)
  return (
    <div className="min-h-screen bg-white text-[#222222]">

      {/* ── NAV ── */}
      <Header activePage="landing" />

      {/* ── HERO VIDEO ── */}
      <section className="bg-white pt-4 sm:pt-5 lg:pt-6 pb-4 sm:pb-5 lg:pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-8">
          <div className="relative rounded-xl sm:rounded-2xl lg:rounded-3xl overflow-hidden border border-[#222222]/10">
            <video
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              poster="/custombike_intro_poster.webp"
              className="w-full aspect-[9/12] sm:aspect-[16/9] lg:aspect-[21/9] object-cover"
            >
              <source src="/custombike_intro_optimized.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-[#1a1a1a]/45" />
            <div className="absolute inset-0" style={{
              background: 'linear-gradient(to bottom, rgba(20,20,20,0.3) 0%, rgba(20,20,20,0.1) 40%, rgba(20,20,20,0.6) 75%, rgba(20,20,20,0.85) 100%)'
            }} />

            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-5 sm:p-8 lg:p-12 text-center">
              <div className="max-w-2xl">
                <span className="inline-block bg-white/12 text-white/80 border border-white/20 text-xs font-medium px-3 py-1 rounded-full mb-5 sm:mb-4">
                  Beta
                </span>
                <h1
                  className="font-bold text-white leading-[1.1] mb-5 sm:mb-4"
                  style={{ fontSize: 'clamp(1.8rem, 4vw, 3.2rem)' }}
                >
                  Die Plattform für<br />Custom-Motorräder.
                </h1>
                <p
                  className="text-white/60 font-light mb-6 sm:mb-7 leading-relaxed max-w-[50ch] mx-auto hidden sm:block"
                  style={{ fontSize: 'clamp(0.85rem, 1.4vw, 1rem)' }}
                >
                  Entdecke einzigartige Builds, finde die beste Werkstatt in deiner Nähe und lass dich von der Custom-Szene inspirieren.
                </p>
                <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 justify-center">
                  <Link href="/custom-werkstatt"
                    className="bg-[#06a5a5] text-white font-semibold px-5 sm:px-6 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm text-center hover:bg-[#058f8f] transition-colors duration-200 min-h-[40px] sm:min-h-[44px] flex items-center justify-center">
                    Werkstatt finden
                  </Link>
                  <Link href="/bikes"
                    className="border border-white/25 text-white font-medium px-5 sm:px-6 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm text-center hover:border-white/60 hover:bg-white/10 transition-colors duration-200 min-h-[40px] sm:min-h-[44px] flex items-center justify-center">
                    Custom Bikes entdecken
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Sticky search wrapper — search unsticks before Dark CTA ── */}
      <div>
      {/* ── QUICK SEARCH ── */}
      <StickySearch />


      {/* ── FEATURED BUILDS ── */}
      <section className="py-20 lg:py-28 bg-white" id="builds">
        <div className="max-w-6xl mx-auto px-5 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-10 gap-4">
            <div>
              <h2 className="font-bold text-[#222222] leading-tight" style={{ fontSize: 'clamp(1.8rem,3.5vw,2.6rem)' }}>
                Handgefertigte Unikate.<br />
                Aus der Community.
              </h2>
            </div>
            <Link href="/bikes" className="hidden sm:inline-flex flex-shrink-0 border border-[#222222]/15 text-[#222222]/60 hover:text-[#222222] hover:border-[#222222]/30 text-sm font-medium px-5 py-2.5 rounded-full transition-colors duration-200">
              Alle Custom Bikes →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {BUILDS.map((build, i) => (
              <Link key={build.slug} href={build.href ?? `/custom-bike/${build.slug}`}
                  className="group block rounded-xl sm:rounded-2xl overflow-hidden bg-white border border-[#222222]/6 hover:border-[#222222]/20 transition-all duration-200 h-full">
                  <div className="relative aspect-[4/3] overflow-hidden bg-[#F7F7F7]">
                    {build.img ? (
                      <Image src={build.img} alt={build.title}
                        fill sizes="(max-width: 768px) 100vw, 400px"
                        {...(i < 3 ? { priority: true } : {})}
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.06]" />
                    ) : (
                      <BikePlaceholder />
                    )}
                    <span className="absolute top-2 left-2 bg-white/80 backdrop-blur-sm border border-[#222222]/15 text-[#222222] text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full">
                      {build.style}
                    </span>
                    {build.listingType === 'for_sale' && (
                      <span className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm border border-[#06a5a5]/30 text-[#06a5a5] text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full">
                        Zu verkaufen
                      </span>
                    )}
                    {build.role && (
                      <span className="absolute bottom-2 left-2 bg-black/50 backdrop-blur-sm text-white text-[9px] sm:text-[10px] font-semibold px-2 py-0.5 rounded-full">
                        {build.role === 'custom-werkstatt' ? 'Custom Werkstatt' : 'Rider'}
                      </span>
                    )}
                  </div>
                  <div className="p-3 sm:p-4">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="text-xs sm:text-sm font-semibold text-[#222222] leading-snug line-clamp-1">{build.title}</h3>
                      {build.listingType === 'for_sale' && build.priceOnRequest && (
                        <span className="text-[10px] font-semibold text-[#222222]/40 flex-shrink-0">Auf Anfrage</span>
                      )}
                      {build.listingType === 'for_sale' && build.priceAmount && !build.priceOnRequest && (
                        <span className="text-xs sm:text-sm font-bold text-[#222222] flex-shrink-0">
                          {Number(build.priceAmount).toLocaleString('de-DE')} <span className="text-[10px] font-semibold text-[#222222]/40">€</span>
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] sm:text-xs text-[#222222]/35 line-clamp-1">{build.base} · {build.year}</p>
                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <p className="text-[10px] text-[#222222]/25 truncate">{build.builder}</p>
                      {build.city && (
                        <p className="text-[10px] text-[#222222]/25 flex-shrink-0">{build.city}</p>
                      )}
                    </div>
                  </div>
                </Link>
            ))}
          </div>
          <div className="sm:hidden mt-8 text-center">
            <Link href="/bikes" className="inline-flex border border-[#222222]/15 text-[#222222]/60 hover:text-[#222222] hover:border-[#222222]/30 text-sm font-medium px-5 py-2.5 rounded-full transition-colors duration-200">
              Alle Custom Bikes →
            </Link>
          </div>
        </div>
      </section>

      {/* ── RIDER / COMMUNITY ── */}
      <section className="py-20 lg:py-28 bg-[#F7F7F7]" id="rider">
        <div className="max-w-6xl mx-auto px-5 lg:px-8">
          <div className="max-w-xl mb-4">
            <span className="inline-block text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-[#06a5a5]/10 text-[#06a5a5] mb-5">
              Für Rider
            </span>
            <h2 className="font-bold text-[#222222] leading-tight" style={{ fontSize: 'clamp(1.8rem,3.5vw,2.6rem)' }}>
              Deine Community.<br />Dein Netzwerk.
            </h2>
            <p className="text-sm text-[#717171] leading-relaxed mt-4 max-w-md">
              Entdecke, was MotoDigital für Rider bereithält — von der Vernetzung bis zur nächsten Ausfahrt.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mt-10">
            {RIDER_FEATURES.map((feat) => (
              <div key={feat.title} className="bg-white rounded-2xl p-5 sm:p-6 border border-[#222222]/6 hover:border-[#222222]/15 transition-colors duration-200">
                <div className="w-10 h-10 rounded-xl bg-[#06a5a5]/8 flex items-center justify-center mb-4 text-[#06a5a5]">
                  {feat.icon}
                </div>
                <h3 className="text-sm font-semibold text-[#222222] mb-1.5">{feat.title}</h3>
                <p className="text-xs sm:text-sm text-[#222222]/40 leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link href="/auth/register?role=rider"
              className="inline-flex items-center gap-2 bg-[#06a5a5] text-white text-sm font-semibold px-6 py-3 rounded-full hover:bg-[#058f8f] transition-colors duration-200">
              Als Rider registrieren →
            </Link>
          </div>
        </div>
      </section>

      {/* ── BUILDER SPOTLIGHT ── */}
      <section className="py-20 lg:py-28 bg-white overflow-hidden" id="builder">
        <div className="max-w-6xl mx-auto px-5 lg:px-8 flex flex-col sm:flex-row sm:items-end sm:justify-between mb-10 gap-4">
          <div>
            <h2 className="font-bold text-[#222222] leading-tight" style={{ fontSize: 'clamp(1.8rem,3.5vw,2.6rem)' }}>
              Finde die besten Werkstätten<br />
              für Deinen Umbau.
            </h2>
          </div>
          <Link href="/custom-werkstatt" className="hidden sm:inline-flex flex-shrink-0 border border-[#222222]/15 text-[#222222]/60 hover:text-[#222222] hover:border-[#222222]/30 text-sm font-medium px-5 py-2.5 rounded-full transition-colors duration-200">
            Alle Custom Werkstätten →
          </Link>
        </div>
        <BuilderCarousel builders={builders} />
        <div className="sm:hidden mt-8 text-center px-5">
          <Link href="/custom-werkstatt" className="inline-flex border border-[#222222]/15 text-[#222222]/60 hover:text-[#222222] hover:border-[#222222]/30 text-sm font-medium px-5 py-2.5 rounded-full transition-colors duration-200">
            Alle Custom Werkstätten →
          </Link>
        </div>
      </section>

      {/* ── EVENTS & TREFFEN ── */}
      {events.length > 0 && (
        <section className="py-20 lg:py-28 bg-white overflow-hidden" id="events">
          <div className="max-w-6xl mx-auto px-5 lg:px-8 flex flex-col sm:flex-row sm:items-end sm:justify-between mb-10 gap-4">
            <div>
              <h2 className="font-bold text-[#222222] leading-tight" style={{ fontSize: 'clamp(1.8rem,3.5vw,2.6rem)' }}>
                Events & Treffen.
              </h2>
            </div>
            <Link href="/events" className="hidden sm:inline-flex flex-shrink-0 border border-[#222222]/15 text-[#222222]/60 hover:text-[#222222] hover:border-[#222222]/30 text-sm font-medium px-5 py-2.5 rounded-full transition-colors duration-200">
              Alle Events →
            </Link>
          </div>
          <EventsCarousel events={events} />
          <div className="sm:hidden mt-8 text-center px-5">
            <Link href="/events" className="inline-flex border border-[#222222]/15 text-[#222222]/60 hover:text-[#222222] hover:border-[#222222]/30 text-sm font-medium px-5 py-2.5 rounded-full transition-colors duration-200">
              Alle Events →
            </Link>
          </div>
        </section>
      )}

      {/* ── USP ── */}
      <section className="py-20 lg:py-28 bg-[#F7F7F7]">
        <div className="max-w-6xl mx-auto px-5 lg:px-8">
          <div className="max-w-xl mb-12">
            <h2 className="font-bold text-[#222222] leading-tight" style={{ fontSize: 'clamp(1.8rem,3.5vw,2.6rem)' }}>
              Die Plattform, die Custom Culture verdient.
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {USPS.map((usp, _i) => (
              <div key={usp.title} className="bg-white border border-[#222222]/6 rounded-2xl p-6 hover:border-[#222222]/15 transition-colors duration-200 h-full">
                <div className="w-10 h-10 rounded-xl bg-[#06a5a5]/8 flex items-center justify-center mb-4 text-[#06a5a5]">
                  {usp.icon}
                </div>
                <h3 className="text-sm font-semibold text-[#222222] mb-2">{usp.title}</h3>
                <p className="text-sm text-[#222222]/40 leading-relaxed">{usp.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link href="/ueber-motodigital#roadmap" className="inline-flex border border-[#222222]/15 text-[#222222]/60 hover:text-[#222222] hover:border-[#222222]/30 text-sm font-medium px-5 py-2.5 rounded-full transition-colors duration-200">
              Zur Roadmap →
            </Link>
          </div>
        </div>
      </section>

      </div>{/* end sticky search wrapper */}

      {/* ── DARK CTA ── */}
      <section className="bg-[#111111] py-24 lg:py-32 overflow-hidden relative">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 100%, rgba(6,165,165,0.10) 0%, transparent 70%)' }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-8 relative z-10">

          {/* Headline */}
          <div className="text-center mb-16">
            <p className="text-xs font-semibold text-[#06a5a5] uppercase tracking-widest mb-4">Worauf wartest Du?</p>
            <h2 className="font-bold text-white leading-tight mb-4" style={{ fontSize: 'clamp(2rem,4vw,3rem)' }}>
              Werde Teil der Community.
            </h2>
            <p className="text-sm text-white/35 max-w-md mx-auto leading-relaxed">
              Registriere dich als Rider oder als Custom Werkstatt.
            </p>
          </div>

          {/* Two cards */}
          <div className="flex flex-col lg:flex-row items-stretch gap-5 max-w-4xl mx-auto">

            {/* Card: Custom Werkstatt */}
            <div className="flex-1 group relative flex flex-col rounded-2xl overflow-hidden border border-white/6 hover:border-white/16 transition-all duration-500">
              <Image src="/custom-werkstatt.png" alt="Custom Werkstatt"
                fill sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover scale-100 group-hover:scale-110 opacity-20 group-hover:opacity-30 origin-center transition duration-[1200ms] ease-in-out" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-[#111]/50 to-[#111]/10" />
              <div className="relative z-10 flex flex-col h-full p-7">
                <span className="inline-block text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-[#06a5a5]/15 text-[#06a5a5] self-start">
                  Für Custom-Werkstätten
                </span>
                <h3 className="text-xl font-bold text-white mb-2 leading-snug mt-12">
                  Zeige deine Werkstatt & Custom Bikes.<br />Erreiche die Community.
                </h3>
                <p className="text-sm text-white/35 leading-relaxed">
                  Starte kostenlos mit deinem Werkstattprofil. Upgrade auf Founding Partner (€39/Mo) für Logo, Galerie & Prio-Listung.
                </p>
                <p className="text-xs text-[#06a5a5]/70 mt-2">Founding Partner: nur 10 Plätze · danach €79/Monat (PRO)</p>
                <div className="flex flex-col gap-3 items-start mt-auto pt-8">
                  <Link href="/auth/register?role=custom-werkstatt"
                    className="inline-flex items-center gap-2 bg-[#06a5a5] text-white text-sm font-semibold px-5 py-3 rounded-xl transition-all duration-300 hover:bg-[#058f8f] hover:gap-3">
                    Kostenlos starten
                  </Link>
                  <Link href="/vorteile?tab=werkstatt"
                    className="text-white/35 hover:text-white/60 text-sm font-medium transition-colors duration-200">
                    Mehr erfahren
                  </Link>
                </div>
              </div>
            </div>

            {/* Card: Rider */}
            <div className="flex-1 group relative flex flex-col rounded-2xl overflow-hidden border border-white/6 hover:border-white/16 transition-all duration-500">
              <Image src="/rider.png" alt="Rider"
                fill sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover scale-100 group-hover:scale-110 opacity-20 group-hover:opacity-30 origin-center transition duration-[1200ms] ease-in-out" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-[#111]/50 to-[#111]/10" />
              <div className="relative z-10 flex flex-col h-full p-7">
                <span className="inline-block text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-[#06a5a5]/15 text-[#06a5a5] self-start">
                  Rider
                </span>
                <h3 className="text-xl font-bold text-white mb-2 leading-snug mt-12">
                  Werde Teil der Custom Bike Community.<br />Teile, was dich bewegt.
                </h3>
                <p className="text-sm text-white/35 leading-relaxed">
                  Präsentiere dein Bike, entdecke Fahrgemeinschaften in der Nähe und vernetze dich mit der Community.
                </p>
                <div className="flex flex-col gap-3 items-start mt-auto pt-8">
                  <Link href="/auth/register?role=rider"
                    className="inline-flex items-center gap-2 bg-[#06a5a5] text-white text-sm font-semibold px-5 py-3 rounded-xl transition-all duration-300 hover:bg-[#058f8f] hover:gap-3">
                    Als Rider registrieren →
                  </Link>
                  <Link href="/vorteile?tab=rider"
                    className="text-white/35 hover:text-white/60 text-sm font-medium transition-colors duration-200">
                    Mehr erfahren
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />

    </div>
  )
}
