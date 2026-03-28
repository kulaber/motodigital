import Header from '@/components/layout/Header'

export default function BuilderProfileLoading() {
  return (
    <div className="min-h-screen bg-white text-[#222222]">
      <Header activePage="custom-werkstatt" />

      {/* Hero skeleton */}
      <div className="animate-pulse">
        <div className="w-full h-[52vh] min-h-[340px] max-h-[520px] bg-[#F0F0F0]" />
      </div>

      <div className="h-8" />

      {/* Content skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 animate-pulse">
          <div className="space-y-4">
            <div className="rounded-2xl border border-[#EBEBEB] p-6 space-y-3">
              <div className="h-4 w-1/3 rounded bg-[#F0F0F0]" />
              <div className="h-3 w-full rounded bg-[#F0F0F0]" />
              <div className="h-3 w-5/6 rounded bg-[#F0F0F0]" />
              <div className="h-3 w-2/3 rounded bg-[#F0F0F0]" />
            </div>
            <div className="rounded-2xl border border-[#EBEBEB] p-6 space-y-3">
              <div className="h-4 w-1/4 rounded bg-[#F0F0F0]" />
              <div className="grid grid-cols-3 gap-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-10 rounded-xl bg-[#F0F0F0]" />
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="rounded-2xl border border-[#DDDDDD] p-5 space-y-3">
              <div className="h-4 w-2/3 rounded bg-[#F0F0F0]" />
              <div className="h-3 w-full rounded bg-[#F0F0F0]" />
              <div className="h-10 w-full rounded-xl bg-[#F0F0F0]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
