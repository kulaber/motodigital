import Header from '@/components/layout/Header'

export default function BikeDetailLoading() {
  return (
    <div className="min-h-screen bg-white text-[#222222]">
      <Header activePage="bikes" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 md:pt-4 pb-24">
        {/* Back link (desktop) */}
        <div className="hidden md:block h-4 w-28 bg-[#F0F0F0] animate-pulse rounded mb-4" />

        {/* Gallery skeleton — mosaic grid */}
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr] gap-2 rounded-2xl overflow-hidden">
          <div className="aspect-[4/3] bg-[#F0F0F0] animate-pulse" />
          <div className="hidden sm:grid grid-rows-2 gap-2">
            <div className="bg-[#F0F0F0] animate-pulse" />
            <div className="bg-[#F0F0F0] animate-pulse" />
          </div>
        </div>

        {/* Style badge + Title + Make/Model */}
        <div className="mt-8 mb-10 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="h-6 w-20 bg-[#F0F0F0] animate-pulse rounded-full mb-3" />
            <div className="h-8 w-72 bg-[#F0F0F0] animate-pulse rounded mb-2" />
            <div className="h-4 w-44 bg-[#F0F0F0] animate-pulse rounded" />
          </div>
        </div>

        {/* 2-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 items-start">
          {/* Left: Description + Specs */}
          <div className="flex flex-col gap-8">
            {/* Description card */}
            <div className="bg-white border border-[#EBEBEB] rounded-2xl p-5 sm:p-6">
              <div className="h-4 w-36 bg-[#F0F0F0] animate-pulse rounded mb-4" />
              <div className="space-y-2">
                <div className="h-3 w-full bg-[#F0F0F0] animate-pulse rounded" />
                <div className="h-3 w-full bg-[#F0F0F0] animate-pulse rounded" />
                <div className="h-3 w-3/4 bg-[#F0F0F0] animate-pulse rounded" />
              </div>
            </div>

            {/* Specs card */}
            <div className="bg-white border border-[#EBEBEB] rounded-2xl p-5 sm:p-6">
              <div className="h-4 w-32 bg-[#F0F0F0] animate-pulse rounded mb-4" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between py-2.5 border-b border-[#F7F7F7]">
                    <div className="h-3 w-14 bg-[#F0F0F0] animate-pulse rounded" />
                    <div className="h-3 w-20 bg-[#F0F0F0] animate-pulse rounded" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Seller card */}
          <div className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
            <div className="bg-white border border-[#DDDDDD] rounded-2xl overflow-hidden">
              <div className="px-5 pt-5 pb-4 border-b border-[#F0F0F0]">
                <div className="h-3 w-24 bg-[#F0F0F0] animate-pulse rounded mb-3" />
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-full bg-[#F0F0F0] animate-pulse flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="h-4 w-28 bg-[#F0F0F0] animate-pulse rounded" />
                      <div className="h-5 w-14 bg-[#F0F0F0] animate-pulse rounded-full" />
                    </div>
                    <div className="h-3 w-20 bg-[#F0F0F0] animate-pulse rounded" />
                  </div>
                </div>
              </div>
              <div className="px-5 py-4 flex flex-col gap-2">
                <div className="h-10 w-full bg-[#F0F0F0] animate-pulse rounded-xl" />
                <div className="h-4 w-24 mx-auto bg-[#F0F0F0] animate-pulse rounded mt-1" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
