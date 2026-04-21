import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import ContactForm from './ContactForm'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Support')
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: { canonical: 'https://motodigital.io/support' },
  }
}

export default async function SupportPage() {
  const t = await getTranslations('Support')

  const formLabels = {
    name: t('name'),
    email: t('email'),
    subject: t('subject'),
    message: t('message'),
    submit: t('submit'),
    success: t('success'),
    error: t('error'),
  }

  return (
    <>
      <Header />

      {/* Hero */}
      <section className="bg-[#222222] overflow-hidden relative">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 55%, rgba(6,165,165,0.07) 0%, transparent 70%)' }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-8 py-24 relative z-10">
          <p className="text-xs font-bold uppercase tracking-widest text-[#06a5a5] mb-5">
            Support
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight mb-6 max-w-3xl">
            {t('heading')}
          </h1>
          <p className="text-base text-white/40 max-w-lg leading-relaxed">
            {t('subheading')}{' '}
            <a href="/faq" className="text-[#06a5a5] hover:underline">
              {t('faqLink')}
            </a>
          </p>
        </div>
      </section>

      {/* Contact Form */}
      <section className="bg-[#111111] py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-5 lg:px-8">
          <h2 className="text-lg font-bold text-white mb-2">
            {t('heading')}
          </h2>
          <p className="text-sm text-white/40 mb-8">
            {t('subheading')}
          </p>
          <ContactForm labels={formLabels} />
        </div>
      </section>

      {/* Contact block */}
      <section className="bg-[#222222] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-8 py-16 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-[#06a5a5] mb-4">
            {t('faqLink')}
          </p>
          <p className="text-base text-white/40 leading-relaxed">
            <a href="mailto:info@motodigital.de" className="text-[#06a5a5] font-semibold hover:text-[#058f8f] transition-colors">
              info@motodigital.de
            </a>
          </p>
        </div>
      </section>

      <Footer />
    </>
  )
}
