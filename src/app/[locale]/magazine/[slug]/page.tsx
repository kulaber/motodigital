import type { Metadata } from 'next'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { notFound, redirect } from 'next/navigation'
import { getLocale } from 'next-intl/server'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import {
  ARTICLES,
  getArticleBySlugForLocale,
  getArticlesByCategoryForLocale,
  type ArticleSection,
} from '@/lib/data/magazine'
import { createClient } from '@/lib/supabase/server'

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
  const locale = await getLocale()
  const article = getArticleBySlugForLocale(slug, locale)
  if (!article) return { title: locale === 'en' ? 'Article not found' : 'Artikel nicht gefunden' }

  return {
    title: article.metaTitle,
    description: article.metaDescription,
    alternates: { canonical: `https://motodigital.io/magazine/${article.slug}` },
    robots: { index: true, follow: true },
    openGraph: {
      title: article.metaTitle,
      description: article.metaDescription,
      url: `https://motodigital.io/magazine/${article.slug}`,
      siteName: 'MotoDigital',
      locale: 'de_DE',
      images: [{ url: article.coverImage, width: 1200, height: 630, alt: article.title }],
      type: 'article',
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt ?? article.publishedAt,
      tags: article.tags,
      authors: [article.author],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.metaTitle,
      description: article.metaDescription,
      images: [article.coverImage],
    },
  }
}

function countWords(content: ArticleSection[]): number {
  let text = ''
  for (const s of content) {
    if (s.type === 'intro' || s.type === 'h2' || s.type === 'p') text += ' ' + s.text
    else if (s.type === 'quote') text += ' ' + s.text
    else if (s.type === 'list') text += ' ' + s.items.join(' ')
  }
  return text.trim().split(/\s+/).filter(Boolean).length
}

