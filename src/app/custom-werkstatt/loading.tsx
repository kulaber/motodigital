import Header from '@/components/layout/Header'

function BuilderCardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-[#EBEBEB] p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl bg-[#F0F0F0] flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3.5 w-2/3 rounded bg-[#F0F0F0]" />
          <div className="h-3 w-1/3 rounded bg-[#F0F0F0]" />
        </div>
      </div>
      <div className="h-3 w-full rounded bg-[#F0F0F0] mb-2" />
      <div className="h-3 w-3/4 rounded bg-[#F0F0F0]" />
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

      <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-8 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <BuilderCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}
