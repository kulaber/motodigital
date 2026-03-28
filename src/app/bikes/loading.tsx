import Header from '@/components/layout/Header'

function CardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[4/3] rounded-2xl bg-[#F0F0F0]" />
      <div className="mt-3 space-y-2">
        <div className="h-3.5 w-3/4 rounded bg-[#F0F0F0]" />
        <div className="h-3 w-1/2 rounded bg-[#F0F0F0]" />
      </div>
    </div>
  )
}

export default function BikesLoading() {
  return (
    <div className="min-h-screen bg-white text-[#222222]" style={{ fontFamily: 'var(--font-sans)' }}>
      <Header activePage="bikes" />

      <div className="pt-6 pb-4 px-4 sm:px-5 lg:hidden">
        <h1 className="text-xl font-bold text-[#222222] text-center">Custom Bikes</h1>
      </div>

      {/* Filter bar skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-8 pb-4">
        <div className="flex gap-2 overflow-hidden animate-pulse">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-8 w-20 rounded-full bg-[#F0F0F0] flex-shrink-0" />
          ))}
        </div>
      </div>

      {/* Card grid skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-8 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-8">
          {Array.from({ length: 9 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}
