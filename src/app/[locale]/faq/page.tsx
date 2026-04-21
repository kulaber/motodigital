import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import FaqAccordion, { type FaqItem } from '../support/FaqAccordion'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('FAQ')
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: { canonical: 'https://motodigital.io/faq' },
  }
}

function FaqJsonLd({ items }: { items: FaqItem[] }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

export default async function FaqPage() {
  const t = await getTranslations('FAQ')
  const tFaq = await getTranslations('FAQContent')

  const FAQ_ALLGEMEIN: FaqItem[] = [
    { question: tFaq('general.0.q'), answer: tFaq('general.0.a') },
    { question: tFaq('general.1.q'), answer: tFaq('general.1.a') },
    { question: tFaq('general.2.q'), answer: tFaq('general.2.a') },
    { question: tFaq('general.3.q'), answer: tFaq('general.3.a') },
    { question: tFaq('general.4.q'), answer: tFaq('general.4.a') },
  ]

  const FAQ_WERKSTATT: FaqItem[] = [
    { question: tFaq('workshop.0.q'), answer: tFaq('workshop.0.a') },
    { question: tFaq('workshop.1.q'), answer: tFaq('workshop.1.a') },
    { question: tFaq('workshop.2.q'), answer: tFaq('workshop.2.a') },
  ]

  const FAQ_RIDER: FaqItem[] = [
    { question: tFaq('rider.0.q'), answer: tFaq('rider.0.a') },
    { question: tFaq('rider.1.q'), answer: tFaq('rider.1.a') },
  ]

  const ALL_FAQ = [...FAQ_ALLGEMEIN, ...FAQ_WERKSTATT, ...FAQ_RIDER]

  return (
    <>
      <FaqJsonLd items={ALL_FAQ} />
      <Header />

      {/* Hero */}
      <section className="bg-[#222222] overflow-hidden relative">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 55%, rgba(6,165,165,0.07) 0%, transparent 70%)' }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-8 py-24 relative z-10">
          <p className="text-xs font-bold uppercase tracking-widest text-[#06a5a5] mb-5">
            FAQ
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight mb-6 max-w-3xl">
            {t('heading')}
          </h1>
          <p className="text-base text-white/40 max-w-lg leading-relaxed">
            {t('subheading')}
          </p>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="bg-[#111111] py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-5 lg:px-8">

          {/* Allgemein */}
          <div className="mb-12">
            <h2 className="text-lg font-bold text-white mb-6">{tFaq('generalHeading')}</h2>
            <FaqAccordion items={FAQ_ALLGEMEIN} />
          </div>

          {/* Custom Werkstatt */}
          <div className="mb-12">
            <h2 className="text-lg font-bold text-white mb-6">
              {tFaq('workshopHeading')}
            </h2>
            <FaqAccordion items={FAQ_WERKSTATT} />
          </div>

          {/* Rider */}
          <div className="mb-12">
            <h2 className="text-lg font-bold text-white mb-6">{tFaq('riderHeading')}</h2>
            <FaqAccordion items={FAQ_RIDER} />
          </div>

        </div>
      </section>

      {/* Contact block */}
      <section className="bg-[#222222] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-8 py-16 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-[#06a5a5] mb-4">
            {t('contactCta')}
          </p>
          <p className="text-base text-white/40 leading-relaxed mb-6">
            <a href="mailto:info@motodigital.de" className="text-[#06a5a5] font-semibold hover:text-[#058f8f] transition-colors">
              info@motodigital.de
            </a>
          </p>
          <a
            href="/support"
            className="inline-flex items-center gap-2 bg-[#2AABAB] text-white text-sm font-semibold px-7 py-3 rounded-full hover:bg-[#239393] transition-all"
          >
            {t('contactButton')}
          </a>
        </div>
      </section>

      <Footer />
    </>
  )
}
