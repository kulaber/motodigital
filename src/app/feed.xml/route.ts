import { getAllArticles } from '@/lib/magazine/articles'
import { escapeXml, toBerlinIso } from '@/lib/seo'

// Magazine RSS feed. Google crawls feeds more often than sitemaps, so new
// articles get picked up sooner; it can also be submitted in Search Console.
// Lives outside [locale] — the middleware matcher must skip /feed.xml.

const BASE = 'https://motodigital.io'

export const revalidate = 600

export async function GET() {
  const articles = [...(await getAllArticles('de'))].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
  const rfc822 = (date: string) => new Date(toBerlinIso(date)).toUTCString()

  const items = articles
    .map((a) => {
      const url = `${BASE}/magazine/${a.slug}`
      return `    <item>
      <title>${escapeXml(a.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${rfc822(a.publishedAt)}</pubDate>
      <dc:creator>${escapeXml(a.author)}</dc:creator>
      <category>${escapeXml(a.categoryLabel)}</category>
      <description>${escapeXml(a.excerpt)}</description>
      <media:content url="${escapeXml(a.coverImage)}" medium="image" />
    </item>`
    })
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>MotoDigital Magazin</title>
    <link>${BASE}/magazine</link>
    <atom:link href="${BASE}/feed.xml" rel="self" type="application/rss+xml" />
    <description>Guides, Build Stories und Interviews rund um Custom Motorcycles: Cafe Racer, Bobber, Scrambler, Umbau und TÜV.</description>
    <language>de-DE</language>
    ${articles[0] ? `<lastBuildDate>${rfc822(articles[0].updatedAt ?? articles[0].publishedAt)}</lastBuildDate>` : ''}
${items}
  </channel>
</rss>
`

  return new Response(xml, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  })
}
