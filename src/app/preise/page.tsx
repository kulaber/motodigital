'use client'

import { useState, useEffect, useRef } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { BadgeCheck, Check, X } from 'lucide-react'

const RIDER_ALL = [
  { label: 'Builder-Verzeichnis durchsuchen',        free: true  },
  { label: 'Builder-Profile ansehen',                free: true  },
  { label: 'Custom Bikes entdecken & kaufen',        free: true  },
  { label: 'Magazin & Guides lesen',                 free: true  },
  { label: 'Builder direkt kontaktieren',            free: true  },
  { label: 'Builds speichern & merken',              free: true  },
  { label: 'Events entdecken',                       free: true  },
  { label: 'Digitaler Custom Bike-Pass',             free: false },
  { label: 'Verifizierung & Dokumentation der Bikes',free: false },
  { label: 'Offizielles MotoDigital-Zertifikat',    free: false },
  { label: 'Mehr Sicherheit beim Kauf & Verkauf',   free: false },
  { label: 'Exklusive Community-Features',           free: false },
]

const BUILDER_FREE = [
  { label: 'Öffentliches Werkstatt-Profil', included: true },
  { label: 'Bio, Stadt & Spezialisierung', included: true },
  { label: 'Öffnungszeiten (live)', included: true },
  { label: 'Social-Media-Links', included: true },
  { label: 'Builds präsentieren', included: true },
  { label: 'Im Werkstatt-Verzeichnis gelistet', included: true },
  { label: 'Auf der Karte sichtbar', included: true },
  { label: 'Direktanfragen von Ridern', included: true },
  { label: 'Verifiziertes Profil-Badge', included: true },
  { label: 'Custom Bikes inserieren', included: true },
  { label: 'Hervorgehobene Platzierung', included: false },
  { label: 'Analyse & Profilstatistiken', included: false },
]

const BUILDER_PRO = [
  { label: 'Öffentliches Werkstatt-Profil', included: true },
  { label: 'Bio, Stadt & Spezialisierung', included: true },
  { label: 'Öffnungszeiten (live)', included: true },
  { label: 'Social-Media-Links', included: true },
  { label: 'Builds präsentieren', included: true },
  { label: 'Im Werkstatt-Verzeichnis gelistet', included: true },
  { label: 'Auf der Karte sichtbar', included: true },
  { label: 'Direktanfragen von Ridern', included: true },
  { label: 'Verifiziertes Profil-Badge', included: true },
  { label: 'Custom Bikes inserieren', included: true },
  { label: 'Hervorgehobene Platzierung', included: true },
  { label: 'Analyse & Profilstatistiken', included: true },
]

