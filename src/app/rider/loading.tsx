import Header from '@/components/layout/Header'

function RiderCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-[#222222]/6 p-5 animate-pulse">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 rounded-full bg-[#EBEBEB] flex-shrink-0" />
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="h-3.5 w-2/3 rounded bg-[#EBEBEB]" />
          <div className="h-3 w-1/3 rounded bg-[#F0F0F0]" />
        </div>
      </div>
      <div className="flex gap-1.5">
        <div className="h-[22px] w-24 rounded-full bg-[#F7F7F7] border border-[#EBEBEB]" />
        <div className="h-[22px] w-32 rounded-full bg-[#F7F7F7] border border-[#EBEBEB]" />
      </div>
    </div>
  )
}

export default function RiderListLoading() {
  return (
    <div className="min-h-screen bg-[#F7F7F7] text-[#222222]">
      <Header activePage="explore" />

      <section className="pt-10 pb-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-5 lg:px-8">
          <h1 className="text-xl sm:text-2xl font-bold text-[#222222] tracking-tight">Rider</h1>
        </div>
      </section>

      <section className="pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-5 lg:px-8">
          {/* Filter bar skeleton */}
          <div className="flex items-center gap-2 mb-6 animate-pulse">
            <div className="h-8 w-[72px] rounded-full border border-[#222222]/10 bg-white" />
            <div className="h-8 w-[72px] rounded-full border border-[#222222]/10 bg-white" />
            <div className="h-8 w-[72px] rounded-full border border-[#222222]/10 bg-white" />
          </div>

          {/* Count */}
          <div className="h-3 w-32 rounded bg-[#EBEBEB] mb-4 animate-pulse" />

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 9 }).map((_, i) => (
              <RiderCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
