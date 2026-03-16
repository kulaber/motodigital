import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { BadgeCheck, ArrowLeft } from 'lucide-react'
import Header from '@/components/layout/Header'
import { BUILDS } from '@/lib/data/builds'
import { BUILDERS } from '@/lib/data/builders'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'

interface Props {
  params: Promise<{ style: string }>
}

const STYLE_MAP: Record<string, string> = {
  'cafe-racer':    'Cafe Racer',
  'bobber':        'Bobber',
  'scrambler':     'Scrambler',
  'tracker':       'Tracker',
  'chopper':       'Chopper',
  'brat-style':    'Brat Style',
  'street-fighter':'Street Fighter',
}

export async function generateStaticParams() {
  return Object.keys(STYLE_MAP).map(style => ({ style }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { style } = await params
  const displayName = STYLE_MAP[style]
  if (!displayName) return {}
  return {
    title: `${displayName} for sale — MotoDigital`,
    description: `Buy and sell custom ${displayName} motorcycles worldwide. Handcrafted builds from verified builders on MotoDigital.`,
  }
}

export default async function StylePage({ params }: Props) {
  const { style } = await params
  const displayName = STYLE_MAP[style]
  if (!displayName) notFound()

  const builds = BUILDS.filter(b => b.style === displayName)
  const relatedBuilders = BUILDERS.filter(b =>
    b.tags.some(tag => tag.toLowerCase() === displayName.toLowerCase()) ||
    b.specialty.toLowerCase().includes(displayName.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-[#141414] text-[#F0EDE4]">
      <Header activePage="bikes" />

      {/* Hero */}
      <section className="pt-28 pb-14 bg-[#141414]">
        <div className="max-w-6xl mx-auto px-4 sm:px-5 lg:px-8">
          <Breadcrumbs crumbs={[
            { label: 'Home', href: '/' },
            { label: 'Bikes', href: '/bikes' },
            { label: displayName },
          ]} />

          <div className="mt-6">
            <p className="text-xs font-semibold text-[#C8A96E] uppercase tracking-widest mb-3">
              {builds.length} {builds.length === 1 ? 'Bike' : 'Bikes'} verfügbar
            </p>
            <h1 className="font-bold text-[#F0EDE4] leading-tight mb-3" style={{ fontSize: 'clamp(2rem,5vw,3.5rem)', letterSpacing: '-0.03em' }}>
              {displayName} Motorcycles
            </h1>
            <p className="text-[#F0EDE4]/40 text-sm max-w-lg leading-relaxed">
              Handgefertigte {displayName} Custom Bikes — entdecke Unikate von verifizierten Buildern aus aller Welt.
            </p>
          </div>

          {/* Related style links */}
          <div className="flex flex-wrap gap-2 mt-6">
            {Object.entries(STYLE_MAP)
              .filter(([slug]) => slug !== style)
              .map(([slug, name]) => (
                <Link
                  key={slug}
                  href={`/bikes/${slug}`}
                  className="text-xs text-[#F0EDE4]/35 border border-[#F0EDE4]/8 px-3 py-1.5 rounded-full hover:border-[#C8A96E]/40 hover:text-[#C8A96E] transition-all"
                >
                  {name}
                </Link>
              ))}
          </div>
        </div>
      </section>

      {/* Builds grid */}
      <section className="pb-16 bg-[#141414]">
        <div className="max-w-6xl mx-auto px-4 sm:px-5 lg:px-8">
          {builds.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-[#F0EDE4]/25 text-sm mb-4">Noch keine {displayName} Builds auf der Plattform.</p>
              <Link href="/bikes" className="text-xs text-[#C8A96E] hover:text-[#D4B87A] transition-colors flex items-center justify-center gap-1">
                <ArrowLeft size={12} /> Alle Bikes ansehen
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {builds.map(build => (
                <Link
                  key={build.slug}
                  href={`/custom-bike/${build.slug}`}
                  className="group block rounded-xl sm:rounded-2xl overflow-hidden bg-[#1C1C1C] border border-[#F0EDE4]/6 hover:border-[#F0EDE4]/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/40"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={build.coverImg}
                      alt={build.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#141414]/85 via-[#141414]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                      <span className="text-[#F0EDE4] text-xs font-semibold">Ansehen →</span>
                    </div>
                    {build.verified && (
                      <span className="absolute top-2 right-2 flex items-center gap-0.5 bg-[#C8A96E]/90 text-[#141414] text-[8px] sm:text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full">
                        <BadgeCheck size={8} /> Verified
                      </span>
                    )}
                  </div>
                  <div className="p-3 sm:p-4">
                    <div className="flex items-start justify-between gap-1 mb-1">
                      <h3 className="text-xs sm:text-sm font-semibold text-[#F0EDE4] leading-snug line-clamp-1">{build.title}</h3>
                      <span className="text-xs sm:text-sm font-bold text-[#C8A96E] flex-shrink-0">{build.price}</span>
                    </div>
                    <p className="text-[10px] sm:text-xs text-[#F0EDE4]/35 line-clamp-1">{build.base} · {build.year} · {build.city}</p>
                    <p className="text-[10px] text-[#F0EDE4]/25 mt-0.5 truncate">{build.builder.name}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Related builders */}
      {relatedBuilders.length > 0 && (
        <section className="py-14 border-t border-[#F0EDE4]/5">
          <div className="max-w-6xl mx-auto px-4 sm:px-5 lg:px-8">
            <h2 className="text-lg font-bold text-[#F0EDE4] mb-2">{displayName} Spezialisten</h2>
            <p className="text-sm text-[#F0EDE4]/35 mb-6">Builder mit Expertise im {displayName}-Bereich</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {relatedBuilders.slice(0, 3).map(builder => (
                <Link
                  key={builder.slug}
                  href={`/builder/${builder.slug}`}
                  className="group bg-[#1C1C1C] border border-[#F0EDE4]/6 hover:border-[#C8A96E]/25 rounded-2xl p-5 transition-all"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-[#C8A96E]/12 border border-[#C8A96E]/20 flex items-center justify-center text-sm font-bold text-[#C8A96E] flex-shrink-0">
                      {builder.initials}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-semibold text-[#F0EDE4]">{builder.name}</p>
                        {builder.verified && <BadgeCheck size={12} className="text-[#C8A96E]" />}
                      </div>
                      <p className="text-xs text-[#F0EDE4]/40">{builder.city}</p>
                    </div>
                  </div>
                  <p className="text-xs text-[#F0EDE4]/35 mb-3">{builder.specialty}</p>
                  <p className="text-[10px] text-[#F0EDE4]/25">{builder.builds} Builds · seit {builder.since}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <footer className="bg-[#141414] border-t border-[#F0EDE4]/5 py-8 mt-4">
        <div className="max-w-6xl mx-auto px-4 sm:px-5 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <nav className="flex items-center gap-5 sm:gap-6">
            {['Impressum', 'Datenschutz', 'Kontakt'].map(l => (
              <Link key={l} href="#" className="text-xs text-[#F0EDE4]/25 hover:text-[#F0EDE4]/60 transition-colors">{l}</Link>
            ))}
          </nav>
          <p className="text-xs text-[#F0EDE4]/15">© 2026 MotoDigital</p>
        </div>
      </footer>
    </div>
  )
}
