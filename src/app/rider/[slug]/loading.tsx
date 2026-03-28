import Header from '@/components/layout/Header'

export default function RiderProfileLoading() {
  return (
    <div className="skeleton-delayed min-h-screen bg-white text-[#222222]">
      <Header activePage="explore" />

      {/* Hero section skeleton — matches real bg-[#F7F7F7] hero */}
      <section className="bg-[#F7F7F7] border-b border-[#222222]/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-5 lg:px-8 py-10 sm:py-14">
          <div className="flex flex-wrap items-center gap-4 sm:gap-5 animate-pulse">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#E0E0E0] flex-shrink-0" />
            <div className="min-w-0 space-y-2">
              <div className="h-5 sm:h-6 w-36 rounded bg-[#E0E0E0]" />
              <div className="h-3 w-20 rounded bg-[#E8E8E8]" />
              <div className="h-5 w-12 rounded-full bg-[#E8E8E8]" />
            </div>
          </div>
        </div>
      </section>

      {/* Content skeleton */}
      <section className="py-10 sm:py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-5 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 items-start animate-pulse">
            {/* Left */}
            <div className="flex flex-col gap-4 w-full lg:w-1/2">
              {/* Garage */}
              <div className="bg-white border border-[#EBEBEB] rounded-2xl p-5 sm:p-6 space-y-4">
                <div className="flex items-end justify-between">
                  <div className="h-5 w-28 rounded bg-[#EBEBEB]" />
                  <div className="h-3 w-12 rounded bg-[#F0F0F0]" />
                </div>
                <div className="aspect-[16/10] rounded-2xl bg-[#F0F0F0]" />
                <div className="space-y-1.5">
                  <div className="h-3.5 w-2/3 rounded bg-[#EBEBEB]" />
                  <div className="h-3 w-1/3 rounded bg-[#F0F0F0]" />
                </div>
              </div>
              {/* Bio */}
              <div className="bg-white border border-[#EBEBEB] rounded-2xl p-5 sm:p-6 space-y-3">
                <div className="h-4 w-24 rounded bg-[#EBEBEB]" />
                <div className="h-3 w-full rounded bg-[#F0F0F0]" />
                <div className="h-3 w-[85%] rounded bg-[#F0F0F0]" />
              </div>
            </div>
            {/* Right */}
            <div className="flex flex-col gap-4 w-full lg:w-1/2">
              <div className="bg-white border border-[#EBEBEB] rounded-2xl p-5 space-y-4">
                <div className="h-4 w-48 rounded bg-[#EBEBEB]" />
                <div className="grid grid-cols-3 gap-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="aspect-square rounded-xl bg-[#111111]/5" />
                  ))}
                </div>
              </div>
              <div className="bg-white border border-[#EBEBEB] rounded-2xl overflow-hidden">
                <div className="h-48 bg-[#F0F0F0]" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
