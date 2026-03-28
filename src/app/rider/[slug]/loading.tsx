import Header from '@/components/layout/Header'

export default function RiderProfileLoading() {
  return (
    <div className="min-h-screen bg-white text-[#222222]">
      <Header activePage="explore" />

      {/* Hero skeleton */}
      <section className="bg-[#F7F7F7] border-b border-[#222222]/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-5 lg:px-8 py-10 sm:py-14 animate-pulse">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#E0E0E0] flex-shrink-0" />
            <div className="space-y-2.5">
              <div className="h-5 w-40 rounded bg-[#E0E0E0]" />
              <div className="h-3 w-24 rounded bg-[#E0E0E0]" />
              <div className="h-5 w-14 rounded-full bg-[#E0E0E0]" />
            </div>
          </div>
        </div>
      </section>

      {/* Content skeleton */}
      <section className="py-10 sm:py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-5 lg:px-8 animate-pulse">
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
            <div className="w-full lg:w-1/2 space-y-4">
              <div className="rounded-2xl border border-[#EBEBEB] p-6 space-y-4">
                <div className="h-4 w-1/3 rounded bg-[#F0F0F0]" />
                <div className="aspect-[16/10] rounded-2xl bg-[#F0F0F0]" />
                <div className="h-3 w-2/3 rounded bg-[#F0F0F0]" />
              </div>
            </div>
            <div className="w-full lg:w-1/2 space-y-4">
              <div className="rounded-2xl border border-[#EBEBEB] p-6 space-y-3">
                <div className="h-4 w-1/2 rounded bg-[#F0F0F0]" />
                <div className="grid grid-cols-3 gap-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="aspect-square rounded-xl bg-[#F0F0F0]" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
