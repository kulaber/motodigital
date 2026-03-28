import Header from '@/components/layout/Header'

export default function CustomBikeLoading() {
  return (
    <div className="min-h-screen bg-white text-[#222222]">
      <Header activePage="bikes" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 md:pt-6 pb-24 animate-pulse">
        {/* Gallery skeleton */}
        <div className="aspect-[16/9] sm:aspect-[2/1] rounded-2xl bg-[#F0F0F0] mb-8" />

        {/* Title skeleton */}
        <div className="mb-10 space-y-3">
          <div className="h-3 w-20 rounded-full bg-[#F0F0F0]" />
          <div className="h-8 w-2/3 rounded bg-[#F0F0F0]" />
          <div className="h-3.5 w-1/3 rounded bg-[#F0F0F0]" />
        </div>

        {/* Content grid skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8">
          <div className="space-y-4">
            <div className="rounded-2xl border border-[#EBEBEB] p-6 space-y-3">
              <div className="h-4 w-1/4 rounded bg-[#F0F0F0]" />
              <div className="h-3 w-full rounded bg-[#F0F0F0]" />
              <div className="h-3 w-5/6 rounded bg-[#F0F0F0]" />
              <div className="h-3 w-3/4 rounded bg-[#F0F0F0]" />
            </div>
          </div>
          <div className="space-y-4">
            <div className="rounded-2xl border border-[#DDDDDD] p-5 space-y-3">
              <div className="h-3 w-1/3 rounded bg-[#F0F0F0]" />
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#F0F0F0]" />
                <div className="space-y-2 flex-1">
                  <div className="h-3.5 w-1/2 rounded bg-[#F0F0F0]" />
                  <div className="h-3 w-1/3 rounded bg-[#F0F0F0]" />
                </div>
              </div>
              <div className="h-10 w-full rounded-xl bg-[#F0F0F0]" />
            </div>
            <div className="rounded-2xl border border-[#EBEBEB] p-5 space-y-2">
              <div className="h-4 w-1/3 rounded bg-[#F0F0F0]" />
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex justify-between py-2">
                  <div className="h-3 w-1/4 rounded bg-[#F0F0F0]" />
                  <div className="h-3 w-1/3 rounded bg-[#F0F0F0]" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
