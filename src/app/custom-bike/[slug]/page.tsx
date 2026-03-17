import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { BadgeCheck, MapPin, Calendar, Clock, Wrench } from 'lucide-react'
import Header from '@/components/layout/Header'
import { BUILDS, getBuildBySlug } from '@/lib/data/builds'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import BuildGallery from '@/components/build/BuildGallery'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return BUILDS.map(b => ({ slug: b.slug }))
}

// Map style display name to URL slug
function styleToSlug(style: string): string {
  return style.toLowerCase().replace(/\s+/g, '-')
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const build = getBuildBySlug(slug)
  if (!build) return {}
  return {
    title: `${build.title} — ${build.style} Custom Build`,
    description: build.tagline,
  }
}

export default async function CustomBikePage({ params }: Props) {
  const { slug } = await params
  const build = getBuildBySlug(slug)
  if (!build) notFound()

  const [cover, ...gallery] = build.images
  const styleSlug = styleToSlug(build.style)

  return (
    <div className="min-h-screen bg-white text-[#222222]">
      <Header activePage="bikes" />

      {/* Hero */}
      <div className="relative h-[55vh] min-h-[360px] overflow-hidden">
        <img src={cover} alt={build.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent" />

        {/* Badges */}
        <div className="absolute top-5 right-5 flex items-center gap-2">
          <span className="bg-white/70 backdrop-blur-sm border border-[#222222]/15 text-[#222222] text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full">
            {build.style}
          </span>
          {build.verified && (
            <span className="flex items-center gap-1 bg-[#222222]/90 text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full">
              <BadgeCheck size={10} /> Verified
            </span>
          )}
        </div>

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 px-5 pb-8 lg:px-12">
          <div className="max-w-7xl mx-auto">
            <p className="text-xs font-semibold text-[#717171] uppercase tracking-widest mb-2">{build.base} · {build.year}</p>
            <h1 className="font-bold text-[#222222] leading-tight mb-1" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', letterSpacing: '-0.03em' }}>
              {build.title}
            </h1>
            <p className="text-[#222222]/50 text-sm">{build.tagline}</p>
          </div>
        </div>
      </div>

      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-5 lg:px-8 pt-6">
        <Breadcrumbs crumbs={[
          { label: 'Home', href: '/' },
          { label: 'Custom Bikes', href: '/bikes' },
          { label: build.style, href: `/bikes/${styleSlug}` },
          { label: build.title },
        ]} />
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-5 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-10 items-start">

          {/* LEFT */}
          <div className="flex flex-col gap-10">

            {/* Meta pills */}
            <div className="flex flex-wrap gap-2">
              {[
                { icon: <MapPin size={12} />, label: build.city },
                { icon: <Calendar size={12} />, label: `Build ${build.buildYear}` },
                { icon: <Clock size={12} />, label: build.buildDuration },
                { icon: <Wrench size={12} />, label: build.displacement },
              ].map(m => (
                <span key={m.label} className="flex items-center gap-1.5 text-xs text-[#222222]/50 bg-white border border-[#222222]/8 px-3 py-1.5 rounded-full">
                  <span className="text-[#717171]">{m.icon}</span>
                  {m.label}
                </span>
              ))}
            </div>

            {/* Story */}
            <div>
              <h2 className="text-base font-semibold text-[#222222] mb-3">Der Build</h2>
              <p className="text-sm text-[#222222]/55 leading-relaxed">{build.description}</p>
            </div>

            {/* Gallery */}
            {build.images.length > 0 && (
              <div>
                <h2 className="text-base font-semibold text-[#222222] mb-4">Galerie</h2>
                <BuildGallery images={build.images} title={build.title} />
              </div>
            )}

            {/* Video */}
            {build.videoUrl && (
              <div>
                <h2 className="text-base font-semibold text-[#222222] mb-4">Video</h2>
                <video
                  src={build.videoUrl}
                  controls
                  poster={cover}
                  className="w-full rounded-2xl aspect-video object-cover bg-white"
                />
              </div>
            )}

            {/* Modifications */}
            <div>
              <h2 className="text-base font-semibold text-[#222222] mb-4">Umbauten & Modifikationen</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {build.modifications.map((mod, i) => (
                  <div key={i} className="flex items-start gap-2.5 bg-white border border-[#222222]/6 rounded-xl px-4 py-3">
                    <span className="text-[#717171] mt-0.5 flex-shrink-0">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><path d="M10 3L5 8.5 2 5.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </span>
                    <span className="text-xs text-[#222222]/65 leading-snug">{mod}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT — Sidebar */}
          <div className="flex flex-col gap-4 lg:sticky lg:top-24">

            {/* Builder card */}
            <div className="card-interactive bg-white border border-[#DDDDDD]/15 rounded-2xl p-5">
              <p className="text-xs text-[#222222]/35 uppercase tracking-widest mb-3">Builder</p>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-[#222222]/12 border border-[#DDDDDD]/20 flex items-center justify-center text-sm font-bold text-[#717171] flex-shrink-0">
                  {build.builder.initials}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-semibold text-[#222222]">{build.builder.name}</p>
                    {build.builder.verified && <BadgeCheck size={13} className="text-[#717171]" />}
                  </div>
                  <p className="text-xs text-[#222222]/40">{build.builder.city}</p>
                </div>
              </div>
              <p className="text-xs text-[#222222]/35 mb-4">{build.builder.specialty}</p>
              <div className="flex flex-col gap-2">
                <Link
                  href={`/custom-werkstatt/${build.builder.slug}#kontakt`}
                  className="btn-press w-full text-center text-sm font-bold bg-[#06a5a5] hover:bg-[#064f4f] text-white rounded-xl px-4 py-2.5 transition-colors"
                >
                  Builder kontaktieren
                </Link>
                <Link
                  href={`/custom-werkstatt/${build.builder.slug}`}
                  className="w-full text-center text-sm font-semibold text-[#222222]/70 hover:text-[#222222] border border-[#222222]/15 hover:border-[#222222]/30 rounded-xl px-4 py-2.5 transition-colors"
                >
                  Profil ansehen →
                </Link>
              </div>
            </div>

            {/* Specs */}
            <div className="bg-white border border-[#222222]/8 rounded-2xl p-5">
              <p className="text-xs text-[#222222]/35 uppercase tracking-widest mb-4">Technische Daten</p>
              {[
                { label: 'Basis', value: build.base },
                { label: 'Baujahr', value: `${build.year}` },
                { label: 'Motor', value: build.engine },
                { label: 'Hubraum', value: build.displacement },
                { label: 'Standort', value: build.city },
                { label: 'Umbau-Jahr', value: `${build.buildYear}` },
                { label: 'Bauzeit', value: build.buildDuration },
              ].map(s => (
                <div key={s.label} className="flex items-center justify-between py-2 border-b border-[#222222]/5 last:border-0">
                  <span className="text-xs text-[#222222]/35">{s.label}</span>
                  <span className="text-xs font-medium text-[#222222]/75">{s.value}</span>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>

      {/* More bikes */}
      <div className="max-w-7xl mx-auto px-5 lg:px-8 pb-16">
        <div className="border-t border-[#222222]/5 pt-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-semibold text-[#222222]">Weitere Bikes</h2>
            <Link href="/bikes" className="text-xs text-[#717171] hover:text-[#06a5a5] transition-colors">
              Alle ansehen →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {BUILDS.filter(b => b.slug !== build.slug).slice(0, 3).map(b => (
              <Link
                key={b.slug}
                href={`/custom-bike/${b.slug}`}
                className="group rounded-xl overflow-hidden bg-white border border-[#222222]/6 hover:border-[#222222]/20 transition-all hover:-translate-y-0.5"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img src={b.coverImg} alt={b.title} className="w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-500" />
                </div>
                <div className="p-3">
                  <p className="text-xs font-semibold text-[#222222] line-clamp-1">{b.title}</p>
                  <p className="text-[10px] text-[#222222]/35 mt-0.5">{b.base} · {b.city}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile floating CTA bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 p-4 bg-white/95 backdrop-blur-md border-t border-[#222222]/8">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm font-semibold text-[#222222] truncate">{build.builder.name}</p>
          <Link
            href={`/custom-werkstatt/${build.builder.slug}#kontakt`}
            className="flex-shrink-0 text-sm font-bold bg-[#06a5a5] hover:bg-[#064f4f] text-white rounded-xl px-5 py-2.5 transition-colors"
          >
            Kontaktieren
          </Link>
        </div>
      </div>

    </div>
  )
}
