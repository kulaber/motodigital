import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { BadgeCheck } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { BUILDS } from '@/lib/data/builds'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'

interface Props {
  params: Promise<{ slug: string }>
}

const BRANDS: Record<string, { name: string; keywords: string[] }> = {
  'honda':           { name: 'Honda',          keywords: ['Honda'] },
  'bmw':             { name: 'BMW',             keywords: ['BMW'] },
  'harley-davidson': { name: 'Harley-Davidson', keywords: ['H-D', 'Harley'] },
  'yamaha':          { name: 'Yamaha',          keywords: ['Yamaha'] },
  'triumph':         { name: 'Triumph',         keywords: ['Triumph'] },
  'kawasaki':        { name: 'Kawasaki',        keywords: ['Kawasaki'] },
  'suzuki':          { name: 'Suzuki',          keywords: ['Suzuki'] },
  'norton':          { name: 'Norton',          keywords: ['Norton'] },
  'moto-guzzi':      { name: 'Moto Guzzi',      keywords: ['Moto Guzzi'] },
}

const STYLE_SLUGS: Record<string, string> = {
  'Cafe Racer': 'cafe-racer',
  'Bobber':     'bobber',
  'Scrambler':  'scrambler',
  'Tracker':    'tracker',
  'Chopper':    'chopper',
  'Street':     'street-fighter',
  'Enduro':     'scrambler',
}

export async function generateStaticParams() {
  return Object.keys(BRANDS).map(slug => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const brand = BRANDS[slug]
  if (!brand) return {}
  return {
    title: `Custom ${brand.name} motorcycles for sale — MotoDigital`,
    description: `Browse handcrafted custom ${brand.name} motorcycles from verified builders worldwide on MotoDigital.`,
  }
}

export default async function BrandPage({ params }: Props) {
  const { slug } = await params
  const brand = BRANDS[slug]
  if (!brand) notFound()

  const builds = BUILDS.filter(b =>
    brand.keywords.some(kw => b.base.toLowerCase().includes(kw.toLowerCase()))
  )

  // Get unique styles from builds of this brand
  const styles = Array.from(new Set(builds.map(b => b.style)))

  return (
    <div className="min-h-screen bg-[#F5F2EB] text-[#1A1714]">
      <Header />

      {/* Hero */}
      <section className="pt-28 pb-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-5 lg:px-8">
          <Breadcrumbs crumbs={[
            { label: 'Home', href: '/' },
            { label: 'Marken', href: '/brand' },
            { label: brand.name },
          ]} />

          <div className="mt-6">
            <p className="text-xs font-semibold text-[#2aabab] uppercase tracking-widest mb-3">
              {builds.length} {builds.length === 1 ? 'Build' : 'Builds'} verfügbar
            </p>
            <h1 className="font-bold text-[#1A1714] leading-tight mb-3" style={{ fontSize: 'clamp(2rem,5vw,3.5rem)', letterSpacing: '-0.03em' }}>
              {brand.name} Custom Motorcycles
            </h1>
            <p className="text-[#1A1714]/40 text-sm max-w-lg leading-relaxed">
              Handgefertigte Custom Bikes auf {brand.name}-Basis — Unikate von verifizierten Buildern.
            </p>
          </div>

          {/* Style subcategory links */}
          {styles.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-6">
              {styles.map(style => {
                const styleSlug = STYLE_SLUGS[style] || style.toLowerCase().replace(/\s+/g, '-')
                return (
                  <Link
                    key={style}
                    href={`/bikes/${styleSlug}`}
                    className="text-xs text-[#1A1714]/40 border border-[#1A1714]/10 px-3 py-1.5 rounded-full hover:border-[#2aabab]/40 hover:text-[#2aabab] transition-all"
                  >
                    {style}
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* Builds grid */}
      <section className="pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-5 lg:px-8">
          {builds.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-[#1A1714]/25 text-sm mb-4">Noch keine {brand.name} Builds auf der Plattform.</p>
              <Link href="/bikes" className="text-xs text-[#2aabab] hover:text-[#1f9999] transition-colors">
                Alle Bikes ansehen →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {builds.map(build => (
                <Link
                  key={build.slug}
                  href={`/custom-bike/${build.slug}`}
                  className="group block rounded-xl sm:rounded-2xl overflow-hidden bg-white border border-[#1A1714]/6 hover:border-[#1A1714]/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/40"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={build.coverImg}
                      alt={build.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#F5F2EB]/85 via-[#F5F2EB]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                      <span className="text-[#1A1714] text-xs font-semibold">Ansehen →</span>
                    </div>
                    <span className="absolute top-2 left-2 bg-[#F5F2EB]/80 backdrop-blur-sm border border-[#1A1714]/15 text-[#1A1714] text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full">
                      {build.style}
                    </span>
                    {build.verified && (
                      <span className="absolute top-2 right-2 flex items-center gap-0.5 bg-[#2aabab]/90 text-[#141414] text-[8px] sm:text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full">
                        <BadgeCheck size={8} /> Verified
                      </span>
                    )}
                  </div>
                  <div className="p-3 sm:p-4">
                    <div className="flex items-start justify-between gap-1 mb-1">
                      <h3 className="text-xs sm:text-sm font-semibold text-[#1A1714] leading-snug line-clamp-1">{build.title}</h3>
                      <span className="text-xs sm:text-sm font-bold text-[#2aabab] flex-shrink-0">{build.price}</span>
                    </div>
                    <p className="text-[10px] sm:text-xs text-[#1A1714]/35 line-clamp-1">{build.base} · {build.year} · {build.city}</p>
                    <p className="text-[10px] text-[#1A1714]/25 mt-0.5 truncate">{build.builder.name}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}
