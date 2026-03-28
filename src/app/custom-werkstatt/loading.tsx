import Header from '@/components/layout/Header'

function BuilderCardSkeleton() {
  return (
    <div className="rounded-2xl border border-[#222222]/6 overflow-hidden bg-white">
      {/* Image area */}
      <div className="aspect-[4/3] bg-[#F0F0F0] animate-pulse" />
      {/* Info area */}
      <div className="p-4 animate-pulse">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-[#EBEBEB] flex-shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3.5 w-2/3 rounded bg-[#EBEBEB]" />
            <div className="h-3 w-1/3 rounded bg-[#F0F0F0]" />
          </div>
        </div>
        <div className="flex gap-1.5">
          <div className="h-5 w-16 rounded-full bg-[#F0F0F0]" />
          <div className="h-5 w-20 rounded-full bg-[#F0F0F0]" />
        </div>
      </div>
    </div>
  )
}

export default function BuilderListLoading() {
  return (
    <div className="min-h-screen bg-white text-[#222222]">
      <Header activePage="custom-werkstatt" />

      <div className="pt-6 pb-4 px-4 sm:px-5 lg:hidden">
        <h1 className="text-xl font-bold text-[#222222] text-center">Custom Werkstatt</h1>
      </div>

      {/* Filter bar skeleton */}
      <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-md border-b border-[#222222]/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-8 py-3">
          <div className="flex items-center gap-2">
            <div className="h-[30px] w-[70px] rounded-full border border-[#DDDDDD] bg-white animate-pulse" />
            <div className="h-[30px] w-[90px] rounded-full border border-[#DDDDDD] bg-white animate-pulse" />
            <div className="flex-1" />
            <div className="h-[30px] w-[30px] rounded-full border border-[#DDDDDD] bg-white animate-pulse" />
            <div className="h-[30px] w-[30px] rounded-full border border-[#DDDDDD] bg-white animate-pulse" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-8 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <BuilderCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}