export default function PreisePage() {
  const [tab, setTab] = useState<'werkstatt' | 'rider'>('werkstatt')
  const [stuck, setStuck] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => setStuck(!entry.isIntersecting),
      { threshold: 0, rootMargin: '-64px 0px 0px 0px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div className="min-h-screen bg-white text-[#222222]">
      <Header />

      {/* Hero */}
      <section className="pt-24 pb-14 px-4 sm:px-5 lg:px-8 text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(42,171,171,0.08) 0%, transparent 65%)' }} />
        <div className="max-w-2xl mx-auto relative">
          <p className="text-xs font-semibold text-[#717171] uppercase tracking-widest mb-3">Preise & Features</p>
          <h1 className="font-bold text-[#222222] leading-tight mb-4"
            style={{ fontSize: 'clamp(1.75rem, 4vw, 3rem)', letterSpacing: '-0.03em' }}>
            Einfach. Transparent.<br />
            <span className="text-[#222222]/25">Kostenlos starten.</span>
          </h1>
          <p className="text-[#222222]/45 text-base leading-relaxed mb-8">
            MotoDigital ist für Custom Werkstätten und Rider kostenlos. Pro-Features kommen bald.
          </p>

        </div>
      </section>

      {/* Sentinel — wird beobachtet um "stuck" zu erkennen */}
      <div ref={sentinelRef} />

      {/* Sticky Toggle */}
      <div className={`sticky top-16 z-30 bg-white/90 backdrop-blur py-3 text-center transition-shadow ${stuck ? 'border-b border-[#222222]/6' : ''}`}>
        <div className="inline-flex flex-col items-center gap-1.5">
          <div className="inline-flex bg-[#F7F7F7] rounded-full p-1 gap-1">
            {([
              { key: 'werkstatt', label: 'Custom Werkstatt' },
              { key: 'rider',     label: 'Rider' },
            ] as const).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`w-44 py-2 rounded-full text-sm font-semibold transition-all ${
                  tab === key
                    ? 'bg-white text-[#222222] shadow-sm'
                    : 'text-[#222222]/40 hover:text-[#222222]/70'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <p className="text-xs text-[#222222]/35">
            {tab === 'werkstatt'
              ? 'Für Werkstätten, Umbauer und Garagen, die ihre Arbeit präsentieren möchten.'
              : 'Für Motorradfahrer, die Custom Bikes kaufen oder die richtige Werkstatt finden wollen.'
            }
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-8 pb-20">

        {/* Custom Werkstatt */}
        {tab === 'werkstatt' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto mb-16">

            {/* Free */}
            <div className="bg-white border border-[#222222]/6 rounded-2xl p-6">
              <div className="mb-6">
                <p className="text-xs font-semibold text-[#222222]/35 uppercase tracking-widest mb-1">Free</p>
                <div className="flex items-end gap-1.5">
                  <span className="text-4xl font-bold text-[#222222]">0 €</span>
                  <span className="text-sm text-[#222222]/30 mb-1.5">/ Monat</span>
                </div>
                <p className="text-xs text-[#222222]/35 mt-1">Für immer kostenlos</p>
              </div>
              <a href="/auth/register"
                className="block w-full text-center text-sm font-semibold bg-[#06a5a5] text-white hover:bg-[#058f8f] py-2.5 rounded-full transition-all mb-6">
                Jetzt registrieren
              </a>
              <ul className="flex flex-col gap-3">
                {BUILDER_FREE.map(f => (
                  <li key={f.label} className="flex items-center gap-2.5">
                    {f.included
                      ? <Check size={13} className="text-[#717171] flex-shrink-0" />
                      : <X size={13} className="text-[#222222]/15 flex-shrink-0" />
                    }
                    <span className={`text-sm ${f.included ? 'text-[#222222]/60' : 'text-[#222222]/20'}`}>
                      {f.label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Pro */}
            <div className="bg-white border border-[#DDDDDD]/30 rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 pointer-events-none"
                style={{ background: 'radial-gradient(circle at 100% 0%, rgba(42,171,171,0.08) 0%, transparent 65%)' }} />
              <div className="mb-6 relative">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-xs font-semibold text-[#717171] uppercase tracking-widest">Pro</p>
                  <span className="text-[9px] font-bold uppercase tracking-widest bg-[#222222]/10 text-[#717171] border border-[#DDDDDD]/25 px-2 py-0.5 rounded-full">
                    Bald verfügbar
                  </span>
                </div>
                <div className="flex items-end gap-1.5">
                  <span className="text-4xl font-bold text-[#222222]">TBD</span>
                </div>
                <p className="text-xs text-[#222222]/35 mt-1">Wird bekannt gegeben</p>
              </div>
              <button disabled
                className="block w-full text-center text-sm font-semibold bg-[#222222]/20 text-[#717171]/50 py-2.5 rounded-full mb-6 cursor-not-allowed">
                Demnächst verfügbar
              </button>
              <ul className="flex flex-col gap-3">
                {BUILDER_PRO.map(f => (
                  <li key={f.label} className="flex items-center gap-2.5">
                    <Check size={13} className="text-[#717171] flex-shrink-0" />
                    <span className="text-sm text-[#222222]/60">{f.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Rider */}
        {tab === 'rider' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto mb-16">

            {/* Free */}
            <div className="bg-white border border-[#222222]/6 rounded-2xl p-6">
              <div className="mb-6">
                <p className="text-xs font-semibold text-[#222222]/35 uppercase tracking-widest mb-1">Free</p>
                <div className="flex items-end gap-1.5">
                  <span className="text-4xl font-bold text-[#222222]">0 €</span>
                  <span className="text-sm text-[#222222]/30 mb-1.5">/ Monat</span>
                </div>
                <p className="text-xs text-[#222222]/35 mt-1">Für immer kostenlos</p>
              </div>
              <a href="/auth/register"
                className="block w-full text-center text-sm font-semibold bg-[#06a5a5] text-white hover:bg-[#058f8f] py-2.5 rounded-full transition-all mb-6">
                Kostenlos registrieren
              </a>
              <ul className="flex flex-col gap-3">
                {RIDER_ALL.map(f => (
                  <li key={f.label} className="flex items-center gap-2.5">
                    {f.free
                      ? <Check size={13} className="text-[#717171] flex-shrink-0" />
                      : <X size={13} className="text-[#222222]/15 flex-shrink-0" />
                    }
                    <span className={`text-sm ${f.free ? 'text-[#222222]/60' : 'text-[#222222]/20'}`}>{f.label}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Pro */}
            <div className="bg-white border border-[#DDDDDD]/30 rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 pointer-events-none"
                style={{ background: 'radial-gradient(circle at 100% 0%, rgba(42,171,171,0.08) 0%, transparent 65%)' }} />
              <div className="mb-6 relative">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-xs font-semibold text-[#717171] uppercase tracking-widest">Pro</p>
                  <span className="text-[9px] font-bold uppercase tracking-widest bg-[#222222]/10 text-[#717171] border border-[#DDDDDD]/25 px-2 py-0.5 rounded-full">
                    Bald verfügbar
                  </span>
                </div>
                <div className="flex items-end gap-1.5">
                  <span className="text-4xl font-bold text-[#222222]">TBD</span>
                </div>
                <p className="text-xs text-[#222222]/35 mt-1">Wird bekannt gegeben</p>
              </div>
              <button disabled
                className="block w-full text-center text-sm font-semibold bg-[#222222]/20 text-[#717171]/50 py-2.5 rounded-full mb-6 cursor-not-allowed">
                Demnächst verfügbar
              </button>
              <ul className="flex flex-col gap-3">
                {RIDER_ALL.map(f => (
                  <li key={f.label} className="flex items-center gap-2.5">
                    <Check size={13} className="text-[#717171] flex-shrink-0" />
                    <span className="text-sm text-[#222222]/60">{f.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="bg-white border border-[#222222]/6 rounded-2xl p-8 text-center max-w-3xl mx-auto relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(42,171,171,0.08) 0%, transparent 70%)' }} />
          <BadgeCheck size={28} className="text-[#717171] mx-auto mb-4" />
          <h2 className="text-xl font-bold text-[#222222] mb-2">Jetzt kostenlos starten</h2>
          <p className="text-sm text-[#222222]/40 leading-relaxed mb-6 max-w-md mx-auto">
            Kein Risiko, keine Kreditkarte. Registriere dich in unter 2 Minuten.
          </p>
          <a href="/auth/register"
            className="inline-flex items-center gap-2 bg-[#06a5a5] text-white text-sm font-semibold px-8 py-3 rounded-full hover:bg-[#058f8f] transition-all">
            {tab === 'werkstatt' ? 'Als Custom Werkstatt registrieren →' : 'Als Rider registrieren →'}
          </a>
        </div>

      </div>

      <Footer />
    </div>
  )
}
