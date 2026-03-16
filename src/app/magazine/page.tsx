import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/layout/Header'
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
  'Build Story': 'bg-[#2aabab]/15 text-[#2aabab] border-[#2aabab]/20',
  Interview: 'bg-[#2aabab]/12 text-[#2aabab] border-[#2aabab]/20',
  Guide: 'bg-[#F0EDE4]/8 text-[#F0EDE4]/60 border-[#F0EDE4]/12',
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
    <div className="min-h-screen bg-[#141414] text-[#F0EDE4]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header activePage="magazine" />

      {/* ── Header section ── */}
      <section className="pt-28 pb-10 bg-[#141414]">
        <div className="max-w-6xl mx-auto px-4 sm:px-5 lg:px-8">
          <p className="text-xs font-semibold text-[#2aabab] uppercase tracking-widest mb-3">
            Magazin
          </p>
          <h1
            className="font-bold text-[#F0EDE4] leading-tight mb-4"
            style={{ fontSize: 'clamp(2rem,5vw,3.5rem)', letterSpacing: '-0.03em' }}
          >
            MotoDigital Magazin
          </h1>
          <p className="text-[#F0EDE4]/40 text-base max-w-lg leading-relaxed mb-8">
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
                    ? 'bg-[#2aabab] text-[#141414] border-[#2aabab]'
                    : 'bg-transparent text-[#F0EDE4]/50 border-[#F0EDE4]/10 hover:border-[#F0EDE4]/20 hover:text-[#F0EDE4]/70'
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
              <div className="relative rounded-2xl overflow-hidden bg-[#1C1C1C] border border-[#F0EDE4]/6 hover:border-[#F0EDE4]/20 transition-all duration-300 hover:shadow-2xl hover:shadow-black/40">
                <div className="relative h-[420px] sm:h-[480px] overflow-hidden">
                  <img
                    src={heroArticle.coverImage}
                    alt={heroArticle.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/40 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-8">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border bg-[#2aabab]/15 text-[#2aabab] border-[#2aabab]/20">
                        {heroArticle.categoryLabel}
                      </span>
                      <span className="text-[10px] text-[#F0EDE4]/40">{heroArticle.readTime} Lesezeit</span>
                    </div>
                    <h2
                      className="font-bold text-[#F0EDE4] leading-tight mb-3 max-w-2xl group-hover:text-[#2aabab] transition-colors"
                      style={{ fontSize: 'clamp(1.25rem,3vw,2rem)', letterSpacing: '-0.03em' }}
                    >
                      {heroArticle.title}
                    </h2>
                    <p className="text-sm text-[#F0EDE4]/50 max-w-xl leading-relaxed mb-3">
                      {heroArticle.excerpt}
                    </p>
                    <div className="flex items-center gap-3 text-[10px] text-[#F0EDE4]/35">
                      <span>{heroArticle.author}</span>
                      <span className="h-2.5 w-px bg-[#F0EDE4]/20" />
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
            className="text-sm font-bold text-[#F0EDE4]/40 uppercase tracking-widest mb-6"
          >
            Alle Artikel
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {restArticles.map(article => (
              <Link
                key={article.slug}
                href={`/magazine/${article.slug}`}
                className="card-interactive group block bg-[#1C1C1C] border border-[#F0EDE4]/6 hover:border-[#F0EDE4]/20 rounded-2xl overflow-hidden"
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
                      <span className="text-[10px] text-[#F0EDE4]/25">
                        {article.readTime} Lesezeit
                      </span>
                    </div>
                    <h2 className="text-sm font-semibold text-[#F0EDE4] leading-snug mb-2 line-clamp-2">
                      {article.title}
                    </h2>
                    <p className="text-xs text-[#F0EDE4]/40 leading-relaxed line-clamp-2 mb-4">
                      {article.excerpt}
                    </p>
                    <span className="text-xs font-semibold text-[#2aabab] group-hover:text-[#1f9999] transition-colors">
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
      <section className="pb-16 border-t border-[#F0EDE4]/5 pt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-5 lg:px-8">
          <h2
            className="text-xs font-bold uppercase tracking-widest text-[#F0EDE4]/40 mb-6"
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
                className="text-sm px-4 py-2 rounded-xl bg-[#1C1C1C] border border-[#F0EDE4]/8 text-[#F0EDE4]/50 hover:border-[#2aabab]/30 hover:text-[#2aabab] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-[#141414] border-t border-[#F0EDE4]/5 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-5 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <nav className="flex items-center gap-5 sm:gap-6">
            {['Impressum', 'Datenschutz', 'Kontakt'].map(l => (
              <Link
                key={l}
                href="#"
                className="text-xs text-[#F0EDE4]/25 hover:text-[#F0EDE4]/60 transition-colors"
              >
                {l}
              </Link>
            ))}
          </nav>
          <p className="text-xs text-[#F0EDE4]/15">© 2026 MotoDigital</p>
        </div>
      </footer>
    </div>
  )
}
