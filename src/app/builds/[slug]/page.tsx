import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { BadgeCheck, ArrowLeft, MapPin, Calendar, Clock, Wrench, ChevronRight } from 'lucide-react'
import Header from '@/components/layout/Header'
import { BUILDS, getBuildBySlug } from '@/lib/data/builds'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return BUILDS.map(b => ({ slug: b.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const build = getBuildBySlug(slug)
  if (!build) return {}
  return {
    title: build.title,
    description: build.tagline,
  }
}

export default async function BuildPage({ params }: Props) {
  const { slug } = await params
  const build = getBuildBySlug(slug)
  if (!build) notFound()

  const [cover, ...gallery] = build.images

  return (
    <div className="min-h-screen bg-[#141414] text-[#F0EDE4]">
      <Header />

      {/* Hero */}
      <div className="relative h-[55vh] min-h-[360px] overflow-hidden">
        <img src={cover} alt={build.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/40 to-transparent" />

        {/* Back */}
        <div className="absolute top-5 left-5">
          <Link href="/builds" className="flex items-center gap-1.5 text-xs text-[#F0EDE4]/60 hover:text-[#F0EDE4] bg-[#141414]/60 backdrop-blur-sm border border-[#F0EDE4]/10 px-3 py-2 rounded-full transition-colors">
            <ArrowLeft size={13} /> Alle Builds
          </Link>
        </div>

        {/* Badges */}
        <div className="absolute top-5 right-5 flex items-center gap-2">
          <span className="bg-[#141414]/70 backdrop-blur-sm border border-[#F0EDE4]/15 text-[#F0EDE4] text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full">
            {build.style}
          </span>
          {build.verified && (
            <span className="flex items-center gap-1 bg-[#2AABAB]/90 text-[#141414] text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full">
              <BadgeCheck size={10} /> Verified
            </span>
          )}
        </div>

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 px-5 pb-8 lg:px-12">
          <div className="max-w-5xl mx-auto">
            <p className="text-xs font-semibold text-[#2AABAB] uppercase tracking-widest mb-2">{build.base} · {build.year}</p>
            <h1 className="font-bold text-[#F0EDE4] leading-tight mb-1" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', letterSpacing: '-0.03em' }}>
              {build.title}
            </h1>
            <p className="text-[#F0EDE4]/50 text-sm">{build.tagline}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-5 lg:px-8 py-10">
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
                <span key={m.label} className="flex items-center gap-1.5 text-xs text-[#F0EDE4]/50 bg-[#1C1C1C] border border-[#F0EDE4]/8 px-3 py-1.5 rounded-full">
                  <span className="text-[#2AABAB]">{m.icon}</span>
                  {m.label}
                </span>
              ))}
            </div>

            {/* Story */}
            <div>
              <h2 className="text-base font-semibold text-[#F0EDE4] mb-3">Der Build</h2>
              <p className="text-sm text-[#F0EDE4]/55 leading-relaxed">{build.description}</p>
            </div>

            {/* Gallery */}
            {gallery.length > 0 && (
              <div>
                <h2 className="text-base font-semibold text-[#F0EDE4] mb-4">Galerie</h2>
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  {gallery.map((img, i) => (
                    <div
                      key={i}
                      className={`overflow-hidden rounded-xl ${i === 0 ? 'col-span-2 aspect-[16/7]' : 'aspect-square'}`}
                    >
                      <img
                        src={img}
                        alt={`${build.title} ${i + 1}`}
                        className="w-full h-full object-cover hover:scale-[1.03] transition-transform duration-500"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Video */}
            {build.videoUrl && (
              <div>
                <h2 className="text-base font-semibold text-[#F0EDE4] mb-4">Video</h2>
                <video
                  src={build.videoUrl}
                  controls
                  poster={cover}
                  className="w-full rounded-2xl aspect-video object-cover bg-[#1C1C1C]"
                />
              </div>
            )}

            {/* Modifications */}
            <div>
              <h2 className="text-base font-semibold text-[#F0EDE4] mb-4">Umbauten & Modifikationen</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {build.modifications.map((mod, i) => (
                  <div key={i} className="flex items-start gap-2.5 bg-[#1C1C1C] border border-[#F0EDE4]/6 rounded-xl px-4 py-3">
                    <span className="text-[#2AABAB] mt-0.5 flex-shrink-0">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><path d="M10 3L5 8.5 2 5.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </span>
                    <span className="text-xs text-[#F0EDE4]/65 leading-snug">{mod}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT — Sidebar */}
          <div className="flex flex-col gap-4 lg:sticky lg:top-24">

            {/* Price */}
            <div className="bg-[#1C1C1C] border border-[#F0EDE4]/8 rounded-2xl p-5">
              <p className="text-xs text-[#F0EDE4]/35 uppercase tracking-widest mb-1">Preis</p>
              <p className="text-3xl font-bold text-[#2AABAB]">{build.price}</p>
              <button className="mt-4 w-full bg-[#2AABAB] text-[#141414] text-sm font-bold py-3 rounded-xl hover:bg-[#3DBFBF] transition-colors">
                Anfrage senden
              </button>
              <button className="mt-2 w-full border border-[#F0EDE4]/10 text-[#F0EDE4]/50 text-sm font-medium py-2.5 rounded-xl hover:border-[#F0EDE4]/25 hover:text-[#F0EDE4] transition-colors">
                Merken
              </button>
            </div>

            {/* Specs */}
            <div className="bg-[#1C1C1C] border border-[#F0EDE4]/8 rounded-2xl p-5">
              <p className="text-xs text-[#F0EDE4]/35 uppercase tracking-widest mb-4">Technische Daten</p>
              {[
                { label: 'Basis', value: build.base },
                { label: 'Baujahr', value: `${build.year}` },
                { label: 'Motor', value: build.engine },
                { label: 'Hubraum', value: build.displacement },
                { label: 'Standort', value: build.city },
                { label: 'Umbau-Jahr', value: `${build.buildYear}` },
                { label: 'Bauzeit', value: build.buildDuration },
              ].map(s => (
                <div key={s.label} className="flex items-center justify-between py-2 border-b border-[#F0EDE4]/5 last:border-0">
                  <span className="text-xs text-[#F0EDE4]/35">{s.label}</span>
                  <span className="text-xs font-medium text-[#F0EDE4]/75">{s.value}</span>
                </div>
              ))}
            </div>

            {/* Builder card */}
            <Link
              href={`/builder/${build.builder.slug}`}
              className="bg-[#1C1C1C] border border-[#2AABAB]/15 hover:border-[#2AABAB]/35 rounded-2xl p-5 transition-all group"
            >
              <p className="text-xs text-[#F0EDE4]/35 uppercase tracking-widest mb-3">Builder</p>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-[#2AABAB]/12 border border-[#2AABAB]/20 flex items-center justify-center text-sm font-bold text-[#2AABAB] flex-shrink-0">
                  {build.builder.initials}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-semibold text-[#F0EDE4]">{build.builder.name}</p>
                    {build.builder.verified && <BadgeCheck size={13} className="text-[#2AABAB]" />}
                  </div>
                  <p className="text-xs text-[#F0EDE4]/40">{build.builder.city}</p>
                </div>
              </div>
              <p className="text-xs text-[#F0EDE4]/35 mb-3">{build.builder.specialty}</p>
              <div className="flex items-center gap-1 text-xs text-[#2AABAB] font-semibold group-hover:gap-2 transition-all">
                Profil ansehen <ChevronRight size={13} />
              </div>
            </Link>

          </div>
        </div>
      </div>

      {/* More builds */}
      <div className="max-w-5xl mx-auto px-5 lg:px-8 pb-16">
        <div className="border-t border-[#F0EDE4]/5 pt-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-semibold text-[#F0EDE4]">Weitere Builds</h2>
            <Link href="/builds" className="text-xs text-[#2AABAB] hover:text-[#3DBFBF] transition-colors">
              Alle ansehen →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {BUILDS.filter(b => b.slug !== build.slug).slice(0, 3).map(b => (
              <Link
                key={b.slug}
                href={`/builds/${b.slug}`}
                className="group rounded-xl overflow-hidden bg-[#1C1C1C] border border-[#F0EDE4]/6 hover:border-[#F0EDE4]/20 transition-all hover:-translate-y-0.5"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img src={b.coverImg} alt={b.title} className="w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-500" />
                </div>
                <div className="p-3">
                  <p className="text-xs font-semibold text-[#F0EDE4] line-clamp-1">{b.title}</p>
                  <p className="text-[10px] text-[#F0EDE4]/35 mt-0.5">{b.base} · {b.city}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

    </div>
  )
}
