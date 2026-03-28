import Header from '@/components/layout/Header'

export default function CustomBikeLoading() {
  return (
    <div className="min-h-screen bg-white text-[#222222]">
      <Header activePage="bikes" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 md:pt-6 pb-24">
        {/* Gallery skeleton */}
        <div className="animate-pulse">
          {/* Mobile: single image */}
          <div className="sm:hidden aspect-[4/3] rounded-2xl bg-[#F0F0F0]" />
          {/* Desktop: gallery grid */}
          <div className="hidden sm:grid grid-cols-2 gap-2 rounded-2xl overflow-hidden">
            <div className="aspect-[4/3] bg-[#F0F0F0]" />
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-[#F0F0F0]" />
              <div className="bg-[#F0F0F0]" />
              <div className="bg-[#F0F0F0]" />
              <div className="bg-[#F0F0F0]" />
            </div>
          </div>
        </div>

        {/* Title skeleton */}
        <div className="mt-8 mb-10 animate-pulse">
          <div className="h-5 w-20 rounded-full bg-[#F0F0F0] mb-3" />
          <div className="h-8 sm:h-10 w-[70%] rounded bg-[#EBEBEB] mb-2" />
          <div className="h-3.5 w-1/3 rounded bg-[#F0F0F0]" />
        </div>

        {/* Content grid skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 items-start animate-pulse">
          {/* Left */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-[#EBEBEB] p-5 sm:p-6 space-y-3">
              <div className="h-4 w-32 rounded bg-[#EBEBEB]" />
              <div className="space-y-2">
                <div className="h-3 w-full rounded bg-[#F0F0F0]" />
                <div className="h-3 w-[90%] rounded bg-[#F0F0F0]" />
                <div className="h-3 w-3/4 rounded bg-[#F0F0F0]" />
              </div>
            </div>
          </div>
          {/* Right sidebar */}
          <div className="space-y-4">
            {/* Builder card */}
            <div className="rounded-2xl border border-[#DDDDDD] overflow-hidden">
              <div className="px-5 pt-5 pb-4 border-b border-[#F0F0F0]">
                <div className="h-2.5 w-16 rounded bg-[#F0F0F0] mb-3" />
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-full bg-[#EBEBEB]" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 w-24 rounded bg-[#EBEBEB]" />
                    <div className="h-3 w-16 rounded bg-[#F0F0F0]" />
                  </div>
                </div>
              </div>
              <div className="px-5 py-4">
                <div className="h-10 w-full rounded-xl bg-[#F0F0F0]" />
              </div>
            </div>
            {/* Specs card */}
            <div className="rounded-2xl border border-[#EBEBEB] p-5 space-y-1">
              <div className="h-4 w-32 rounded bg-[#EBEBEB] mb-3" />
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex justify-between py-2.5 border-b border-[#F7F7F7] last:border-0">
                  <div className="h-3 w-12 rounded bg-[#F0F0F0]" />
                  <div className="h-3 w-20 rounded bg-[#F0F0F0]" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
