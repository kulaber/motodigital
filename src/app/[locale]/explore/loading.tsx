import Header from '@/components/layout/Header'

export default function ExploreLoading() {
  return (
    <div className="min-h-dvh flex flex-col bg-[#F7F7F7]">
      <Header activePage="explore" />
      <div className="flex flex-1 justify-center bg-[#F7F7F7]">
        <div className="flex flex-1 w-full max-w-7xl">

          {/* ── Sidebar (desktop only) ── */}
          <div className="hidden lg:block">
            <aside className="w-80 flex-shrink-0 flex flex-col gap-3 pt-3 pb-3 pl-4 sm:pl-5 lg:pl-8 pr-3 sticky top-16 h-[calc(100dvh-4rem)] overflow-y-auto">
              <div className="bg-white rounded-2xl border border-[#222222]/6 p-4">
                <div className="h-3 w-16 bg-[#F0F0F0] animate-pulse rounded mb-3" />
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 py-2">
                    <div className="w-9 h-9 rounded-full bg-[#F0F0F0] animate-pulse flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="h-3.5 w-24 bg-[#F0F0F0] animate-pulse rounded mb-1" />
                      <div className="h-2.5 w-32 bg-[#F0F0F0] animate-pulse rounded" />
                    </div>
                  </div>
                ))}
                <div className="h-3 w-32 bg-[#F0F0F0] animate-pulse rounded mt-2" />
              </div>
            </aside>
          </div>

          {/* ── Feed ── */}
          <main className="flex-1 min-w-0 pt-6 pb-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-[560px] mx-auto lg:mx-0">
              {/* Mobile heading */}
              <h1 className="lg:hidden text-xl font-bold text-[#222222] text-center mb-4">Explore</h1>

              {/* Filter pills */}
              <div className="flex items-center gap-2 mb-6 justify-center lg:justify-start">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-8 w-20 bg-[#F0F0F0] animate-pulse rounded-full" />
                ))}
              </div>

              {/* Composer placeholder */}
              <div className="bg-white rounded-2xl border border-[#222222]/6 overflow-hidden mb-4">
                <div className="flex items-center gap-3 px-4 py-3.5">
                  <div className="h-4 w-40 bg-[#F0F0F0] animate-pulse rounded flex-1" />
                  <div className="w-8 h-8 rounded-full bg-[#F0F0F0] animate-pulse flex-shrink-0" />
                </div>
              </div>

              {/* Post cards */}
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-[#222222]/6 overflow-hidden mb-4">
                  {/* Author row */}
                  <div className="flex items-center gap-3 p-4 pb-0">
                    <div className="w-10 h-10 rounded-full bg-[#F0F0F0] animate-pulse flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="h-3.5 w-28 bg-[#F0F0F0] animate-pulse rounded mb-1" />
                      <div className="h-2.5 w-16 bg-[#F0F0F0] animate-pulse rounded" />
                    </div>
                  </div>
                  {/* Text */}
                  <div className="px-4 pt-3 space-y-1.5">
                    <div className="h-3 w-full bg-[#F0F0F0] animate-pulse rounded" />
                    <div className="h-3 w-2/3 bg-[#F0F0F0] animate-pulse rounded" />
                  </div>
                  {/* Image */}
                  <div className="mt-3 aspect-[16/9] bg-[#F0F0F0] animate-pulse" />
                  {/* Actions */}
                  <div className="flex items-center gap-4 px-4 py-3">
                    <div className="h-4 w-12 bg-[#F0F0F0] animate-pulse rounded" />
                    <div className="h-4 w-12 bg-[#F0F0F0] animate-pulse rounded" />
                  </div>
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
