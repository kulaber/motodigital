import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { BadgeCheck, MapPin, Calendar, Star, ArrowLeft, Globe, Instagram, Play } from 'lucide-react'
import Header from '@/components/layout/Header'
import { BUILDERS, getBuilderBySlug } from '@/lib/data/builders'
import BuilderGallery from '@/components/builder/BuilderGallery'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const builder = getBuilderBySlug(slug)
  if (!builder) return {}
  return {
    title: `${builder.name} — Builder auf MotoDigital`,
    description: builder.bio,
  }
}

export function generateStaticParams() {
  return BUILDERS.map(b => ({ slug: b.slug }))
}

export default async function BuilderProfilePage({ params }: Props) {
  const { slug } = await params
  const builder = getBuilderBySlug(slug)
  if (!builder) notFound()

  const images = builder.media.filter(m => m.type === 'image')
  const videos = builder.media.filter(m => m.type === 'video')

  return (
    <div className="min-h-screen bg-[#141414] text-[#F0EDE4]">
      <Header activePage="builder" />

      {/* ── HERO ── */}
      <section className="pt-24 pb-0 bg-[#141414]">
        <div className="max-w-5xl mx-auto px-4 sm:px-5 lg:px-8">

          <Link href="/builder"
            className="inline-flex items-center gap-1.5 text-xs text-[#F0EDE4]/35 hover:text-[#F0EDE4] transition-colors mb-8">
            <ArrowLeft size={13} /> Alle Builder
          </Link>

          <div className="flex flex-col sm:flex-row items-start gap-6 mb-10 animate-slide-up">
            {/* Avatar */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#2AABAB]/12 border border-[#2AABAB]/25 flex items-center justify-center text-2xl font-bold text-[#2AABAB] flex-shrink-0">
              {builder.initials}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <h1 className="text-2xl sm:text-3xl font-bold text-[#F0EDE4] tracking-tight">
                  {builder.name}
                </h1>
                {builder.verified && (
                  <span className="inline-flex items-center gap-1 bg-[#2AABAB]/10 border border-[#2AABAB]/25 text-[#2AABAB] text-xs font-semibold px-2.5 py-1 rounded-full">
                    <BadgeCheck size={11} /> Verifiziert
                  </span>
                )}
                {builder.featured && (
                  <span className="inline-flex items-center bg-amber-400/10 border border-amber-400/20 text-amber-400 text-xs font-semibold px-2.5 py-1 rounded-full">
                    Top Builder
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-[#F0EDE4]/40 mb-3">
                <span className="flex items-center gap-1"><MapPin size={11} /> {builder.city}</span>
                <span className="flex items-center gap-1"><Calendar size={11} /> Seit {builder.since}</span>
                <span className="flex items-center gap-1">
                  <Star size={11} className="text-[#2AABAB]" fill="#2AABAB" />
                  <span className="text-[#F0EDE4]/60 font-semibold">{builder.rating}</span>
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {builder.tags.map(tag => (
                  <span key={tag} className="text-[10px] font-medium text-[#F0EDE4]/40 bg-[#F0EDE4]/5 border border-[#F0EDE4]/8 px-2.5 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex sm:flex-col gap-4 sm:gap-2 text-right flex-shrink-0">
              <div>
                <p className="text-2xl font-bold text-[#F0EDE4] leading-none">{builder.builds}</p>
                <p className="text-xs text-[#F0EDE4]/30 mt-0.5">Builds</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-[#2AABAB] leading-none">{builder.rating}</p>
                <p className="text-xs text-[#F0EDE4]/30 mt-0.5">Rating</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MEDIA GALLERY ── */}
      {builder.media.length > 0 && (
        <section className="mb-0">
          <div className="max-w-5xl mx-auto px-4 sm:px-5 lg:px-8 pb-0">

            {/* Photo grid */}
            {images.length > 0 && (
              <div className="mb-8">
                <p className="text-xs font-semibold text-[#F0EDE4]/25 uppercase tracking-widest mb-3">Galerie</p>
                <BuilderGallery images={images} />
              </div>
            )}

            {/* Videos */}
            {videos.length > 0 && (
              <div className="mb-8">
                <p className="text-xs font-semibold text-[#F0EDE4]/25 uppercase tracking-widest mb-3">Videos</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {videos.map((item, i) => (
                    <div key={i} className="group relative rounded-xl overflow-hidden bg-[#1C1C1C] border border-[#F0EDE4]/5">
                      <div className="aspect-video">
                        <video
                          src={item.url}
                          controls
                          className="w-full h-full object-cover"
                          poster=""
                        />
                      </div>
                      {item.title && (
                        <div className="px-3 py-2.5">
                          <p className="text-xs text-[#F0EDE4]/60 font-medium flex items-center gap-1.5">
                            <Play size={10} className="text-[#2AABAB]" /> {item.title}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── CONTENT ── */}
      <section className="pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-5 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8 items-start">

            {/* LEFT */}
            <div>
              {/* About */}
              <div className="bg-[#1C1C1C] border border-[#F0EDE4]/6 rounded-2xl p-5 sm:p-6 mb-5">
                <h2 className="text-xs font-semibold text-[#F0EDE4]/30 uppercase tracking-widest mb-3">Über</h2>
                <p className="text-sm text-[#F0EDE4]/70 leading-relaxed">{builder.bioLong}</p>

                {builder.bases.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-[#F0EDE4]/5">
                    <p className="text-xs text-[#F0EDE4]/30 mb-2">Bevorzugte Basis-Bikes</p>
                    <div className="flex flex-wrap gap-2">
                      {builder.bases.map(base => (
                        <span key={base} className="text-xs text-[#2AABAB] bg-[#2AABAB]/8 border border-[#2AABAB]/15 px-2.5 py-1 rounded-full font-medium">
                          {base}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Featured builds */}
              {builder.featuredBuilds.length > 0 && (
                <div>
                  <h2 className="text-xs font-semibold text-[#F0EDE4]/30 uppercase tracking-widest mb-3">Featured Builds</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {builder.featuredBuilds.map(build => (
                      <div key={build.title} className="group bg-[#1C1C1C] border border-[#F0EDE4]/6 rounded-2xl overflow-hidden hover:border-[#F0EDE4]/15 transition-all">
                        <div className="relative aspect-[16/9] overflow-hidden">
                          <img
                            src={build.img}
                            alt={build.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                          />
                          <span className="absolute top-2.5 left-2.5 bg-[#141414]/80 backdrop-blur-sm border border-[#F0EDE4]/15 text-[#F0EDE4] text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full">
                            {build.style}
                          </span>
                        </div>
                        <div className="p-3.5">
                          <p className="text-sm font-semibold text-[#F0EDE4]">{build.title}</p>
                          <p className="text-xs text-[#F0EDE4]/35 mt-0.5">{build.base} · {build.year}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT sidebar */}
            <div className="flex flex-col gap-4 lg:sticky lg:top-24">

              {/* Contact CTA */}
              <div className="bg-[#1C1C1C] border border-[#2AABAB]/20 rounded-2xl p-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 pointer-events-none"
                  style={{ background: 'radial-gradient(circle, rgba(42,171,171,0.1) 0%, transparent 70%)', transform: 'translate(30%,-30%)' }} />
                <p className="text-sm font-bold text-[#F0EDE4] mb-1">Projekt anfragen</p>
                <p className="text-xs text-[#F0EDE4]/40 leading-relaxed mb-4">
                  Starte eine Konversation direkt mit {builder.name.split(' ')[0]}.
                </p>
                <Link
                  href="/auth/register"
                  className="block w-full bg-[#2AABAB] text-[#141414] text-sm font-semibold py-3 rounded-full text-center hover:bg-[#3DBFBF] transition-all hover:-translate-y-0.5"
                >
                  Nachricht senden
                </Link>
              </div>

              {/* Links */}
              {(builder.instagram || builder.website) && (
                <div className="bg-[#1C1C1C] border border-[#F0EDE4]/6 rounded-2xl p-5">
                  <p className="text-xs font-semibold text-[#F0EDE4]/30 uppercase tracking-widest mb-3">Links</p>
                  <div className="flex flex-col gap-2.5">
                    {builder.instagram && (
                      <div className="flex items-center gap-2.5 text-xs text-[#F0EDE4]/50">
                        <Instagram size={13} className="text-[#F0EDE4]/25 flex-shrink-0" />
                        <span>{builder.instagram}</span>
                      </div>
                    )}
                    {builder.website && (
                      <div className="flex items-center gap-2.5 text-xs text-[#F0EDE4]/50">
                        <Globe size={13} className="text-[#F0EDE4]/25 flex-shrink-0" />
                        <span>{builder.website}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Specialty */}
              <div className="bg-[#1C1C1C] border border-[#F0EDE4]/6 rounded-2xl p-5">
                <p className="text-xs font-semibold text-[#F0EDE4]/30 uppercase tracking-widest mb-3">Spezialisierung</p>
                <p className="text-sm text-[#F0EDE4]/60">{builder.specialty}</p>
              </div>

            </div>
          </div>
        </div>
      </section>

      <footer className="bg-[#141414] border-t border-[#F0EDE4]/5 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-5 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <Link href="/builder" className="text-xs text-[#2AABAB] hover:text-[#3DBFBF] transition-colors">
            ← Zurück zu allen Buildern
          </Link>
          <p className="text-xs text-[#F0EDE4]/15">© 2026 MotoDigital</p>
        </div>
      </footer>
    </div>
  )
}
