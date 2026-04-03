import Header from '@/components/layout/Header'

export default function BikeDetailLoading() {
  return (
    <div className="min-h-screen bg-white text-[#222222]">
      <Header />
      <div className="max-w-5xl mx-auto px-4 sm:px-5 lg:px-8 py-8">
        {/* Main image skeleton */}
        <div className="aspect-[16/10] w-full bg-[#F0F0F0] animate-pulse rounded-2xl mb-6" />
        {/* Title + price */}
        <div className="space-y-3 mb-6">
          <div className="h-7 w-2/3 bg-[#F0F0F0] animate-pulse rounded" />
          <div className="h-5 w-1/4 bg-[#F0F0F0] animate-pulse rounded" />
          <div className="h-4 w-1/6 bg-[#F0F0F0] animate-pulse rounded" />
        </div>
        {/* Description lines */}
        <div className="space-y-2 mb-8">
          <div className="h-3 w-full bg-[#F0F0F0] animate-pulse rounded" />
          <div className="h-3 w-full bg-[#F0F0F0] animate-pulse rounded" />
          <div className="h-3 w-3/4 bg-[#F0F0F0] animate-pulse rounded" />
        </div>
        {/* Thumbnail row */}
        <div className="flex gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="w-20 h-20 bg-[#F0F0F0] animate-pulse rounded-xl flex-shrink-0" />
          ))}
        </div>
      </div>
    </div>
  )
}
