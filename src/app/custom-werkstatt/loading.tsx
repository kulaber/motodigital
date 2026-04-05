import Header from '@/components/layout/Header'

function CardSkeleton() {
  return (
    <div>
      <div className="aspect-[4/3] rounded-xl bg-[#F0F0F0] animate-pulse" />
      <div className="pt-2.5 pb-1">
        <div className="h-4 w-2/3 bg-[#F0F0F0] animate-pulse rounded mb-1" />
        <div className="h-3 w-4/5 bg-[#F0F0F0] animate-pulse rounded mb-1" />
        <div className="flex gap-1 mt-1.5">
          <div className="h-4 w-20 bg-[#F0F0F0] animate-pulse rounded-full" />
        </div>
      </div>
    </div>
  )
}

export default function WerkstattLoading() {
  return (
    <div className="min-h-screen bg-white text-[#222222]">
      <Header activePage="custom-werkstatt" />

      {/* Mobile title */}
      <div className="pt-6 pb-4 px-4 sm:px-5 lg:hidden">
        <h1 className="text-xl font-bold text-[#222222] text-center">Custom Werkstatt</h1>
      </div>

      {/* ── Sticky filter bar ── */}
      <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-md border-b border-[#222222]/5">
        <div className="flex px-4 sm:px-5 lg:px-6 py-3 items-center gap-2 overflow-x-auto">
          {/* Mobile: Filter button */}
          <div className="lg:hidden h-8 w-20 bg-[#F0F0F0] animate-pulse rounded-full flex-shrink-0" />
          <div className="flex-1 lg:hidden" />
          {/* Search */}
          <div className="h-8 w-32 bg-[#F0F0F0] animate-pulse rounded-full flex-shrink-0" />
          {/* Desktop: Umbaustil */}
          <div className="hidden lg:block h-8 w-24 bg-[#F0F0F0] animate-pulse rounded-full flex-shrink-0" />
          {/* Desktop: Leistungen */}
          <div className="hidden lg:block h-8 w-24 bg-[#F0F0F0] animate-pulse rounded-full flex-shrink-0" />
          {/* Desktop: Jetzt geöffnet */}
          <div className="hidden lg:flex h-8 items-center gap-1.5 px-3.5 rounded-full border border-[#d4d4d4] flex-shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-[13px] font-medium text-[#333]">Jetzt geöffnet</span>
          </div>
        </div>
      </div>

      {/* ── Desktop: Split layout ── */}
      <div className="hidden lg:flex" style={{ height: 'calc(100dvh - 128px)' }}>
        {/* LEFT — card list */}
        <div className="w-1/2 overflow-hidden border-r border-[#EBEBEB] p-4">
          <p className="text-xs text-[#717171] mb-4 px-0.5">
            <span className="inline-block h-3 w-28 bg-[#F0F0F0] animate-pulse rounded" />
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        </div>
        {/* RIGHT — map placeholder */}
        <div className="w-1/2 relative p-3">
          <div className="absolute inset-3 rounded-2xl bg-[#F0F0F0] animate-pulse" />
        </div>
      </div>

      {/* ── Mobile: card list ── */}
      <div className="lg:hidden p-4">
        <p className="text-xs text-[#717171] mb-4 px-0.5">
          <span className="inline-block h-3 w-28 bg-[#F0F0F0] animate-pulse rounded" />
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}
