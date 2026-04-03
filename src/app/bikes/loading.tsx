import Header from '@/components/layout/Header'

export default function BikesLoading() {
  return (
    <div className="min-h-screen bg-white text-[#222222]">
      <Header activePage="bikes" />
      <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-8 py-8">
        {/* Filter bar skeleton */}
        <div className="flex gap-3 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-10 w-24 rounded-full bg-[#F0F0F0] animate-pulse" />
          ))}
        </div>
        {/* Card grid skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-2xl overflow-hidden">
              <div className="aspect-[4/3] bg-[#F0F0F0] animate-pulse" />
              <div className="pt-3 space-y-2">
                <div className="h-4 w-3/4 bg-[#F0F0F0] animate-pulse rounded" />
                <div className="h-3 w-1/2 bg-[#F0F0F0] animate-pulse rounded" />
                <div className="h-5 w-1/3 bg-[#F0F0F0] animate-pulse rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
