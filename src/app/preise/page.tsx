import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { BadgeCheck, Check, X } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Preise — MotoDigital',
  description: 'Alle Features von MotoDigital im Überblick. Kostenlos für Builder & Rider.',
}

const RIDER_FEATURES = [
  'Builder-Verzeichnis durchsuchen',
  'Builder-Profile ansehen',
  'Custom Builds entdecken',
  'Magazin & Guides lesen',
  'Events entdecken',
  'Builder direkt kontaktieren',
  'Custom Bikes kaufen',
  'Builds speichern & merken',
]

const BUILDER_FREE = [
  { label: 'Öffentliches Builder-Profil', included: true },
  { label: 'Bio, Stadt & Spezialiserung', included: true },
  { label: 'Öffnungszeiten (live)', included: true },
  { label: 'Social-Media-Links', included: true },
  { label: 'Builds präsentieren', included: true },
  { label: 'Im Builder-Verzeichnis gelistet', included: true },
  { label: 'Auf der Karte sichtbar', included: true },
  { label: 'Direktanfragen von Ridern', included: true },
  { label: 'Verifiziertes Profil-Badge', included: true },
  { label: 'Custom Bikes inserieren', included: true },
  { label: 'Hervorgehobene Platzierung', included: false },
  { label: 'Analyse & Profilstatistiken', included: false },
]

const BUILDER_PRO = [
  { label: 'Öffentliches Builder-Profil', included: true },
  { label: 'Bio, Stadt & Spezialiserung', included: true },
  { label: 'Öffnungszeiten (live)', included: true },
  { label: 'Social-Media-Links', included: true },
  { label: 'Builds präsentieren', included: true },
  { label: 'Im Builder-Verzeichnis gelistet', included: true },
  { label: 'Auf der Karte sichtbar', included: true },
  { label: 'Direktanfragen von Ridern', included: true },
  { label: 'Verifiziertes Profil-Badge', included: true },
  { label: 'Custom Bikes inserieren', included: true },
  { label: 'Hervorgehobene Platzierung', included: true },
  { label: 'Analyse & Profilstatistiken', included: true },
]

