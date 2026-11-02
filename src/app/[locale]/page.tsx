import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import LandingPage from './landing/page'

const HOMEPAGE_META: Record<string, { title: string; description: string }> = {
  de: {
    title: 'Custom Bikes kaufen & Werkstätten finden — MotoDigital',
    description:
      'Der Marktplatz für handgefertigte Custom Motorräder: Cafe Racer, Bobber, Scrambler und Chopper kaufen und verkaufen — und die passende Werkstatt finden.',
  },
  en: {
    title: 'Custom Motorcycles for Sale & Workshops — MotoDigital',
    description:
      'The marketplace for handcrafted custom motorcycles: buy and sell cafe racers, bobbers, scramblers and choppers — and find the right custom workshop.',
  },
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const canonicalUrl = locale === 'de' ? 'https://motodigital.io/' : `https://motodigital.io/${locale}`
  const meta = HOMEPAGE_META[locale] ?? HOMEPAGE_META.de
  // A custom build by Classicbike Raisch (from their MotoDigital profile), not the logo card
  const image = { url: '/og/home.jpg', width: 1200, height: 630, alt: meta.title }
  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        de: 'https://motodigital.io/',
        en: 'https://motodigital.io/en',
        'x-default': 'https://motodigital.io/',
      },
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: canonicalUrl,
      siteName: 'MotoDigital',
      locale: locale === 'de' ? 'de_DE' : 'en_US',
      type: 'website',
      images: [image],
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.title,
      description: meta.description,
      images: [image],
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