function extractFaq(content: ArticleSection[]): { q: string; a: string }[] {
  const faq: { q: string; a: string }[] = []
  for (let i = 0; i < content.length; i++) {
    const s = content[i]
    if (s.type === 'h2' && s.text.trim().endsWith('?')) {
      // Gather following p/list sections until next h2
      const answerParts: string[] = []
      for (let j = i + 1; j < content.length; j++) {
        const next = content[j]
        if (next.type === 'h2') break
        if (next.type === 'p') answerParts.push(next.text)
        else if (next.type === 'list') answerParts.push(next.items.join('. '))
      }
      if (answerParts.length > 0) faq.push({ q: s.text, a: answerParts.join(' ') })
    }
  }
  return faq
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
          <Image
            src={section.src}
            alt={section.caption ?? ''}
            width={800}
            height={450}
            className="w-full h-auto sm:rounded-xl object-cover max-h-[520px]"
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

  const locale = await getLocale()
  const article = getArticleBySlugForLocale(slug, locale)
  if (!article) notFound()

  // Fetch related builder from DB
  const supabase = await createClient()
  let relatedBuilder: { slug: string; name: string; initials: string; city: string; specialty: string } | undefined
  if (article.relatedBuilderSlug) {
    const { data: bp } = await (supabase.from('profiles') as any)
      .select('slug, full_name, city, specialty')
      .eq('slug', article.relatedBuilderSlug)
      .eq('role', 'custom-werkstatt')
      .maybeSingle()
    if (bp) {
      const name = bp.full_name ?? bp.slug
      relatedBuilder = {
        slug: bp.slug,
        name,
        initials: name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase(),
        city: bp.city ?? '',
        specialty: bp.specialty ?? '',
      }
    }
  }

  // Fetch related build from DB
  let relatedBuild: { slug: string; title: string; base: string; style: string; coverImg: string } | undefined
  if (article.relatedBuildSlug) {
    const { data: bike } = await (supabase.from('bikes') as any)
      .select('id, title, make, model, style, slug, bike_images(url, is_cover, position)')
      .eq('slug', article.relatedBuildSlug)
      .maybeSingle()
    if (bike) {
      const imgs: { url: string; is_cover: boolean; position: number }[] = bike.bike_images ?? []
      const cover = imgs.find((i: { is_cover: boolean }) => i.is_cover)?.url ?? imgs[0]?.url ?? ''
      relatedBuild = {
        slug: bike.slug ?? bike.id,
        title: bike.title,
        base: `${bike.make} ${bike.model}`,
        style: bike.style ?? '',
        coverImg: cover,
      }
    }
  }

  const moreArticles = getArticlesByCategoryForLocale(article.category, locale)
    .filter(a => a.slug !== article.slug)
    .slice(0, 3)

  const canonicalUrl = `https://motodigital.io/magazine/${article.slug}`
  const wordCount = countWords(article.content)
  const faq = article.faq && article.faq.length > 0 ? article.faq.map(f => ({ q: f.q, a: f.a })) : extractFaq(article.content)

  const blogPostingLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonicalUrl },
    headline: article.title,
    description: article.metaDescription,
    image: [article.coverImage],
    datePublished: article.publishedAt,
    dateModified: article.updatedAt ?? article.publishedAt,
    author: { '@type': 'Person', name: article.author },
    publisher: {
      '@type': 'Organization',
      name: 'MotoDigital',
      url: 'https://motodigital.io',
      logo: { '@type': 'ImageObject', url: 'https://motodigital.io/icon-512.png' },
    },
    articleSection: article.categoryLabel,
    keywords: article.tags.join(', '),
    wordCount,
    inLanguage: locale === 'en' ? 'en-US' : 'de-DE',
  }

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://motodigital.io' },
      { '@type': 'ListItem', position: 2, name: 'Magazin', item: 'https://motodigital.io/magazine' },
      { '@type': 'ListItem', position: 3, name: article.categoryLabel, item: `https://motodigital.io/magazine/${article.category}` },
      { '@type': 'ListItem', position: 4, name: article.title, item: canonicalUrl },
    ],
  }

  const faqLd = faq.length >= 2 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  } : null

  // Resolve related articles for cross-linking
  const relatedArticles = (article.relatedSlugs ?? [])
    .map(s => getArticleBySlugForLocale(s, locale))
    .filter((a): a is NonNullable<typeof a> => !!a)

  return (
    <div className="min-h-screen bg-[#F7F7F7] text-[#222222]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      {faqLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
        />
      )}
      <Header activePage="magazine" />

      {/* ── Hero — dark overlay ── */}
      <div className="relative h-[62vh] min-h-[420px] w-full overflow-hidden">
        <Image
          src={article.coverImage}
          alt={`${article.title} — ${article.tags.slice(0, 3).join(', ')}`}
          fill
          sizes="100vw"
          priority
          className="object-cover"
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
              <time dateTime={article.publishedAt}>{formatDateDE(article.publishedAt)}</time>
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

            {/* FAQ — visible answers + FAQPage schema */}
            {article.faq && article.faq.length > 0 && (
              <section className="mt-12 pt-8 border-t border-[#222222]/6" aria-label="Häufige Fragen">
                <h2 className="text-xl font-bold text-[#222222] mb-6" style={{ letterSpacing: '-0.025em' }}>
                  Häufige Fragen
                </h2>
                <div className="space-y-5">
                  {article.faq.map((f, i) => (
                    <details key={i} className="group border-b border-[#222222]/6 pb-4">
                      <summary className="flex items-start justify-between gap-3 cursor-pointer list-none text-[15px] font-semibold text-[#222222] hover:text-[#06a5a5] transition-colors">
                        <span className="flex-1">{f.q}</span>
                        <span className="text-[#222222]/30 text-lg leading-none flex-shrink-0 group-open:rotate-45 transition-transform duration-200">+</span>
                      </summary>
                      <p className="mt-3 text-[14px] text-[#222222]/65 leading-[1.8]">
                        {f.a}
                      </p>
                    </details>
                  ))}
                </div>
              </section>
            )}

            {/* Tags footer */}
            <div className="mt-12 pt-6 border-t border-[#222222]/6 flex flex-wrap gap-2">
              {article.tags.map(tag => (
                <span key={tag} className="text-[11px] px-2.5 py-1 rounded-full bg-[#F7F7F7] border border-[#222222]/8 text-[#222222]/50">
                  {tag}
                </span>
              ))}
            </div>

            {/* Related articles — in-content internal linking for topic authority */}
            {relatedArticles.length > 0 && (
              <section className="mt-12 pt-8 border-t border-[#222222]/6" aria-label="Weiterführende Artikel">
                <h2 className="text-sm font-bold uppercase tracking-widest text-[#222222]/40 mb-5">
                  Weiterlesen
                </h2>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {relatedArticles.map(r => (
                    <li key={r.slug}>
                      <Link
                        href={`/magazine/${r.slug}`}
                        className="group block bg-[#F7F7F7] hover:bg-white border border-[#222222]/6 hover:border-[#222222]/18 rounded-xl p-4 transition-colors"
                      >
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#06a5a5] mb-1.5">
                          {r.categoryLabel}
                        </p>
                        <p className="text-sm font-semibold text-[#222222] leading-snug group-hover:text-[#06a5a5] transition-colors line-clamp-2">
                          {r.title}
                        </p>
                        <p className="mt-1.5 text-xs text-[#222222]/45 line-clamp-2">{r.excerpt}</p>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
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
                    <Image
                      src={relatedBuild.coverImg}
                      alt={relatedBuild.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 340px"
                      className="object-cover"
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
                          <Image src={a.coverImage} alt={a.title} fill sizes="64px" className="object-cover group-hover:scale-105 transition-transform duration-300" />
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
