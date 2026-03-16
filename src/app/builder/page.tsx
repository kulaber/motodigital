import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { BUILDERS } from '@/lib/data/builders'
import BuilderPageClient from './BuilderPageClient'

export const metadata: Metadata = {
  title: 'Builder Directory — Custom Motorcycle Builder finden',
  description: 'Finde verifizierte Custom Motorcycle Builder in ganz Europa auf MotoDigital.',
}

export default function BuilderPage() {
  return (
    <div className="min-h-screen bg-[#141414] text-[#F0EDE4]">
      <Header activePage="builder" />

      <BuilderPageClient builders={BUILDERS} />

      <Footer />
    </div>
  )
}
