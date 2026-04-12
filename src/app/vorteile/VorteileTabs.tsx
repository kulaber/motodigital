'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { CheckCircle, ArrowRight, X as XIcon, Crown, Loader2 } from 'lucide-react'

type Tab = 'werkstatt' | 'rider'

const TAB_CONTENT: Record<Tab, {
  image: string
  tag: string
  heading: string
  description: string
  usps: string[]
  cta?: { label: string; href: string }
}> = {
  werkstatt: {
    image: '/custom-werkstatt.png',
    tag: 'Für Custom-Werkstätten',
    heading: 'Deine Werkstatt.\nSichtbar für die richtigen Kunden.',
    description:
      'MotoDigital ist die erste digitale Anlaufstelle für Custom-Werkstätten in Europa. Kein Algorithmus, kein Pay-to-Win — nur echte Sichtbarkeit bei Menschen, die Custom Bikes wirklich wollen.',
    usps: [
      'Profilseite mit Galerie, Fotos & Videos',
      'Werde auf der interaktiven Karte gefunden',
      'Zeig deine Builds als Referenz',
      'Direkter Kontakt mit Kunden',
      'Verifiziertes Profil für mehr Vertrauen',
    ],
  },
  rider: {
    image: '/rider.png',
    tag: 'Für Rider',
    heading: 'Werde Teil der\nCustom-Bike Community.',
    description:
      'Als Rider auf MotoDigital kannst du dein eigenes Bike präsentieren oder verkaufen, Werkstätten entdecken, Rider in der Nähe finden, die das gleiche Mindset haben wie du. Erlebe die wirkliche Custom Motorcycle Culture.',
    usps: [
      'Eigenes Rider-Profil mit deinem Bike',
      'Fahrten in der Nähe finden durch Map',
      'Custom Bikes verkaufen',
      'Custom-Werkstätten in deiner Nähe',
      'Inspiration durch Builds & Magazin',
      'Events in der Community entdecken',
      'Direkter Draht zu Werkstätten & Ridern',
    ],
    cta: { label: 'Kostenlos als Rider registrieren', href: '/auth/register?role=rider' },
  },
}

