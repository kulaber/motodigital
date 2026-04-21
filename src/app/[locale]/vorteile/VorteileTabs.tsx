'use client'

import { useState, Suspense } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from '@/i18n/navigation'
import { useSearchParams } from 'next/navigation'
import { Link } from '@/i18n/navigation'
import { CheckCircle, ArrowRight, X as XIcon, Crown, Loader2, Bike, Map, ShoppingBag, Wrench, BookOpen, CalendarDays, MessageCircle } from 'lucide-react'

type Tab = 'werkstatt' | 'rider'

const RIDER_FEATURE_ICONS = [Bike, Map, ShoppingBag, Wrench, BookOpen, CalendarDays, MessageCircle]

function TabsInner({ initialTab }: { initialTab: Tab }) {
  const t = useTranslations('Benefits')
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentTab = (searchParams.get('tab') as Tab) || initialTab
  const [activeTab, setActiveTab] = useState<Tab>(currentTab)
  const [checkoutLoading, setCheckoutLoading] = useState(false)

  async function handleFoundingPartnerCheckout() {
    setCheckoutLoading(true)
    try {
      const res = await fetch('/api/checkout', { method: 'POST' })
      const data = await res.json()
      if (res.ok && data.url) {
        window.location.href = data.url
        return
      }
      router.push('/auth/register?role=custom-werkstatt&redirect=/partner')
    } catch {
      router.push('/auth/register?role=custom-werkstatt&redirect=/partner')
    }
    setCheckoutLoading(false)
  }

  function switchTab(tab: Tab) {
    setActiveTab(tab)
    router.replace(`/vorteile?tab=${tab}`, { scroll: false })
  }

  return (
    <section className="pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-8">

        {/* Tab bar */}
        <div className="flex gap-1 p-1 bg-[#F7F7F7] rounded-full w-fit mx-auto mb-12">
          <button
            onClick={() => switchTab('werkstatt')}
            className={`rounded-full px-5 sm:px-6 py-2.5 text-sm font-medium transition-all duration-200 ${
              activeTab === 'werkstatt'
                ? 'bg-white text-[#222222] font-semibold shadow-sm'
                : 'text-[#717171] hover:text-[#222222]'
            }`}
          >
            {t('workshopTab')}
          </button>
          <button
            onClick={() => switchTab('rider')}
            className={`rounded-full px-5 sm:px-6 py-2.5 text-sm font-medium transition-all duration-200 ${
              activeTab === 'rider'
                ? 'bg-white text-[#222222] font-semibold shadow-sm'
                : 'text-[#717171] hover:text-[#222222]'
            }`}
          >
            {t('riderTab')}
          </button>
        </div>

        {/* Werkstatt tab — Pricing cards */}
        {activeTab === 'werkstatt' && (
          <div>
            <p className="text-center text-sm text-[#717171] mb-10">
              {t('choosePlan')}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto items-stretch">

              {/* FREE Card */}
              <div className="rounded-3xl border border-[#222222]/8 bg-white p-7 sm:p-8 flex flex-col shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#222222]/30 mb-3">{t('freePlan.kicker')}</p>
                <h3 className="text-2xl font-black text-[#222222] mb-1">{t('freePlan.title')}</h3>
                <p className="text-3xl font-black text-[#222222] mb-1">{t('freePlan.price')}<span className="text-base font-semibold text-[#222222]/30">{t('perMonth')}</span></p>
                <p className="text-sm text-[#222222]/40 mb-8">{t('freePlan.desc')}</p>

                <div className="h-px bg-[#222222]/6 mb-6" />

                <ul className="flex flex-col gap-3 mb-10 flex-1">
                  {[
                    { ok: true,  text: t('freePlan.bullets.0') },
                    { ok: true,  text: t('freePlan.bullets.1') },
                    { ok: true,  text: t('freePlan.bullets.2') },
                    { ok: true,  text: t('freePlan.bullets.3') },
                    { ok: false, text: t('freePlan.bullets.4') },
                    { ok: false, text: t('freePlan.bullets.5') },
                    { ok: false, text: t('freePlan.bullets.6') },
                  ].map((item) => (
                    <li key={item.text} className="flex items-start gap-3">
                      {item.ok ? (
                        <CheckCircle size={15} className="flex-shrink-0 mt-0.5 text-[#06a5a5]" />
                      ) : (
                        <XIcon size={15} className="flex-shrink-0 mt-0.5 text-[#222222]/15" />
                      )}
                      <span className={`text-sm ${item.ok ? 'text-[#222222]/70' : 'text-[#222222]/25'}`}>{item.text}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/auth/register?role=custom-werkstatt"
                  className="w-full inline-flex items-center justify-center gap-2 text-sm font-semibold py-3.5 rounded-full border border-[#222222]/12 text-[#222222]/60 hover:text-[#222222] hover:border-[#222222]/25 transition-all"
                >
                  {t('registerWorkshop')}
                </Link>
              </div>

              {/* FOUNDING PARTNER Card */}
              <div className="rounded-3xl border-2 border-[#06a5a5] bg-[#06a5a5]/[0.03] p-7 sm:p-8 flex flex-col relative overflow-hidden shadow-md">
                {/* Glow */}
                <div className="absolute inset-0 pointer-events-none rounded-3xl" style={{
                  background: 'radial-gradient(ellipse at 50% 0%, rgba(6,165,165,0.08) 0%, transparent 60%)',
                }} />

                <div className="relative z-10 flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <Crown size={18} className="text-[#06a5a5]" />
                    <h3 className="text-2xl font-black text-[#222222]">{t('foundingPartnerPlan.title')}</h3>
                  </div>
                  <p className="text-3xl font-black text-[#222222] mb-1">{t('foundingPartnerPlan.price')}<span className="text-base font-semibold text-[#222222]/30">{t('perMonth')}</span></p>
                  <p className="text-sm text-[#222222]/40 mb-4">{t('foundingPartnerPlan.desc')}</p>

                  {/* Scarcity inside the card */}
                  {/* TODO: Pull founding_partner_count dynamically and compute remaining slots */}
                  <div className="flex items-center gap-2 bg-[#06a5a5]/10 rounded-xl px-4 py-2.5 mb-6">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#06a5a5] opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#06a5a5]" />
                    </span>
                    <span className="text-xs font-semibold text-[#06a5a5]">{t('foundingPartnerPlan.scarcity')}</span>
                  </div>

                  <div className="h-px bg-[#06a5a5]/10 mb-6" />

                  <ul className="flex flex-col gap-3 mb-10 flex-1">
                    {Array.from({ length: 8 }, (_, idx) => t(`foundingPartnerPlan.bullets.${idx}`)).map((text) => (
                      <li key={text} className="flex items-start gap-3">
                        <CheckCircle size={15} className="flex-shrink-0 mt-0.5 text-[#06a5a5]" />
                        <span className="text-sm text-[#222222]/70">{text}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={handleFoundingPartnerCheckout}
                    disabled={checkoutLoading}
                    className="w-full inline-flex items-center justify-center gap-2 text-sm font-semibold py-3.5 rounded-full bg-[#06a5a5] text-white hover:bg-[#058f8f] transition-all disabled:opacity-50"
                  >
                    {checkoutLoading ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        {t('redirecting')}
                      </>
                    ) : (
                      t('foundingPartner')
                    )}
                  </button>
                </div>
              </div>
            </div>

            <p className="text-center text-xs text-[#222222]/30 mt-8 max-w-lg mx-auto leading-relaxed">
              {t('disclaimer')}
            </p>
          </div>
        )}

        {/* Rider tab — Free statement + feature list */}
        {activeTab === 'rider' && (
          <div className="max-w-2xl mx-auto text-center">
            {/* Free badge */}
            <div className="flex justify-center mb-6">
              <span className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full bg-[#06a5a5]/10 text-[#06a5a5]">
                {t('riderBadge')}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-[#222222] leading-tight mb-3">
              {t('riderHeading')}
            </h2>
            <p className="text-sm text-[#717171] mb-10 max-w-md mx-auto leading-relaxed">
              {t('riderSubtitle')}
            </p>

            {/* Feature grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left max-w-xl mx-auto mb-10">
              {RIDER_FEATURE_ICONS.map((Icon, idx) => {
                const label = t(`riderFeatures.${idx}`)
                return (
                  <div key={label} className="flex items-center gap-3 rounded-2xl bg-[#F7F7F7] px-5 py-4">
                    <Icon size={18} className="flex-shrink-0 text-[#06a5a5]" />
                    <span className="text-sm text-[#222222]/70">{label}</span>
                  </div>
                )
              })}
            </div>

            <Link
              href="/auth/register?role=rider"
              className="inline-flex items-center gap-2 text-sm font-semibold px-8 py-3.5 rounded-full bg-[#06a5a5] text-white hover:bg-[#058f8f] transition-all hover:gap-3"
            >
              {t('registerRider')}
              <ArrowRight size={14} />
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}

export default function VorteileTabs({ initialTab }: { initialTab: 'werkstatt' | 'rider' }) {
  return (
    <Suspense>
      <TabsInner initialTab={initialTab} />
    </Suspense>
  )
}
