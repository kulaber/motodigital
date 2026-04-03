import Header from '@/components/layout/Header'

export default function WerkstattLoading() {
  return (
    <div className="min-h-screen bg-white text-[#222222]">
      <Header activePage="custom-werkstatt" />
      <div className="pt-6 pb-4 px-4 sm:px-5 lg:hidden">
        <h1 className="text-xl font-bold text-[#222222] text-center">Custom Werkstatt</h1>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-8 py-6">
        {/* Search bar skeleton */}
        <div className="h-12 w-full max-w-md mx-auto bg-[#F0F0F0] animate-pulse rounded-full mb-8" />
        {/* Builder card grid skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-2xl overflow-hidden border border-[#222222]/5">
              <div className="aspect-[16/10] bg-[#F0F0F0] animate-pulse" />
              <div className="p-4 space-y-2">
                <div className="h-4 w-2/3 bg-[#F0F0F0] animate-pulse rounded" />
                <div className="h-3 w-1/3 bg-[#F0F0F0] animate-pulse rounded" />
                <div className="flex gap-2 pt-1">
                  <div className="h-6 w-16 bg-[#F0F0F0] animate-pulse rounded-full" />
                  <div className="h-6 w-20 bg-[#F0F0F0] animate-pulse rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
