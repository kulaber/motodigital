import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { Megaphone, Handshake } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { createClient } from '@/lib/supabase/server'
import FoundingPartnerCTA from './FoundingPartnerCTA'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Partner')
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  }
}

export default async function PartnerPage() {
  const t = await getTranslations('Partner')

  const SECONDARY_CARDS = [
    {
      icon: <Megaphone size={24} className="text-[#06a5a5]" />,
      title: t('adsTitle'),
      text: t('cards.ads.body'),
      cta: t('adsCta'),
      href: `mailto:info@motodigital.de?subject=${encodeURIComponent(t('mailSubjects.ads'))}`,
    },
    {
      icon: <Handshake size={24} className="text-[#06a5a5]" />,
      title: t('coopTitle'),
      text: t('cards.coop.body'),
      cta: t('coopCta'),
      href: `mailto:info@motodigital.de?subject=${encodeURIComponent(t('mailSubjects.coop'))}`,
    },
  ]

  const supabase = await createClient()

  // Count current founding partners
  const { count } = await (supabase.from('workshops') as any)
    .select('id', { count: 'exact', head: true })
    .eq('subscription_tier', 'founding_partner')

  const slotsLeft = 10 - (count ?? 0)

  return (
    <>
      <Header />

      {/* Hero */}
      <section className="bg-[#222222] overflow-hidden relative">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 55%, rgba(6,165,165,0.07) 0%, transparent 70%)' }}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-8 py-24 relative z-10">
          <p className="text-xs font-bold uppercase tracking-widest text-[#06a5a5] mb-5">
            {t('kicker')}
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight mb-6 max-w-3xl">
            {t('heading')}
          </h1>
          <p className="text-base text-white/40 max-w-lg leading-relaxed">
            {t('heroSubtitle')}
          </p>
        </div>
      </section>

      {/* Founding Partner Card */}
      <section className="bg-[#111111] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Main CTA — Founding Partner */}
            <FoundingPartnerCTA slotsLeft={slotsLeft} />

            {/* Secondary cards */}
            {SECONDARY_CARDS.map((card) => (
              <div key={card.title} className="border border-white/8 rounded-2xl p-6 flex flex-col bg-white/[0.03]">
                <div className="w-11 h-11 rounded-xl bg-[#06a5a5]/10 border border-white/8 flex items-center justify-center mb-4">
                  {card.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{card.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed mb-6 flex-1">{card.text}</p>
                <a
                  href={card.href}
                  className="inline-flex items-center justify-center border border-[#06a5a5] text-[#06a5a5] text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-[#06a5a5]/10 transition-colors"
                >
                  {card.cta}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact block */}
      <section className="bg-[#222222] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-8 py-16 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-[#06a5a5] mb-4">
            {t('contactKicker')}
          </p>
          <p className="text-base text-white/40 leading-relaxed">
            {t('contact.intro')}{' '}
            <a href="mailto:info@motodigital.de" className="text-[#06a5a5] font-semibold hover:text-[#058f8f] transition-colors">
              info@motodigital.de
            </a>
            {' '}{t('contact.outro')}
          </p>
        </div>
      </section>

      <Footer />
    </>
  )
}
