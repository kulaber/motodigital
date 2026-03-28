import Header from '@/components/layout/Header'

function CardSkeleton() {
  return (
    <div>
      {/* Image — aspect-[4/3] like BuilderCardPhoto */}
      <div className="w-full aspect-[4/3] rounded-xl bg-[#F0F0F0] animate-pulse" />
      {/* Info — matches pt-2.5 pb-1 below card */}
      <div className="pt-2.5 pb-1 animate-pulse">
        <div className="h-3.5 w-3/4 rounded bg-[#EBEBEB] mb-1.5" />
        <div className="h-3 w-1/2 rounded bg-[#F0F0F0] mb-2" />
        <div className="flex gap-1">
          <div className="h-[18px] w-16 rounded-full bg-[#F7F7F7] border border-[#EBEBEB]" />
          <div className="h-[18px] w-20 rounded-full bg-[#F7F7F7] border border-[#EBEBEB]" />
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

      {/* Sticky filter bar — matches BuilderPageClient */}
      <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-md border-b border-[#222222]/5">
        <div className="flex px-4 sm:px-5 lg:px-6 py-3 items-center gap-2">
          <div className="h-[30px] w-[90px] rounded-full border border-[#DDDDDD] bg-white animate-pulse" />
          <div className="h-[30px] w-[100px] rounded-full border border-[#DDDDDD] bg-white animate-pulse" />
          <div className="h-[30px] w-[110px] rounded-full border border-[#DDDDDD] bg-white animate-pulse" />
        </div>
      </div>

      {/* Desktop: Split layout (List 50% | Map 50%) */}
      <div className="hidden lg:flex" style={{ height: 'calc(100dvh - 120px)' }}>
        {/* LEFT — list */}
        <div className="w-1/2 overflow-hidden border-r border-[#EBEBEB]">
          <div className="p-4">
            <div className="h-3 w-28 rounded bg-[#F0F0F0] mb-4 animate-pulse" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
        {/* RIGHT — map placeholder */}
        <div className="w-1/2 relative p-3">
          <div className="absolute inset-3 rounded-2xl bg-[#f0fafa] animate-pulse" />
        </div>
      </div>

      {/* Mobile: List view */}
      <div className="lg:hidden">
        <div className="p-4">
          <div className="h-3 w-28 rounded bg-[#F0F0F0] mb-4 animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
