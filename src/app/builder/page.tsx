import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import { BUILDERS } from '@/lib/data/builders'
import BuilderPageClient from './BuilderPageClient'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Builder Directory — Custom Motorcycle Builder finden',
  description: 'Finde verifizierte Custom Motorcycle Builder in ganz Europa auf MotoDigital.',
}

export default function BuilderPage() {
  return (
    <div className="min-h-screen bg-[#141414] text-[#F0EDE4]">
      <Header activePage="builder" />

      {/* Page header */}
      <section className="pt-28 pb-8 bg-[#141414]">
        <div className="max-w-6xl mx-auto px-4 sm:px-5 lg:px-8">
          <p className="text-xs font-semibold text-[#2AABAB] uppercase tracking-widest mb-2">Builder Directory</p>
          <h1 className="font-bold text-[#F0EDE4] leading-tight" style={{ fontSize: 'clamp(1.75rem,4vw,3rem)', letterSpacing: '-0.03em' }}>
            Die Menschen<br />
            <span className="text-[#F0EDE4]/25">hinter den Bikes.</span>
          </h1>
          <p className="text-[#F0EDE4]/40 text-sm mt-3 max-w-md leading-relaxed">
            Verifizierte Builder — direkt kontaktierbar, ohne Umwege.
          </p>
        </div>
      </section>

      <BuilderPageClient builders={BUILDERS} />

      <footer className="bg-[#141414] border-t border-[#F0EDE4]/5 py-8">
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