function TabsInner({ initialTab }: { initialTab: Tab }) {
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
      // Not logged in or no workshop profile → redirect to registration
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

  const content = TAB_CONTENT[activeTab]

  return (
    <section className="pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-8">

        {/* Tab bar */}
        <div className="flex gap-1 p-1 bg-[#F7F7F7] rounded-full w-fit mx-auto mb-16">
          <button
            onClick={() => switchTab('werkstatt')}
            className={`rounded-full px-5 sm:px-6 py-2.5 text-sm font-medium transition-all duration-200 ${
              activeTab === 'werkstatt'
                ? 'bg-white text-[#222222] font-semibold shadow-sm'
                : 'text-[#717171] hover:text-[#222222]'
            }`}
          >
            Für Custom Werkstätten
          </button>
          <button
            onClick={() => switchTab('rider')}
            className={`rounded-full px-5 sm:px-6 py-2.5 text-sm font-medium transition-all duration-200 ${
              activeTab === 'rider'
                ? 'bg-white text-[#222222] font-semibold shadow-sm'
                : 'text-[#717171] hover:text-[#222222]'
            }`}
          >
            Für Rider
          </button>
        </div>

        {/* Tab content */}
        <div className="flex flex-col lg:flex-row items-center gap-16">

          {/* Image */}
          <div className="flex-shrink-0 w-full lg:w-[44%] flex items-center justify-center">
            <Image
              src={content.image}
              alt={content.tag}
              width={576}
              height={400}
              className="w-full max-w-xl object-contain drop-shadow-sm"
            />
          </div>

          {/* Content */}
          <div className="flex-1">
            <span
              className="inline-block text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-5"
              style={{ background: '#06a5a518', color: '#06a5a5' }}
            >
              {content.tag}
            </span>

            <h2 className="text-3xl sm:text-4xl font-black text-[#222222] leading-tight mb-5 whitespace-pre-line">
              {content.heading}
            </h2>

            <p className="text-sm text-[#717171] leading-relaxed mb-8 max-w-md">
              {content.description}
            </p>

            <ul className="flex flex-col gap-2.5 mb-10">
              {content.usps.map((usp) => (
                <li key={usp} className="flex items-start gap-3">
                  <CheckCircle size={15} className="flex-shrink-0 mt-0.5 text-[#06a5a5]" />
                  <span className="text-sm text-[#222222]/65">{usp}</span>
                </li>
              ))}
            </ul>

            {content.cta && (
              <Link
                href={content.cta.href}
                className="inline-flex items-center gap-2 text-sm font-semibold px-6 py-3 rounded-full transition-all hover:gap-3 bg-[#06a5a5] text-white"
              >
                {content.cta.label}
                <ArrowRight size={14} />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Pricing section — only visible on werkstatt tab */}
      {activeTab === 'werkstatt' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-8 mt-24">
          <div className="text-center mb-14">
            <span
              className="inline-block text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-5"
              style={{ background: '#06a5a518', color: '#06a5a5' }}
            >
              Preise
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#222222] leading-tight">
              Wähle deinen Plan.
            </h2>
            <p className="text-sm text-[#717171] mt-3 max-w-md mx-auto leading-relaxed">
              Starte kostenlos und upgrade, wenn du bereit bist.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto items-stretch">

            {/* FREE Card */}
            <div className="rounded-3xl border border-[#222222]/8 bg-white p-7 sm:p-8 flex flex-col shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#222222]/30 mb-3">Basis</p>
              <h3 className="text-2xl font-black text-[#222222] mb-1">FREE</h3>
              <p className="text-3xl font-black text-[#222222] mb-1">€0<span className="text-base font-semibold text-[#222222]/30">/Monat</span></p>
              <p className="text-sm text-[#222222]/40 mb-8">Für den Einstieg — dauerhaft kostenlos</p>

              <div className="h-px bg-[#222222]/6 mb-6" />

              <ul className="flex flex-col gap-3 mb-10 flex-1">
                {[
                  { ok: true,  text: 'Öffentliches Werkstattprofil' },
                  { ok: true,  text: '1 Custom Bike Upload' },
                  { ok: false, text: 'Kein Logo & Titelbild' },
                  { ok: false, text: 'Keine Galerie' },
                  { ok: false, text: 'Keine Prio-Listung in der Suche' },
                  { ok: false, text: 'Kein Dashboard mit Statistiken' },
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
                Kostenlos starten
              </Link>
            </div>

            {/* FOUNDING PARTNER Card */}
            <div className="rounded-3xl border-2 border-[#06a5a5]/25 bg-gradient-to-b from-[#06a5a5]/[0.04] to-white p-7 sm:p-8 flex flex-col shadow-sm relative overflow-hidden">
              {/* Glow */}
              <div className="absolute inset-0 pointer-events-none rounded-3xl" style={{
                background: 'radial-gradient(ellipse at 50% 0%, rgba(6,165,165,0.06) 0%, transparent 60%)',
              }} />

              <div className="relative z-10 flex flex-col flex-1">
                {/* TODO: Pull founding_partner_count dynamically and compute remaining slots */}
                <span className="self-start text-[10px] font-bold uppercase tracking-widest bg-[#06a5a5]/10 text-[#06a5a5] px-2.5 py-1 rounded-full mb-3">
                  Nur noch 10 von 10 Plätzen frei
                </span>

                <div className="flex items-center gap-2 mb-1">
                  <Crown size={18} className="text-[#06a5a5]" />
                  <h3 className="text-2xl font-black text-[#222222]">FOUNDING PARTNER</h3>
                </div>
                <p className="text-3xl font-black text-[#222222] mb-1">€39<span className="text-base font-semibold text-[#222222]/30">/Monat</span></p>
                <p className="text-sm text-[#222222]/40 mb-8">Für die ersten 10 Werkstätten · €39/Mo für 12 Monate, danach €79/Mo</p>

                <div className="h-px bg-[#06a5a5]/10 mb-6" />

                <ul className="flex flex-col gap-3 mb-10 flex-1">
                  {[
                    'Logo & Titelbild',
                    'Galerie (bis zu 20 Fotos)',
                    'Bis zu 10 Custom Bike Uploads',
                    'Prio-Listung in der Suche',
                    'Founding Partner Badge',
                    'Dashboard mit Besucherstatistiken',
                    'Alle zukünftigen PRO-Features inklusive',
                  ].map((text) => (
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
                      Weiterleitung...
                    </>
                  ) : (
                    'Founding Partner werden'
                  )}
                </button>
              </div>
            </div>
          </div>

          <p className="text-center text-xs text-[#222222]/30 mt-8 max-w-lg mx-auto leading-relaxed">
            Nach Ablauf der 12 Monate wechselt der Plan automatisch auf PRO (€79/Monat). Jederzeit kündbar.
          </p>
        </div>
      )}
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
