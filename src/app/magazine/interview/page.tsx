import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { getArticlesByCategory, CATEGORY_META } from '@/lib/data/magazine'

const meta = CATEGORY_META['interview']

export const metadata: Metadata = {
  title: meta.title,
  description: meta.description,
  alternates: {
    canonical: 'https://motodigital.vercel.app/magazine/interview',
  },
  openGraph: {
    title: meta.title,
    description: meta.description,
    type: 'website',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://motodigital.vercel.app' },
    { '@type': 'ListItem', position: 2, name: 'Magazin', item: 'https://motodigital.vercel.app/magazine' },
    { '@type': 'ListItem', position: 3, name: 'Interviews', item: 'https://motodigital.vercel.app/magazine/interview' },
  ],
}

function formatDateDE(iso: string): string {
  return new Date(iso).toLocaleDateString('de-DE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default function InterviewPage() {
  const articles = getArticlesByCategory('interview')

  return (
    <div className="min-h-screen bg-[#141414] text-[#F0EDE4]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header activePage="magazine" />

      {/* Hero */}
      <section className="pt-28 pb-12 bg-[#141414]">
        <div className="max-w-6xl mx-auto px-4 sm:px-5 lg:px-8">
          <div className="mb-6">
            <Breadcrumbs
              crumbs={[
                { label: 'Home', href: '/' },
                { label: 'Magazin', href: '/magazine' },
                { label: 'Interviews' },
              ]}
            />
          </div>
          <p className="text-xs font-semibold text-[#2aabab] uppercase tracking-widest mb-3">
            Kategorie
          </p>
          <h1
            className="font-bold text-[#F0EDE4] leading-tight mb-4"
            style={{ fontSize: 'clamp(2rem,5vw,3rem)', letterSpacing: '-0.03em' }}
          >
            Interviews
          </h1>
          <p className="text-[#F0EDE4]/40 text-base max-w-lg leading-relaxed">
            {meta.description}
          </p>
        </div>
      </section>

      {/* Articles grid */}
      <section className="pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-5 lg:px-8">
          {articles.length === 0 ? (
            <p className="text-[#F0EDE4]/40 text-sm">Noch keine Artikel in dieser Kategorie.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {articles.map(article => (
                <article
                  key={article.slug}
                  className="group bg-[#1C1C1C] border border-[#F0EDE4]/6 hover:border-[#F0EDE4]/20 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/40"
                >
                  <div className="aspect-[16/9] overflow-hidden">
                    <img
                      src={article.coverImage}
                      alt={article.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
                    />
                  </div>
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border bg-[#2aabab]/15 text-[#2aabab] border-[#2aabab]/20">
                        {article.categoryLabel}
                      </span>
                      <span className="text-[10px] text-[#F0EDE4]/25">{article.readTime} Lesezeit</span>
                    </div>
                    <h2 className="text-sm font-semibold text-[#F0EDE4] leading-snug mb-2 line-clamp-2">
                      {article.title}
                    </h2>
                    <p className="text-xs text-[#F0EDE4]/40 leading-relaxed line-clamp-2 mb-3">
                      {article.excerpt}
                    </p>
                    <p className="text-[10px] text-[#F0EDE4]/25 mb-4">{formatDateDE(article.publishedAt)}</p>
                    <Link
                      href={`/magazine/${article.slug}`}
                      className="text-xs font-semibold text-[#2aabab] hover:text-[#1f9999] transition-colors"
                    >
                      Lesen →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* Back link */}
          <div className="mt-12 pt-8 border-t border-[#F0EDE4]/5">
            <Link
              href="/magazine"
              className="text-sm font-semibold text-[#2aabab] hover:text-[#1f9999] transition-colors"
            >
              ← Zurück zum Magazin
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
