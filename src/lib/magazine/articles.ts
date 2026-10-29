// Magazine articles = static ones (src/lib/data/magazine.ts) + published
// articles from the database (written by agents, approved by the founder).
// Server-side only. Cached under the 'magazine' tag; publishing revalidates it.

import { unstable_cache } from 'next/cache'
import { createClient } from '@supabase/supabase-js'
import {
  ARTICLES,
  getArticlesForLocale,
  type Article,
  type ArticleSection,
} from '@/lib/data/magazine'

export const MAGAZINE_TAG = 'magazine'

const CATEGORY_LABEL: Record<Article['category'], string> = {
  'build-story': 'Build Story',
  interview: 'Interview',
  guide: 'Guide',
}

export interface DbArticleRow {
  id: string
  slug: string
  title: string
  meta_title: string
  meta_description: string
  category: Article['category']
  excerpt: string
  cover_image: string | null
  tags: string[] | null
  related_slugs: string[] | null
  related_builder_slug: string | null
  faq: { q: string; a: string }[] | null
  content: ArticleSection[] | null
  read_time: string | null
  author: string
  published_at: string | null
  updated_at: string | null
  created_at: string
}

export const DB_ARTICLE_COLUMNS =
  'id, slug, title, meta_title, meta_description, category, excerpt, cover_image, tags, related_slugs, related_builder_slug, faq, content, read_time, author, published_at, updated_at, created_at'

const FALLBACK_COVER = 'https://motodigital.io/og-image.jpg'

export function rowToArticle(r: DbArticleRow): Article {
  return {
    slug: r.slug,
    title: r.title,
    metaTitle: r.meta_title,
    metaDescription: r.meta_description,
    category: r.category,
    categoryLabel: CATEGORY_LABEL[r.category],
    excerpt: r.excerpt,
    coverImage: r.cover_image || FALLBACK_COVER,
    publishedAt: (r.published_at ?? r.created_at).slice(0, 10),
    updatedAt: r.updated_at?.slice(0, 10),
    readTime: r.read_time ?? '6 min',
    author: r.author,
    tags: r.tags ?? [],
    relatedSlugs: r.related_slugs ?? [],
    relatedBuilderSlug: r.related_builder_slug ?? undefined,
    faq: r.faq ?? [],
    content: r.content ?? [],
  }
}

/** Published DB articles, newest first. Anon client → RLS only returns published rows. */
export const getPublishedDbArticles = unstable_cache(
  async (): Promise<Article[]> => {
    const db = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    )
    const { data, error } = await db
      .from('magazine_articles')
      .select(DB_ARTICLE_COLUMNS)
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(500)
    // Throw instead of returning [] — unstable_cache would keep an empty list
    // for 10 minutes, while a throw leaves the last good result in place
    if (error) throw new Error(`magazine_articles: ${error.message}`)
    return ((data ?? []) as DbArticleRow[]).map(rowToArticle)
  },
  ['magazine-db-articles'],
  { tags: [MAGAZINE_TAG], revalidate: 600 },
)

/** All articles for a locale: newest DB articles first, then the static list in its curated order */
export async function getAllArticles(locale: string): Promise<Article[]> {
  const db = await getPublishedDbArticles()
  const staticSlugs = new Set(ARTICLES.map(a => a.slug))
  // DB article bodies are German; EN shows the same article (EN URLs are noindexed)
  return [...db.filter(a => !staticSlugs.has(a.slug)), ...getArticlesForLocale(locale)]
}

export async function getArticleBySlugAll(slug: string, locale: string): Promise<Article | undefined> {
  return (await getAllArticles(locale)).find(a => a.slug === slug)
}

export async function getArticlesByCategoryAll(category: Article['category'], locale: string): Promise<Article[]> {
  return (await getAllArticles(locale)).filter(a => a.category === category)
}

/** Slugs already taken (static + any DB row incl. drafts) — used when agents save drafts */
export function staticArticleSlugs(): string[] {
  return ARTICLES.map(a => a.slug)
}
