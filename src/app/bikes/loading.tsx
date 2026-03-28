import Header from '@/components/layout/Header'

function CardSkeleton() {
  return (
    <div className="rounded-xl sm:rounded-2xl overflow-hidden bg-white border border-[#222222]/6">
      <div className="relative aspect-[4/3] bg-[#F0F0F0] animate-pulse" />
      <div className="p-3 sm:p-4 space-y-1.5 animate-pulse">
        <div className="h-3.5 w-3/4 rounded bg-[#EBEBEB]" />
        <div className="h-3 w-1/2 rounded bg-[#EBEBEB]" />
        <div className="h-2.5 w-1/3 rounded bg-[#F0F0F0]" />
      </div>
    </div>
  )
}

export default function BikesLoading() {
  return (
    <div className="min-h-screen bg-white text-[#222222] overflow-x-clip" style={{ fontFamily: 'var(--font-sans)' }}>
      <Header activePage="bikes" />

      <div className="pt-6 pb-4 px-4 sm:px-5 lg:hidden">
        <h1 className="text-xl font-bold text-[#222222] text-center">Custom Bikes</h1>
      </div>

      {/* Filter bar skeleton — matches sticky filter bar */}
      <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-md border-b border-[#222222]/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-8 py-3">
          <div className="flex items-center gap-2">
            <div className="h-[30px] w-[52px] rounded-full border border-[#DDDDDD] bg-white animate-pulse" />
            <div className="h-[30px] w-[60px] rounded-full border border-[#DDDDDD] bg-white animate-pulse" />
            <div className="h-[30px] w-[80px] rounded-full border border-[#DDDDDD] bg-white animate-pulse" />
            <div className="flex-1" />
            <div className="h-[30px] w-[30px] sm:w-[120px] rounded-full border border-[#DDDDDD] bg-white animate-pulse" />
          </div>
        </div>
      </div>

      {/* Card grid skeleton */}
      <section className="py-8 sm:py-10 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {Array.from({ length: 9 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
