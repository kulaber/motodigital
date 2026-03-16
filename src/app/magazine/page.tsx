import type { Metadata } from 'next'
import Link from 'next/link'
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
  description:
    'Build Stories, Interviews und Guides aus der Custom-Motorcycle-Welt.',
  url: 'https://motodigital.vercel.app/magazine',
  publisher: {
    '@type': 'Organization',
    name: 'MotoDigital',
    url: 'https://motodigital.vercel.app',
  },
}

const CATEGORY_COLORS: Record<string, string> = {
  'Build Story': 'bg-[#222222]/15 text-[#717171] border-[#DDDDDD]/20',
  Interview: 'bg-[#222222]/12 text-[#717171] border-[#DDDDDD]/20',
  Guide: 'bg-[#222222]/8 text-[#222222]/60 border-[#222222]/12',
}

const CATEGORY_TABS = [
  { label: 'Alle', href: '/magazine' },
  { label: 'Build Stories', href: '/magazine/build-story' },
  { label: 'Interviews', href: '/magazine/interview' },
  { label: 'Guides', href: '/magazine/guide' },
]

function formatDateDE(iso: string): string {
  return new Date(iso).toLocaleDateString('de-DE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default function MagazinePage() {
  const [heroArticle, ...restArticles] = ARTICLES

  return (
    <div className="min-h-screen bg-white text-[#222222]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header activePage="magazine" />

      {/* ── Header section ── */}
      <section className="pt-28 pb-10 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-5 lg:px-8">
          <p className="text-xs font-semibold text-[#717171] uppercase tracking-widest mb-3">
            Magazin
          </p>
          <h1
            className="font-bold text-[#222222] leading-tight mb-4"
            style={{ fontSize: 'clamp(2rem,5vw,3.5rem)', letterSpacing: '-0.03em', fontFamily: 'var(--font-serif)' }}
          >
            MotoDigital Magazin
          </h1>
          <p className="text-[#222222]/40 text-base max-w-lg leading-relaxed mb-8">
            Stories, Builds, Culture — Einblicke in die Custom-Motorcycle-Welt aus erster Hand.
          </p>

          {/* Category filter tabs */}
          <div className="flex items-center gap-2 flex-wrap">
            {CATEGORY_TABS.map(tab => (
              <Link
                key={tab.href}
                href={tab.href}
                className={`text-xs font-semibold px-4 py-2 rounded-xl border transition-colors ${
                  tab.href === '/magazine'
                    ? 'bg-[#086565] text-white border-[#DDDDDD]'
                    : 'bg-transparent text-[#222222]/50 border-[#222222]/10 hover:border-[#222222]/20 hover:text-[#222222]/70'
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured / Hero article ── */}
      {heroArticle && (
        <section className="pb-10">
          <div className="max-w-6xl mx-auto px-4 sm:px-5 lg:px-8">
            <Link href={`/magazine/${heroArticle.slug}`} className="group block">
              <div className="relative rounded-2xl overflow-hidden bg-white border border-[#222222]/6 hover:border-[#222222]/20 transition-all duration-300 hover:shadow-2xl hover:shadow-black/40">
                <div className="relative h-[420px] sm:h-[480px] overflow-hidden">
                  <img
                    src={heroArticle.coverImage}
                    alt={heroArticle.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-8">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border bg-[#222222]/15 text-[#717171] border-[#DDDDDD]/20">
                        {heroArticle.categoryLabel}
                      </span>
                      <span className="text-[10px] text-[#222222]/40">{heroArticle.readTime} Lesezeit</span>
                    </div>
                    <h2
                      className="font-bold text-[#222222] leading-tight mb-3 max-w-2xl group-hover:text-[#717171] transition-colors"
                      style={{ fontSize: 'clamp(1.25rem,3vw,2rem)', letterSpacing: '-0.03em' }}
                    >
                      {heroArticle.title}
                    </h2>
                    <p className="text-sm text-[#222222]/50 max-w-xl leading-relaxed mb-3">
                      {heroArticle.excerpt}
                    </p>
                    <div className="flex items-center gap-3 text-[10px] text-[#222222]/35">
                      <span>{heroArticle.author}</span>
                      <span className="h-2.5 w-px bg-[#222222]/20" />
                      <span>{formatDateDE(heroArticle.publishedAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* ── Articles grid ── */}
      <section className="pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-5 lg:px-8">
          <h2
            className="text-sm font-bold text-[#222222]/40 uppercase tracking-widest mb-6"
          >
            Alle Artikel
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {restArticles.map(article => (
              <Link
                key={article.slug}
                href={`/magazine/${article.slug}`}
                className="card-interactive group block bg-white border border-[#222222]/6 hover:border-[#222222]/20 rounded-2xl overflow-hidden"
              >
                <article>
                  <div className="aspect-[16/9] overflow-hidden">
                    <img
                      src={article.coverImage}
                      alt={article.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
                    />
                  </div>
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                          CATEGORY_COLORS[article.categoryLabel] ?? ''
                        }`}
                      >
                        {article.categoryLabel}
                      </span>
                      <span className="text-[10px] text-[#222222]/25">
                        {article.readTime} Lesezeit
                      </span>
                    </div>
                    <h2 className="text-sm font-semibold text-[#222222] leading-snug mb-2 line-clamp-2">
                      {article.title}
                    </h2>
                    <p className="text-xs text-[#222222]/40 leading-relaxed line-clamp-2 mb-4">
                      {article.excerpt}
                    </p>
                    <span className="text-xs font-semibold text-[#717171] group-hover:text-[#1f9999] transition-colors">
                      Lesen →
                    </span>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Themen section ── */}
      <section className="pb-16 border-t border-[#222222]/5 pt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-5 lg:px-8">
          <h2
            className="text-xs font-bold uppercase tracking-widest text-[#222222]/40 mb-6"
          >
            Themen & Stile
          </h2>
          <div className="flex flex-wrap gap-3">
            {[
              { label: 'Cafe Racer', href: '/bikes/cafe-racer' },
              { label: 'Bobber', href: '/bikes/bobber' },
              { label: 'Scrambler', href: '/bikes/scrambler' },
              { label: 'Builder-Verzeichnis', href: '/builder' },
            ].map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm px-4 py-2 rounded-xl bg-white border border-[#222222]/8 text-[#222222]/50 hover:border-[#DDDDDD]/30 hover:text-[#717171] transition-colors"
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