export default function PreisePage() {
  return (
    <div className="min-h-screen bg-[#141414] text-[#F0EDE4]">
      <Header />

      {/* Hero */}
      <section className="pt-24 pb-14 px-4 sm:px-5 lg:px-8 text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(42,171,171,0.08) 0%, transparent 65%)' }} />
        <div className="max-w-2xl mx-auto relative">
          <p className="text-xs font-semibold text-[#2AABAB] uppercase tracking-widest mb-3">Preise & Features</p>
          <h1 className="font-bold text-[#F0EDE4] leading-tight mb-4"
            style={{ fontSize: 'clamp(1.75rem, 4vw, 3rem)', letterSpacing: '-0.03em' }}>
            Einfach. Transparent.<br />
            <span className="text-[#F0EDE4]/25">Kostenlos starten.</span>
          </h1>
          <p className="text-[#F0EDE4]/45 text-base leading-relaxed">
            MotoDigital ist für Builder und Rider kostenlos. Pro-Features kommen bald.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-5 lg:px-8 pb-20">

        {/* Builder plans */}
        <div className="mb-16">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#F0EDE4]/25 mb-6 text-center">Für Builder & Workshops</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">

            {/* Free */}
            <div className="bg-[#1C1C1C] border border-[#F0EDE4]/6 rounded-2xl p-6">
              <div className="mb-6">
                <p className="text-xs font-semibold text-[#F0EDE4]/35 uppercase tracking-widest mb-1">Free</p>
                <div className="flex items-end gap-1.5">
                  <span className="text-4xl font-bold text-[#F0EDE4]">0 €</span>
                  <span className="text-sm text-[#F0EDE4]/30 mb-1.5">/ Monat</span>
                </div>
                <p className="text-xs text-[#F0EDE4]/35 mt-1">Für immer kostenlos</p>
              </div>
              <a href="/auth/register"
                className="block w-full text-center text-sm font-semibold bg-[#F0EDE4]/8 border border-[#F0EDE4]/12 text-[#F0EDE4]/70 hover:text-[#F0EDE4] hover:border-[#F0EDE4]/25 py-2.5 rounded-full transition-all mb-6">
                Jetzt registrieren
              </a>
              <ul className="flex flex-col gap-3">
                {BUILDER_FREE.map(f => (
                  <li key={f.label} className="flex items-center gap-2.5">
                    {f.included
                      ? <Check size={13} className="text-[#2AABAB] flex-shrink-0" />
                      : <X size={13} className="text-[#F0EDE4]/15 flex-shrink-0" />
                    }
                    <span className={`text-sm ${f.included ? 'text-[#F0EDE4]/60' : 'text-[#F0EDE4]/20'}`}>
                      {f.label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Pro */}
            <div className="bg-[#1C1C1C] border border-[#2AABAB]/30 rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 pointer-events-none"
                style={{ background: 'radial-gradient(circle at 100% 0%, rgba(42,171,171,0.08) 0%, transparent 65%)' }} />
              <div className="mb-6 relative">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-xs font-semibold text-[#2AABAB] uppercase tracking-widest">Pro</p>
                  <span className="text-[9px] font-bold uppercase tracking-widest bg-[#2AABAB]/15 text-[#2AABAB] border border-[#2AABAB]/25 px-2 py-0.5 rounded-full">
                    Bald verfügbar
                  </span>
                </div>
                <div className="flex items-end gap-1.5">
                  <span className="text-4xl font-bold text-[#F0EDE4]">TBD</span>
                </div>
                <p className="text-xs text-[#F0EDE4]/35 mt-1">Wird bekannt gegeben</p>
              </div>
              <button disabled
                className="block w-full text-center text-sm font-semibold bg-[#2AABAB]/20 text-[#2AABAB]/50 py-2.5 rounded-full mb-6 cursor-not-allowed">
                Demnächst verfügbar
              </button>
              <ul className="flex flex-col gap-3">
                {BUILDER_PRO.map(f => (
                  <li key={f.label} className="flex items-center gap-2.5">
                    <Check size={13} className="text-[#2AABAB] flex-shrink-0" />
                    <span className="text-sm text-[#F0EDE4]/60">{f.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Rider */}
        <div className="max-w-3xl mx-auto mb-16">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#F0EDE4]/25 mb-6 text-center">Für Rider</p>
          <div className="bg-[#1C1C1C] border border-[#F0EDE4]/6 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <div>
                <p className="text-xs font-semibold text-[#F0EDE4]/35 uppercase tracking-widest mb-1">Free</p>
                <div className="flex items-end gap-1.5">
                  <span className="text-4xl font-bold text-[#F0EDE4]">0 €</span>
                  <span className="text-sm text-[#F0EDE4]/30 mb-1.5">/ Monat</span>
                </div>
              </div>
              <a href="/auth/register"
                className="inline-flex items-center gap-2 text-sm font-semibold bg-[#F0EDE4]/8 border border-[#F0EDE4]/12 text-[#F0EDE4]/70 hover:text-[#F0EDE4] hover:border-[#F0EDE4]/25 px-5 py-2.5 rounded-full transition-all">
                Kostenlos registrieren
              </a>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {RIDER_FEATURES.map(f => (
                <div key={f} className="flex items-center gap-2.5">
                  <Check size={13} className="text-[#2AABAB] flex-shrink-0" />
                  <span className="text-sm text-[#F0EDE4]/60">{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FAQ / CTA */}
        <div className="bg-[#1C1C1C] border border-[#F0EDE4]/6 rounded-2xl p-8 text-center max-w-3xl mx-auto relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(42,171,171,0.08) 0%, transparent 70%)' }} />
          <BadgeCheck size={28} className="text-[#2AABAB] mx-auto mb-4" />
          <h2 className="text-xl font-bold text-[#F0EDE4] mb-2">Jetzt kostenlos starten</h2>
          <p className="text-sm text-[#F0EDE4]/40 leading-relaxed mb-6 max-w-md mx-auto">
            Kein Risiko, keine Kreditkarte. Registriere dich in unter 2 Minuten und zeige deine Builds der Community.
          </p>
          <a href="/auth/register"
            className="inline-flex items-center gap-2 bg-[#2AABAB] text-[#141414] text-sm font-semibold px-8 py-3 rounded-full hover:bg-[#3DBFBF] transition-all">
            Als Builder registrieren →
          </a>
        </div>

      </div>

      <Footer />
    </div>
  )
}
