import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import Header from '@/components/layout/Header'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import {
  ARTICLES,
  getArticleBySlug,
  getArticlesByCategory,
  type Article,
  type ArticleSection,
} from '@/lib/data/magazine'
import { BUILDERS } from '@/lib/data/builders'
import { BUILDS } from '@/lib/data/builds'

const CATEGORY_SLUGS = ['build-story', 'interview', 'guide'] as const

// ─── Static params ────────────────────────────────────────────────────────────
export async function generateStaticParams() {
  return ARTICLES.map(a => ({ slug: a.slug }))
}

// ─── Metadata ─────────────────────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const article = getArticleBySlug(slug)
  if (!article) return { title: 'Artikel nicht gefunden' }

  return {
    title: article.metaTitle,
    description: article.metaDescription,
    keywords: article.tags.join(', '),
    alternates: {
      canonical: `https://motodigital.vercel.app/magazine/${article.slug}`,
    },
    openGraph: {
      title: article.metaTitle,
      description: article.metaDescription,
      images: [{ url: article.coverImage, width: 1200, height: 630 }],
      type: 'article',
      publishedTime: article.publishedAt,
      tags: article.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: article.metaTitle,
      description: article.metaDescription,
      images: [article.coverImage],
    },
  }
}

// ─── Format date in German ────────────────────────────────────────────────────
function formatDateDE(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })
}

