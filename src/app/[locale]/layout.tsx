import type { Metadata, Viewport } from 'next'
import { Suspense } from 'react'
import { Bodoni_Moda, Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { notFound } from 'next/navigation'
import { hasLocale, NextIntlClientProvider } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { AuthProvider } from '@/contexts/AuthContext'
import MobileBottomNav from '@/components/layout/MobileBottomNav'
import WerkstattMobileNav from '@/components/layout/WerkstattMobileNav'
import CookieBanner from '@/components/layout/CookieBanner'
import ConfirmationToast from '@/components/auth/ConfirmationToast'
import PageViewTracker from '@/components/analytics/PageViewTracker'
import { SearchShortcut } from '@/components/search/SearchShortcut'
import { routing } from '@/i18n/routing'
import '../globals.css'

const bodoniModa = Bodoni_Moda({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
  weight: ['400', '700'],
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
})

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Metadata' })
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://motodigital.io'

  return {
    title: {
      default: t('defaultTitle'),
      template: '%s | MotoDigital',
    },
    description: t('defaultDescription'),
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: locale === 'de' ? '/' : `/${locale}`,
      languages: {
        de: '/',
        en: '/en',
        'x-default': '/',
      },
    },
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: '32x32' },
        { url: '/favicon.svg', type: 'image/svg+xml' },
      ],
      apple: '/apple-touch-icon.png',
    },
    manifest: '/manifest.json',
    openGraph: {
      siteName: 'MotoDigital',
      type: 'website',
      locale: locale === 'de' ? 'de_DE' : 'en_US',
      images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      images: ['/og-image.jpg'],
    },
  }
}

export const viewport: Viewport = {
  themeColor: '#2AABAB',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }
  setRequestLocale(locale)

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://motodigital.io'
  const organizationLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'MotoDigital',
    url: baseUrl,
    logo: `${baseUrl}/icon.svg`,
    description:
      'MotoDigital — Plattform für Custom Motorcycle Culture in Europa. Custom Bikes, Builder & Werkstätten an einem Ort.',
    founder: { '@type': 'Person', name: 'Joe Mel Ramos' },
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Stadtheider Straße 66',
      postalCode: '33609',
      addressLocality: 'Bielefeld',
      addressCountry: 'DE',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: 'info@motodigital.de',
      availableLanguage: ['de', 'en'],
    },
  }

  return (
    <html lang={locale} className={`${bodoniModa.variable} ${inter.variable}`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }}
        />
        <NextIntlClientProvider>
          <AuthProvider>
            {children}
            <MobileBottomNav />
            <WerkstattMobileNav />
            <Suspense fallback={null}>
              <ConfirmationToast />
            </Suspense>
            <SearchShortcut />
            <CookieBanner />
            <PageViewTracker />
            <Analytics />
            <SpeedInsights />
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
