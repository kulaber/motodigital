import type { Metadata } from 'next'
import { Suspense } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { SearchInterface } from '@/components/search/SearchInterface'

export const metadata: Metadata = {
  title: 'Suche — MotoDigital',
  description: 'Finde Custom Bikes, Werkstätten und Rider auf MotoDigital.',
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tab?: string }>
}) {
  const { q, tab } = await searchParams
  const query = (q ?? '').trim()
  const activeTab = (tab ?? 'all') as 'all' | 'bikes' | 'workshops' | 'riders'

  return (
    <div className="min-h-screen bg-white text-[#222222]">
      <Header />

      <Suspense fallback={<SearchSkeleton />}>
        <SearchInterface initialQuery={query} initialTab={activeTab} />
      </Suspense>

      <Footer />
    </div>
  )
}

function SearchSkeleton() {
  return (
    <section className="pt-6 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-5 lg:px-8 animate-pulse">
        <div className="h-12 bg-[#222222]/5 rounded-xl mb-4" />
        <div className="flex gap-2 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-8 w-24 bg-[#222222]/4 rounded-full" />
          ))}
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-[#222222]/4 rounded-2xl mb-3" />
        ))}
      </div>
    </section>
  )
}
