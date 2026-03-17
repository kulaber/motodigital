import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { getArticlesByCategory, CATEGORY_META } from '@/lib/data/magazine'

const meta = CATEGORY_META['build-story']

export const metadata: Metadata = {
  title: meta.title,
  description: meta.description,
  alternates: { canonical: 'https://motodigital.io/magazine/build-story' },
  openGraph: { title: meta.title, description: meta.description, type: 'website' },
}

const CATEGORY_TABS = [
  { label: 'Alle',          href: '/magazine' },
  { label: 'Build Stories', href: '/magazine/build-story' },
  { label: 'Interviews',    href: '/magazine/interview' },
  { label: 'Guides',        href: '/magazine/guide' },
]

function formatDateDE(iso: string): string {
  return new Date(iso).toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function BuildStoryPage() {
  const articles = getArticlesByCategory('build-story')

  return (
    <div className="min-h-screen bg-[#F7F7F7] text-[#222222]">
      <Header activePage="magazine" />

      {/* Page header — zentriert */}
      <section className="pt-28 pb-10 bg-white border-b border-[#222222]/6">
        <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-8 text-center">
          <p className="text-[10px] font-bold text-[#717171] uppercase tracking-[0.2em] mb-3">Magazin</p>
          <h1
            className="font-bold text-[#222222] leading-tight mb-4"
            style={{ fontSize: 'clamp(2rem,5vw,3.75rem)', letterSpacing: '-0.03em', fontFamily: 'var(--font-serif)' }}
          >
            Build Stories
          </h1>
          <p className="text-[#222222]/45 text-base max-w-[55ch] mx-auto leading-relaxed mb-8">
            Die Build Stories der außergewöhnlichsten Custom-Motorcycles Europas — von der Idee bis zur Fertigstellung.
          </p>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {CATEGORY_TABS.map(tab => (
              <Link
                key={tab.href}
                href={tab.href}
                className={`text-xs font-semibold px-4 py-2 rounded-full border transition-colors ${
                  tab.href === '/magazine/build-story'
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

      {/* Grid */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xs font-bold text-[#222222]/40 uppercase tracking-widest">Build Stories</h2>
            <span className="text-xs text-[#222222]/25">{articles.length} Beiträge</span>
          </div>

          {articles.length === 0 ? (
            <p className="text-[#222222]/40 text-sm py-20 text-center">Noch keine Artikel in dieser Kategorie.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {articles.map(article => (
                <Link
                  key={article.slug}
                  href={`/magazine/${article.slug}`}
                  className="card-interactive group block bg-white border border-[#222222]/6 hover:border-[#222222]/18 rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-lg hover:shadow-black/6"
                >
                  <article>
                    <div className="relative aspect-[16/9] overflow-hidden">
                      <img
                        src={article.coverImage}
                        alt={article.title}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="absolute top-3 left-3">
                        <span className="text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-[#222222]/10 border border-[#222222]/12 text-[#222222]/60">
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
          )}

          <div className="mt-10 pt-8 border-t border-[#222222]/6">
            <Link href="/magazine" className="text-xs font-semibold text-[#222222]/40 hover:text-[#222222] transition-colors">
              ← Zurück zum Magazin
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
