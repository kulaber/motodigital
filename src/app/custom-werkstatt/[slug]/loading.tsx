import Header from '@/components/layout/Header'

export default function BuilderDetailLoading() {
  return (
    <div className="min-h-screen bg-white text-[#222222]">
      <Header />
      <div className="max-w-5xl mx-auto px-4 sm:px-5 lg:px-8 py-8">
        {/* Hero image skeleton */}
        <div className="aspect-[21/9] w-full bg-[#F0F0F0] animate-pulse rounded-2xl mb-6" />
        {/* Name + location */}
        <div className="space-y-3 mb-8">
          <div className="h-7 w-1/3 bg-[#F0F0F0] animate-pulse rounded" />
          <div className="h-4 w-1/5 bg-[#F0F0F0] animate-pulse rounded" />
          <div className="h-3 w-2/3 bg-[#F0F0F0] animate-pulse rounded" />
          <div className="h-3 w-1/2 bg-[#F0F0F0] animate-pulse rounded" />
        </div>
        {/* Gallery grid skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="aspect-square bg-[#F0F0F0] animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  )
}
