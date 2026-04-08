'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { CheckCircle, ArrowRight } from 'lucide-react'

type Tab = 'werkstatt' | 'rider'

const TAB_CONTENT: Record<Tab, {
  image: string
  tag: string
  heading: string
  description: string
  usps: string[]
  cta: { label: string; href: string }
}> = {
  werkstatt: {
    image: '/custom-werkstatt.png',
    tag: 'Für Custom-Werkstätten',
    heading: 'Deine Werkstatt.\nSichtbar für die richtigen Kunden.',
    description:
      'MotoDigital ist die erste digitale Anlaufstelle für Custom-Werkstätten in Europa. Kein Algorithmus, kein Pay-to-Win — nur echte Sichtbarkeit bei Menschen, die Custom Bikes wirklich wollen.',
    usps: [
      'Kostenlose Profilseite mit Galerie, Fotos & Videos',
      'Werde auf der interaktiven Karte gefunden',
      'Zeig deine Builds als Referenz',
      'Direkter Kontakt mit Kunden',
      'Verifiziertes Profil für mehr Vertrauen',
    ],
    cta: { label: 'Als Werkstatt registrieren', href: '/auth/register?role=custom-werkstatt' },
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
    cta: { label: 'Als Rider registrieren', href: '/auth/register?role=rider' },
  },
}

function TabsInner({ initialTab }: { initialTab: Tab }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentTab = (searchParams.get('tab') as Tab) || initialTab
  const [activeTab, setActiveTab] = useState<Tab>(currentTab)

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

            <Link
              href={content.cta.href}
              className="inline-flex items-center gap-2 text-sm font-semibold px-6 py-3 rounded-full transition-all hover:gap-3 bg-[#06a5a5] text-white"
            >
              {content.cta.label}
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
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
