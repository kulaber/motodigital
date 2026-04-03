import Header from '@/components/layout/Header'

export default function RiderLoading() {
  return (
    <div className="min-h-screen bg-white text-[#222222]">
      <Header />

      {/* ── COVER BANNER ── */}
      <div className="relative w-full h-44 sm:h-56 lg:h-64 bg-[#F0F0F0] animate-pulse" />

      {/* ── HERO ── */}
      <section className="bg-white border-b border-[#222222]/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-5 lg:px-8">
          {/* Avatar overlapping cover */}
          <div className="flex items-end justify-between -mt-14 sm:-mt-16">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-[#F0F0F0] animate-pulse border-4 border-white shadow-lg" />
            {/* Desktop action buttons */}
            <div className="hidden lg:flex items-center gap-2.5 pb-1">
              <div className="h-9 w-24 bg-[#F0F0F0] animate-pulse rounded-full" />
              <div className="h-9 w-28 bg-[#F0F0F0] animate-pulse rounded-full" />
            </div>
          </div>

          {/* Profile info */}
          <div className="pt-3 pb-6 sm:pb-8">
            {/* Name + Stats row */}
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="h-6 w-40 bg-[#F0F0F0] animate-pulse rounded mb-1.5" />
                <div className="h-4 w-24 bg-[#F0F0F0] animate-pulse rounded" />
              </div>
              {/* Follower / Following */}
              <div className="flex items-center gap-6">
                <div className="flex flex-col items-center">
                  <div className="h-5 w-6 bg-[#F0F0F0] animate-pulse rounded" />
                  <div className="h-3 w-12 bg-[#F0F0F0] animate-pulse rounded mt-1" />
                </div>
                <div className="w-px h-8 bg-[#EBEBEB]" />
                <div className="flex flex-col items-center">
                  <div className="h-5 w-6 bg-[#F0F0F0] animate-pulse rounded" />
                  <div className="h-3 w-8 bg-[#F0F0F0] animate-pulse rounded mt-1" />
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="h-4 w-2/3 max-w-lg bg-[#F0F0F0] animate-pulse rounded mt-3" />

            {/* Mobile action buttons */}
            <div className="flex items-center gap-2.5 mt-4 lg:hidden">
              <div className="h-9 w-24 bg-[#F0F0F0] animate-pulse rounded-full" />
              <div className="h-9 w-28 bg-[#F0F0F0] animate-pulse rounded-full" />
            </div>
          </div>
        </div>
      </section>

      {/* ── CONTENT ── */}
      <section className="py-10 sm:py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-5 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
            {/* Main Column (60%) — Garage skeleton */}
            <div className="w-full lg:w-[60%]">
              <div className="bg-[#111111] rounded-2xl p-5 sm:p-6">
                <div className="flex items-center gap-2 mb-5">
                  <div className="h-6 w-32 bg-white/10 animate-pulse rounded" />
                  <div className="ml-auto h-3 w-12 bg-white/10 animate-pulse rounded" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[...Array(2)].map((_, i) => (
                    <div key={i}>
                      <div className="aspect-[4/3] rounded-xl bg-[#1a1a1a] animate-pulse mb-2.5" />
                      <div className="h-4 w-3/4 bg-white/10 animate-pulse rounded mb-1" />
                      <div className="h-3 w-1/2 bg-white/10 animate-pulse rounded" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar (40%) */}
            <div className="flex flex-col gap-4 w-full lg:w-[40%]">
              {/* Fahrstil */}
              <div className="bg-white border border-[#EBEBEB] rounded-2xl p-5">
                <div className="h-4 w-32 bg-[#F0F0F0] animate-pulse rounded mb-3" />
                <div className="h-4 w-28 bg-[#F0F0F0] animate-pulse rounded" />
              </div>
              {/* Interessen */}
              <div className="bg-white border border-[#EBEBEB] rounded-2xl p-5">
                <div className="h-4 w-24 bg-[#F0F0F0] animate-pulse rounded mb-3" />
                <div className="flex flex-wrap gap-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-7 w-20 bg-[#F0F0F0] animate-pulse rounded-full" />
                  ))}
                </div>
              </div>
              {/* Links */}
              <div className="bg-white border border-[#EBEBEB] rounded-2xl p-5">
                <div className="h-4 w-16 bg-[#F0F0F0] animate-pulse rounded mb-3" />
                <div className="h-3 w-32 bg-[#F0F0F0] animate-pulse rounded mb-2" />
                <div className="h-3 w-28 bg-[#F0F0F0] animate-pulse rounded" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