// ─── Content section renderer ─────────────────────────────────────────────────
function RenderSection({ section }: { section: ArticleSection }) {
  switch (section.type) {
    case 'intro':
      return (
        <p className="text-lg text-[#F0EDE4]/70 leading-relaxed mb-6 font-light">
          {section.text}
        </p>
      )
    case 'h2':
      return (
        <h2
          className="text-xl font-bold text-[#F0EDE4] mt-8 mb-3"
          style={{ letterSpacing: '-0.03em' }}
        >
          {section.text}
        </h2>
      )
    case 'p':
      return (
        <p className="text-sm text-[#F0EDE4]/60 leading-relaxed mb-4">{section.text}</p>
      )
    case 'quote':
      return (
        <blockquote className="my-8 pl-5 border-l-2 border-[#2aabab]">
          <p className="text-base text-[#F0EDE4]/80 italic leading-relaxed">
            &ldquo;{section.text}&rdquo;
          </p>
          {section.author && (
            <p className="mt-2 text-xs text-[#2aabab] font-semibold uppercase tracking-widest">
              — {section.author}
            </p>
          )}
        </blockquote>
      )
    case 'image':
      return (
        <figure className="my-8">
          <img
            src={section.src}
            alt={section.caption ?? ''}
            className="w-full rounded-xl object-cover max-h-[480px]"
          />
          {section.caption && (
            <figcaption className="mt-2 text-xs text-[#F0EDE4]/35 text-center">
              {section.caption}
            </figcaption>
          )}
        </figure>
      )
    case 'list':
      return (
        <ul className="my-4 space-y-2">
          {section.items.map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-[#F0EDE4]/60 leading-relaxed">
              <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#2aabab]" />
              {item}
            </li>
          ))}
        </ul>
      )
    case 'cta':
      return (
        <div className="my-8 p-6 bg-[#1C1C1C] border border-[#F0EDE4]/6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm font-semibold text-[#F0EDE4]">{section.text}</p>
          <Link
            href={section.href}
            className="flex-shrink-0 px-5 py-2.5 bg-[#2aabab] hover:bg-[#1f9999] text-[#141414] text-sm font-bold rounded-xl transition-colors"
          >
            {section.label}
          </Link>
        </div>
      )
    default:
      return null
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  // Redirect category slugs to their static pages
  if ((CATEGORY_SLUGS as readonly string[]).includes(slug)) {
    redirect(`/magazine/${slug}`)
  }

  const article = getArticleBySlug(slug)
  if (!article) notFound()

  const relatedBuilder = article.relatedBuilderSlug
    ? BUILDERS.find(b => b.slug === article.relatedBuilderSlug)
    : undefined

  const relatedBuild = article.relatedBuildSlug
    ? BUILDS.find(b => b.slug === article.relatedBuildSlug)
    : undefined

  const moreArticles = getArticlesByCategory(article.category)
    .filter(a => a.slug !== article.slug)
    .slice(0, 3)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.metaDescription,
    image: article.coverImage,
    datePublished: article.publishedAt,
    author: { '@type': 'Person', name: article.author },
    publisher: {
      '@type': 'Organization',
      name: 'MotoDigital',
      url: 'https://motodigital.vercel.app',
    },
    keywords: article.tags.join(', '),
  }

  return (
    <div className="min-h-screen bg-[#141414] text-[#F0EDE4]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header activePage="magazine" />

      {/* ── Hero ── */}
      <div className="relative h-[55vh] min-h-[380px] w-full overflow-hidden">
        <img
          src={article.coverImage}
          alt={article.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/50 to-transparent" />

        {/* overlay content */}
        <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-6 lg:px-8 pb-10 max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border bg-[#2aabab]/15 text-[#2aabab] border-[#2aabab]/20">
              {article.categoryLabel}
            </span>
          </div>
          <h1
            className="font-bold text-[#F0EDE4] leading-tight mb-3 max-w-3xl"
            style={{ fontSize: 'clamp(1.5rem,4vw,2.5rem)', letterSpacing: '-0.03em', fontFamily: 'var(--font-serif)' }}
          >
            {article.title}
          </h1>
          <div className="flex items-center gap-4 text-xs text-[#F0EDE4]/50">
            <span>{article.author}</span>
            <span className="h-3 w-px bg-[#F0EDE4]/20" />
            <span>{formatDateDE(article.publishedAt)}</span>
            <span className="h-3 w-px bg-[#F0EDE4]/20" />
            <span>{article.readTime} Lesezeit</span>
          </div>
        </div>
      </div>

      {/* ── Main layout ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Breadcrumbs */}
        <div className="mb-8">
          <Breadcrumbs
            crumbs={[
              { label: 'Home', href: '/' },
              { label: 'Magazin', href: '/magazine' },
              { label: article.categoryLabel, href: `/magazine/${article.category}` },
              { label: article.title.slice(0, 50) + (article.title.length > 50 ? '…' : '') },
            ]}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* ── Article content ── */}
          <main className="lg:col-span-2">
            {article.content.map((section, i) => (
              <RenderSection key={i} section={section} />
            ))}
          </main>

          {/* ── Sidebar ── */}
          <aside className="lg:col-span-1 space-y-6">
            <div className="lg:sticky lg:top-24 space-y-6">
              {/* Tags */}
              <div className="bg-[#1C1C1C] border border-[#F0EDE4]/6 rounded-2xl p-5">
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#F0EDE4]/40 mb-3">
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {article.tags.map(tag => (
                    <span
                      key={tag}
                      className="text-[11px] px-2.5 py-1 rounded-full bg-[#F0EDE4]/5 border border-[#F0EDE4]/8 text-[#F0EDE4]/50"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Related builder */}
              {relatedBuilder && (
                <div className="bg-[#1C1C1C] border border-[#F0EDE4]/6 rounded-2xl p-5">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[#F0EDE4]/40 mb-4">
                    Der Builder
                  </h3>
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 flex-shrink-0 rounded-full bg-[#2aabab]/15 border border-[#2aabab]/20 flex items-center justify-center text-[#2aabab] text-xs font-bold">
                      {relatedBuilder.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#F0EDE4] leading-snug">
                        {relatedBuilder.name}
                      </p>
                      <p className="text-xs text-[#F0EDE4]/40">{relatedBuilder.city}</p>
                      <p className="text-xs text-[#F0EDE4]/30 mt-0.5">{relatedBuilder.specialty}</p>
                    </div>
                  </div>
                  <Link
                    href={`/builder/${relatedBuilder.slug}`}
                    className="mt-4 block text-center text-xs font-semibold text-[#2aabab] hover:text-[#1f9999] transition-colors py-2 border border-[#2aabab]/20 rounded-xl hover:border-[#2aabab]/40"
                  >
                    Builder-Profil ansehen →
                  </Link>
                </div>
              )}

              {/* Related build */}
              {relatedBuild && (
                <div className="bg-[#1C1C1C] border border-[#F0EDE4]/6 rounded-2xl overflow-hidden">
                  <div className="aspect-[16/9] overflow-hidden">
                    <img
                      src={relatedBuild.coverImg}
                      alt={relatedBuild.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#2aabab] mb-1">
                      Zum Build
                    </p>
                    <p className="text-sm font-semibold text-[#F0EDE4] leading-snug mb-1">
                      {relatedBuild.title}
                    </p>
                    <p className="text-xs text-[#F0EDE4]/40">{relatedBuild.base} · {relatedBuild.style}</p>
                    <Link
                      href={`/custom-bike/${relatedBuild.slug}`}
                      className="mt-3 block text-xs font-semibold text-[#2aabab] hover:text-[#1f9999] transition-colors"
                    >
                      Build ansehen →
                    </Link>
                  </div>
                </div>
              )}

              {/* More articles */}
              {moreArticles.length > 0 && (
                <div className="bg-[#1C1C1C] border border-[#F0EDE4]/6 rounded-2xl p-5">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[#F0EDE4]/40 mb-4">
                    Weitere Artikel
                  </h3>
                  <div className="space-y-4">
                    {moreArticles.map(a => (
                      <Link
                        key={a.slug}
                        href={`/magazine/${a.slug}`}
                        className="flex items-start gap-3 group"
                      >
                        <img
                          src={a.coverImage}
                          alt={a.title}
                          className="h-12 w-16 flex-shrink-0 rounded-lg object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-[#F0EDE4] leading-snug line-clamp-2 group-hover:text-[#2aabab] transition-colors">
                            {a.title}
                          </p>
                          <p className="mt-0.5 text-[10px] text-[#F0EDE4]/30">{a.readTime} Lesezeit</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Newsletter */}
              <div className="bg-[#1C1C1C] border border-[#F0EDE4]/6 rounded-2xl p-5">
                <h3
                  className="text-sm font-bold text-[#F0EDE4] mb-1"
                  style={{ letterSpacing: '-0.03em' }}
                >
                  Kein Artikel verpassen
                </h3>
                <p className="text-xs text-[#F0EDE4]/40 mb-4 leading-relaxed">
                  Build Stories, Interviews und Guides — direkt in dein Postfach.
                </p>
                <input
                  type="email"
                  placeholder="deine@email.de"
                  className="w-full px-3.5 py-2.5 bg-[#141414] border border-[#F0EDE4]/10 rounded-xl text-sm text-[#F0EDE4] placeholder-[#F0EDE4]/25 focus:outline-none focus:border-[#2aabab]/40 mb-3"
                />
                <button className="w-full py-2.5 bg-[#2aabab] hover:bg-[#1f9999] text-[#141414] text-sm font-bold rounded-xl transition-colors">
                  Abonnieren
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#141414] border-t border-[#F0EDE4]/5 py-8 mt-10">
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
