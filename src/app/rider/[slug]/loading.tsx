import Header from '@/components/layout/Header'

export default function RiderLoading() {
  return (
    <div className="min-h-screen bg-white text-[#222222]">
      <Header />
      <div className="max-w-4xl mx-auto px-4 sm:px-5 lg:px-8 py-8">
        {/* Avatar + name */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 rounded-full bg-[#F0F0F0] animate-pulse" />
          <div className="space-y-2">
            <div className="h-6 w-40 bg-[#F0F0F0] animate-pulse rounded" />
            <div className="h-3 w-24 bg-[#F0F0F0] animate-pulse rounded" />
          </div>
        </div>
        {/* Bio */}
        <div className="space-y-2 mb-8">
          <div className="h-3 w-full bg-[#F0F0F0] animate-pulse rounded" />
          <div className="h-3 w-2/3 bg-[#F0F0F0] animate-pulse rounded" />
        </div>
        {/* Stats row */}
        <div className="flex gap-6 mb-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-1">
              <div className="h-6 w-8 bg-[#F0F0F0] animate-pulse rounded" />
              <div className="h-3 w-16 bg-[#F0F0F0] animate-pulse rounded" />
            </div>
          ))}
        </div>
        {/* Bikes grid skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="rounded-2xl overflow-hidden">
              <div className="aspect-[4/3] bg-[#F0F0F0] animate-pulse" />
              <div className="pt-3 space-y-2">
                <div className="h-4 w-3/4 bg-[#F0F0F0] animate-pulse rounded" />
                <div className="h-3 w-1/2 bg-[#F0F0F0] animate-pulse rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
