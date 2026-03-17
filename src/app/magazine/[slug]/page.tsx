import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
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

export async function generateStaticParams() {
  return ARTICLES.map(a => ({ slug: a.slug }))
}

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
    alternates: { canonical: `https://motodigital.io/magazine/${article.slug}` },
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

function formatDateDE(iso: string): string {
  return new Date(iso).toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })
}

function RenderSection({ section }: { section: ArticleSection }) {
  switch (section.type) {
    case 'intro':
      return (
        <p className="text-lg text-[#222222]/75 leading-[1.8] mb-6 font-light">
          {section.text}
        </p>
      )
    case 'h2':
      return (
        <h2
          className="text-xl font-bold text-[#222222] mt-10 mb-3"
          style={{ letterSpacing: '-0.025em' }}
        >
          {section.text}
        </h2>
      )
    case 'p':
      return (
        <p className="text-[15px] text-[#222222]/65 leading-[1.85] mb-5">{section.text}</p>
      )
    case 'quote':
      return (
        <blockquote className="my-10 pl-6 border-l-[3px] border-[#06a5a5]">
          <p className="text-xl text-[#222222] font-light italic leading-relaxed" style={{ letterSpacing: '-0.01em' }}>
            &ldquo;{section.text}&rdquo;
          </p>
          {section.author && (
            <p className="mt-3 text-xs text-[#717171] font-bold uppercase tracking-widest">
              — {section.author}
            </p>
          )}
        </blockquote>
      )
    case 'image':
      return (
        <figure className="my-10 -mx-4 sm:mx-0">
          <img
            src={section.src}
            alt={section.caption ?? ''}
            className="w-full sm:rounded-xl object-cover max-h-[520px]"
          />
          {section.caption && (
            <figcaption className="mt-3 text-xs text-[#222222]/35 text-center px-4 sm:px-0">
              {section.caption}
            </figcaption>
          )}
        </figure>
      )
    case 'list':
      return (
        <ul className="my-5 space-y-2.5">
          {section.items.map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-[15px] text-[#222222]/65 leading-relaxed">
              <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#06a5a5]" />
              {item}
            </li>
          ))}
        </ul>
      )
    case 'cta':
      return (
        <div className="my-10 p-6 bg-[#F7F7F7] border border-[#222222]/6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm font-semibold text-[#222222]">{section.text}</p>
          <Link
            href={section.href}
            className="flex-shrink-0 px-5 py-2.5 bg-[#06a5a5] hover:bg-[#058f8f] text-white text-sm font-bold rounded-xl transition-colors"
          >
            {section.label}
          </Link>
        </div>
      )
    default:
      return null
  }
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

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
    publisher: { '@type': 'Organization', name: 'MotoDigital', url: 'https://motodigital.io' },
    keywords: article.tags.join(', '),
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7] text-[#222222]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header activePage="magazine" />

      {/* ── Hero — dark overlay ── */}
      <div className="relative h-[62vh] min-h-[420px] w-full overflow-hidden">
        <img
          src={article.coverImage}
          alt={article.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Schwarzes Gradient-Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/92 via-black/45 to-black/10" />

        {/* Zentrierter Inhalt */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-12 px-4 sm:px-8 text-center">
          <div className="max-w-3xl w-full">
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-sm">
                {article.categoryLabel}
              </span>
              <span className="text-[11px] text-white/45">{article.readTime} Lesezeit</span>
            </div>
            <h1
              className="font-bold text-white leading-tight mb-4"
              style={{
                fontSize: 'clamp(1.6rem,4vw,2.75rem)',
                letterSpacing: '-0.03em',
                fontFamily: 'var(--font-serif)',
              }}
            >
              {article.title}
            </h1>
            <div className="flex items-center justify-center gap-3 text-[11px] text-white/45">
              <span className="font-medium text-white/65">{article.author}</span>
              <span className="h-2.5 w-px bg-white/20" />
              <span>{formatDateDE(article.publishedAt)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main layout ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Breadcrumbs */}
        <div className="mb-8 flex items-center gap-1.5 text-xs text-[#222222]/35">
          <Link href="/" className="hover:text-[#222222] transition-colors">Home</Link>
          <span>/</span>
          <Link href="/magazine" className="hover:text-[#222222] transition-colors">Magazin</Link>
          <span>/</span>
          <Link href={`/magazine/${article.category}`} className="hover:text-[#222222] transition-colors">{article.categoryLabel}</Link>
          <span>/</span>
          <span className="text-[#222222]/55 truncate max-w-[200px]">
            {article.title.length > 40 ? article.title.slice(0, 40) + '…' : article.title}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-10">

          {/* ── Article content ── */}
          <main className="bg-white rounded-2xl border border-[#222222]/6 px-6 sm:px-10 py-10">
            {article.content.map((section, i) => (
              <RenderSection key={i} section={section} />
            ))}

            {/* Tags footer */}
            <div className="mt-12 pt-6 border-t border-[#222222]/6 flex flex-wrap gap-2">
              {article.tags.map(tag => (
                <span key={tag} className="text-[11px] px-2.5 py-1 rounded-full bg-[#F7F7F7] border border-[#222222]/8 text-[#222222]/50">
                  {tag}
                </span>
              ))}
            </div>
          </main>

          {/* ── Sidebar ── */}
          <aside className="space-y-5">
            <div className="lg:sticky lg:top-24 space-y-5">

              {/* Related builder */}
              {relatedBuilder && (
                <div className="bg-white border border-[#222222]/6 rounded-2xl p-5">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#222222]/35 mb-4">
                    Die Werkstatt
                  </h3>
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 flex-shrink-0 rounded-full bg-[#222222]/10 border border-[#222222]/8 flex items-center justify-center text-[#717171] text-xs font-bold">
                      {relatedBuilder.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#222222] leading-snug">{relatedBuilder.name}</p>
                      <p className="text-xs text-[#222222]/40">{relatedBuilder.city}</p>
                      <p className="text-xs text-[#222222]/30 mt-0.5">{relatedBuilder.specialty}</p>
                    </div>
                  </div>
                  <Link
                    href={`/custom-werkstatt/${relatedBuilder.slug}`}
                    className="mt-4 block text-center text-xs font-semibold text-[#717171] hover:text-[#06a5a5] transition-colors py-2.5 border border-[#222222]/10 rounded-xl hover:border-[#06a5a5]/30"
                  >
                    Profil ansehen →
                  </Link>
                </div>
              )}

              {/* Related build */}
              {relatedBuild && (
                <div className="bg-white border border-[#222222]/6 rounded-2xl overflow-hidden">
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <img
                      src={relatedBuild.coverImg}
                      alt={relatedBuild.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-3 left-4 right-4">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-white/60 mb-0.5">Zum Build</p>
                      <p className="text-sm font-semibold text-white leading-snug">{relatedBuild.title}</p>
                    </div>
                  </div>
                  <div className="px-4 py-3">
                    <p className="text-xs text-[#222222]/40">{relatedBuild.base} · {relatedBuild.style}</p>
                    <Link
                      href={`/custom-bike/${relatedBuild.slug}`}
                      className="mt-2 block text-xs font-semibold text-[#717171] hover:text-[#06a5a5] transition-colors"
                    >
                      Build ansehen →
                    </Link>
                  </div>
                </div>
              )}

              {/* More articles */}
              {moreArticles.length > 0 && (
                <div className="bg-white border border-[#222222]/6 rounded-2xl p-5">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#222222]/35 mb-4">
                    Weitere Artikel
                  </h3>
                  <div className="space-y-4">
                    {moreArticles.map(a => (
                      <Link key={a.slug} href={`/magazine/${a.slug}`} className="flex items-start gap-3 group">
                        <div className="relative h-12 w-16 flex-shrink-0 rounded-lg overflow-hidden">
                          <img src={a.coverImage} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-[#222222] leading-snug line-clamp-2 group-hover:text-[#06a5a5] transition-colors">
                            {a.title}
                          </p>
                          <p className="mt-0.5 text-[10px] text-[#222222]/30">{a.readTime} Lesezeit</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Newsletter */}
              <div className="bg-[#222222] rounded-2xl p-5">
                <h3
                  className="text-sm font-bold text-white mb-1"
                  style={{ letterSpacing: '-0.02em' }}
                >
                  Kein Artikel verpassen
                </h3>
                <p className="text-xs text-white/40 mb-4 leading-relaxed">
                  Build Stories, Interviews und Guides — direkt in dein Postfach.
                </p>
                <input
                  type="email"
                  placeholder="deine@email.de"
                  className="w-full px-3.5 py-2.5 bg-white/8 border border-white/10 rounded-xl text-sm text-white placeholder-white/25 focus:outline-none focus:border-white/25 mb-3"
                />
                <button className="w-full py-2.5 bg-[#06a5a5] hover:bg-[#058f8f] text-white text-sm font-bold rounded-xl transition-colors">
                  Abonnieren
                </button>
              </div>

              {/* Back link */}
              <Link
                href="/magazine"
                className="flex items-center justify-center gap-2 text-xs font-semibold text-[#222222]/40 hover:text-[#222222] transition-colors py-3"
              >
                ← Alle Artikel
              </Link>
            </div>
          </aside>
        </div>
      </div>

      <Footer />
    </div>
  )
}
