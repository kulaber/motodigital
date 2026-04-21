import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import VorteileTabs from './VorteileTabs'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Benefits')
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  }
}

export default async function VorteilePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const { tab } = await searchParams
  const initialTab = tab === 'rider' ? 'rider' : 'werkstatt'
  const t = await getTranslations('Benefits')

  return (
    <div className="min-h-screen bg-white text-[#222222]">
      <Header />

      {/* Hero */}
      <section className="bg-white pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-8 text-center">
          <h1
            className="font-bold text-[#222222] leading-tight mb-4"
            style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}
          >
            {t('heading')}
          </h1>
          <p className="text-sm text-[#717171] max-w-md mx-auto leading-relaxed">
            {t('heroSubtitle')}
          </p>
        </div>
      </section>

      <VorteileTabs initialTab={initialTab} />

      <Footer />
    </div>
  )
}
