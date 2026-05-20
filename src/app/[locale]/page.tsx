import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import LandingPage from './landing/page'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const canonicalUrl = locale === 'de' ? 'https://motodigital.io/' : `https://motodigital.io/${locale}`
  return {
    alternates: {
      canonical: canonicalUrl,
      languages: {
        de: 'https://motodigital.io/',
        en: 'https://motodigital.io/en',
        'x-default': 'https://motodigital.io/',
      },
    },
  }
}

// Locale-aware root landing. Rider/workshop redirects are handled by
// middleware so we avoid a blocking getUser() call on every landing hit.
export default async function RootPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  // WebSite + SearchAction LD — only on the homepage so Google may render
  // a Sitelinks Search Box. Site search is at /search?q=<query>.
  const websiteLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'MotoDigital',
    url: 'https://motodigital.io',
    inLanguage: locale === 'de' ? 'de-DE' : 'en-US',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://motodigital.io/search?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd) }}
      />
      <LandingPage />
    </>
  )
}
