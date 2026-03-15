import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import { BUILDS } from '@/lib/data/builds'
import BuildsClient from './BuildsClient'

export const metadata: Metadata = {
  title: 'Builds',
  description: 'Alle Custom Motorrad Builds auf MotoDigital — handgefertigte Unikate aus der Community.',
}

export default function BuildsPage() {
  return (
    <div className="min-h-screen bg-[#141414] text-[#F0EDE4]" style={{ fontFamily: 'var(--font-sans)' }}>
      <Header activePage="builds" />

      {/* PAGE HEADER */}
      <section className="pt-28 pb-10 bg-[#141414]">
        <div className="max-w-6xl mx-auto px-4 sm:px-5 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 animate-slide-up">
            <div>
              <p className="text-xs font-semibold text-[#2AABAB] uppercase tracking-widest mb-2">Community Builds</p>
              <h1 className="font-bold text-[#F0EDE4] leading-tight" style={{ fontSize: 'clamp(1.75rem,4vw,3rem)', letterSpacing: '-0.03em' }}>
                Handgefertigte Unikate.
              </h1>
              <p className="text-[#F0EDE4]/40 text-sm mt-2 max-w-md leading-relaxed">
                Durchstöbere alle Custom Builds — von Cafe Racern bis zum Chopper.
              </p>
            </div>
            <p className="text-xs text-[#F0EDE4]/30 flex-shrink-0">
              <span className="text-[#F0EDE4]/60 font-semibold">{BUILDS.length} Builds</span> · täglich aktualisiert
            </p>
          </div>
        </div>
      </section>

      <BuildsClient builds={BUILDS} />

      <footer className="bg-[#141414] border-t border-[#F0EDE4]/5 py-8 mt-4">
        <div className="max-w-6xl mx-auto px-4 sm:px-5 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <nav className="flex items-center gap-5 sm:gap-6">
            {['Impressum', 'Datenschutz', 'Kontakt'].map(l => (
              <Link key={l} href="#" className="text-xs text-[#F0EDE4]/25 hover:text-[#F0EDE4]/60 transition-colors">{l}</Link>
            ))}
          </nav>
          <p className="text-xs text-[#F0EDE4]/15">© 2026 MotoDigital</p>
        </div>
      </footer>
    </div>
  )
}
