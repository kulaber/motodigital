import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { ARTICLES } from '@/lib/data/magazine'

export const metadata: Metadata = {
  title: 'MotoDigital Magazin — Build Stories, Interviews & Guides',
  description:
    'Stories aus der Custom-Motorcycle-Welt: Builder-Interviews, Build Stories und Guides für die Community. Alles rund um Custom Bikes in Deutschland.',
  alternates: {
    canonical: 'https://motodigital.vercel.app/magazine',
  },
  openGraph: {
    title: 'MotoDigital Magazin — Build Stories, Interviews & Guides',
    description:
      'Stories aus der Custom-Motorcycle-Welt: Builder-Interviews, Build Stories und Guides für die Community.',
    type: 'website',
    images: [{ url: ARTICLES[0]?.coverImage ?? '', width: 1200, height: 630 }],
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'MotoDigital Magazin',
  description: 'Build Stories, Interviews und Guides aus der Custom-Motorcycle-Welt.',
  url: 'https://motodigital.vercel.app/magazine',
  publisher: {
    '@type': 'Organization',
    name: 'MotoDigital',
    url: 'https://motodigital.vercel.app',
  },
}

const CATEGORY_TABS = [
  { label: 'Alle',         href: '/magazine' },
  { label: 'Build Stories', href: '/magazine/build-story' },
  { label: 'Interviews',   href: '/magazine/interview' },
  { label: 'Guides',       href: '/magazine/guide' },
]

const CATEGORY_COLORS: Record<string, string> = {
  'Build Story': 'bg-[#222222]/10 text-[#222222]/60 border-[#222222]/12',
  Interview:     'bg-[#222222]/10 text-[#222222]/60 border-[#222222]/12',
  Guide:         'bg-[#222222]/10 text-[#222222]/60 border-[#222222]/12',
}

function formatDateDE(iso: string): string {
  return new Date(iso).toLocaleDateString('de-DE', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

export default function MagazinePage() {
  const [heroArticle, ...restArticles] = ARTICLES

  return (
    <div className="min-h-screen bg-[#F7F7F7] text-[#222222]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header activePage="magazine" />

      {/* ── Page Header — zentriert ── */}
      <section className="pt-28 pb-10 bg-white border-b border-[#222222]/6">
        <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-8 text-center">
          <p className="text-[10px] font-bold text-[#717171] uppercase tracking-[0.2em] mb-3">
            Magazin
          </p>
          <h1
            className="font-bold text-[#222222] leading-tight mb-4"
            style={{
              fontSize: 'clamp(2rem,5vw,3.75rem)',
              letterSpacing: '-0.03em',
              fontFamily: 'var(--font-serif)',
            }}
          >
            Stories aus der Szene.
          </h1>
          <p className="text-[#222222]/45 text-base max-w-[55ch] mx-auto leading-relaxed mb-8">
            Builds, Interviews &amp; Kultur — Einblicke in die Custom-Motorcycle-Welt aus erster Hand.
          </p>

          {/* Category filter tabs */}
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {CATEGORY_TABS.map(tab => (
              <Link
                key={tab.href}
                href={tab.href}
                className={`text-xs font-semibold px-4 py-2 rounded-full border transition-colors ${
                  tab.href === '/magazine'
                    ? 'bg-[#222222] text-white border-[#222222]'
                    : 'bg-transparent text-[#222222]/50 border-[#222222]/12 hover:border-[#222222]/30 hover:text-[#222222]/80'
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Hero article ── */}
      {heroArticle && (
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-8">
            <Link href={`/magazine/${heroArticle.slug}`} className="group block">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-black/20">

                {/* Image */}
                <div className="relative h-[460px] sm:h-[540px] lg:h-[600px] overflow-hidden">
                  <Image
                    src={heroArticle.coverImage}
                    alt={heroArticle.title}
                    fill
                    sizes="(max-width: 1280px) 100vw, 1280px"
                    priority
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  />

                  {/* Dark gradient overlay — schwarz statt weiß */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/5" />

                  {/* Content over dark overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-8 sm:p-10">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-sm">
                        {heroArticle.categoryLabel}
                      </span>
                      <span className="text-[11px] text-white/50">{heroArticle.readTime} Lesezeit</span>
                    </div>
                    <h2
                      className="font-bold text-white leading-tight mb-3 max-w-2xl group-hover:text-white/80 transition-colors"
                      style={{ fontSize: 'clamp(1.4rem,3.5vw,2.25rem)', letterSpacing: '-0.025em' }}
                    >
                      {heroArticle.title}
                    </h2>
                    <p className="text-sm text-white/60 max-w-xl leading-relaxed mb-4 hidden sm:block">
                      {heroArticle.excerpt}
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-white/40">
                      <span className="font-medium text-white/60">{heroArticle.author}</span>
                      <span className="h-2.5 w-px bg-white/20" />
                      <span>{formatDateDE(heroArticle.publishedAt)}</span>
                    </div>
                  </div>

                  {/* Featured badge top-right */}
                  <div className="absolute top-5 right-5">
                    <span className="text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-[#06a5a5] text-white">
                      Featured
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* ── Articles grid ── */}
      <section className="pb-16 pt-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xs font-bold text-[#222222]/40 uppercase tracking-widest">
              Alle Artikel
            </h2>
            <span className="text-xs text-[#222222]/25">{restArticles.length} Beiträge</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {restArticles.map(article => (
              <Link
                key={article.slug}
                href={`/magazine/${article.slug}`}
                className="card-interactive group block bg-white border border-[#222222]/6 hover:border-[#222222]/18 rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-lg hover:shadow-black/6"
              >
                <article>
                  {/* Image with dark overlay on hover */}
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <Image
                      src={article.coverImage}
                      alt={article.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute top-3 left-3">
                      <span className={`text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${CATEGORY_COLORS[article.categoryLabel] ?? ''}`}>
                        {article.categoryLabel}
                      </span>
                    </div>
                  </div>

                  <div className="p-5">
                    <h2 className="text-sm font-semibold text-[#222222] leading-snug mb-2 line-clamp-2 group-hover:text-[#06a5a5] transition-colors">
                      {article.title}
                    </h2>
                    <p className="text-xs text-[#222222]/45 leading-relaxed line-clamp-2 mb-4">
                      {article.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[10px] text-[#222222]/30">
                        <span>{article.author}</span>
                        <span className="h-2 w-px bg-[#222222]/15" />
                        <span>{article.readTime}</span>
                      </div>
                      <span className="text-[11px] font-semibold text-[#06a5a5] opacity-0 group-hover:opacity-100 transition-opacity">
                        Lesen →
                      </span>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Themen section ── */}
      <section className="py-12 border-t border-[#222222]/6 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-8 text-center">
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#222222]/35 mb-5">
            Themen &amp; Stile
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { label: 'Cafe Racer',                   href: '/bikes/cafe-racer' },
              { label: 'Bobber',                       href: '/bikes/bobber' },
              { label: 'Scrambler',                    href: '/bikes/scrambler' },
              { label: 'Custom-Werkstatt-Verzeichnis', href: '/custom-werkstatt' },
            ].map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm px-4 py-2 rounded-full border border-[#222222]/10 text-[#222222]/50 hover:border-[#222222]/25 hover:text-[#222222]/80 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
