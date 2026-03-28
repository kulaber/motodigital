import Header from '@/components/layout/Header'

function RiderCardSkeleton() {
  return (
    <div className="animate-pulse flex items-center gap-4 p-4 rounded-2xl border border-[#EBEBEB]">
      <div className="w-14 h-14 rounded-full bg-[#F0F0F0] flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 w-1/2 rounded bg-[#F0F0F0]" />
        <div className="h-3 w-1/3 rounded bg-[#F0F0F0]" />
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
        <div className="max-w-4xl mx-auto px-4 sm:px-5 lg:px-8 space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <RiderCardSkeleton key={i} />
          ))}
        </div>
      </section>
    </div>
  )
}
