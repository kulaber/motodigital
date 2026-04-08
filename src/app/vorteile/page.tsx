import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import VorteileTabs from './VorteileTabs'

export const metadata: Metadata = {
  title: 'Vorteile — MotoDigital',
  description: 'Die Vorteile von MotoDigital für Custom-Werkstätten und Rider.',
}

export default async function VorteilePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const { tab } = await searchParams
  const initialTab = tab === 'rider' ? 'rider' : 'werkstatt'

  return (
    <div className="min-h-screen bg-white text-[#222222]">
      <Header />

      {/* Hero */}
      <section className="bg-white pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-8 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-[#06a5a5] mb-4">
            Vorteile
          </p>
          <h1
            className="font-bold text-[#222222] leading-tight mb-4"
            style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}
          >
            Was MotoDigital dir bietet.
          </h1>
          <p className="text-sm text-[#717171] max-w-md mx-auto leading-relaxed">
            Ob Custom Werkstatt oder Rider — entdecke, was MotoDigital für dich bereithält.
          </p>
        </div>
      </section>

      <VorteileTabs initialTab={initialTab} />

      <Footer />
    </div>
  )
}
