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
