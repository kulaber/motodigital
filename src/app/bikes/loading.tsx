import Header from '@/components/layout/Header'

export default function BikesLoading() {
  return (
    <div className="min-h-screen bg-white text-[#222222]">
      <Header activePage="bikes" />

      {/* Mobile title */}
      <div className="pt-6 pb-4 px-4 sm:px-5 lg:hidden">
        <h1 className="text-xl font-bold text-[#222222] text-center">Custom Bikes</h1>
      </div>

      {/* ── Sticky filter bar ── */}
      <div className="sticky top-12 lg:top-16 z-30 bg-white/95 backdrop-blur-md border-b border-[#222222]/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-8 py-3">
          <div className="flex items-center gap-2">
            {/* Mobile: Filter button */}
            <div className="lg:hidden h-8 w-20 bg-[#F0F0F0] animate-pulse rounded-full flex-shrink-0" />
            <div className="flex-1 lg:hidden" />
            {/* Search */}
            <div className="h-8 w-32 bg-[#F0F0F0] animate-pulse rounded-full flex-shrink-0" />
            {/* Desktop filters */}
            <div className="hidden lg:block h-8 w-20 bg-[#F0F0F0] animate-pulse rounded-full flex-shrink-0" />
            <div className="hidden lg:block h-8 w-24 bg-[#F0F0F0] animate-pulse rounded-full flex-shrink-0" />
            <div className="hidden lg:block h-8 w-20 bg-[#F0F0F0] animate-pulse rounded-full flex-shrink-0" />
            <div className="hidden lg:block flex-1" />
            <div className="hidden lg:block h-8 w-28 bg-[#F0F0F0] animate-pulse rounded-full flex-shrink-0" />
          </div>
        </div>
      </div>

      {/* ── Card grid ── */}
      <section className="py-8 sm:py-10 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-xl sm:rounded-2xl overflow-hidden bg-white border border-[#222222]/6">
                <div className="relative aspect-[4/3] bg-[#F0F0F0] animate-pulse">
                  {/* Style badge */}
                  <div className="absolute top-2 left-2 h-5 w-16 bg-white/60 animate-pulse rounded-full" />
                </div>
                <div className="p-3 sm:p-4">
                  <div className="h-4 w-3/4 bg-[#F0F0F0] animate-pulse rounded mb-1.5" />
                  <div className="h-3 w-full bg-[#F0F0F0] animate-pulse rounded mb-1" />
                  <div className="h-3 w-1/3 bg-[#F0F0F0] animate-pulse rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
