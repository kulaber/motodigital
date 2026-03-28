import Header from '@/components/layout/Header'

export default function BuilderProfileLoading() {
  return (
    <div className="min-h-screen bg-white text-[#222222]">
      <Header activePage="custom-werkstatt" />

      {/* Hero skeleton — matches the actual 52vh hero */}
      <div className="relative w-full h-[52vh] min-h-[340px] max-h-[520px] bg-[#F0F0F0] animate-pulse">
        {/* Bottom info overlay skeleton */}
        <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-5 lg:px-8 pb-6 sm:pb-8">
          <div className="max-w-7xl mx-auto flex items-end gap-4">
            <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl bg-white/20" />
            <div className="space-y-2">
              <div className="h-5 sm:h-7 w-40 rounded bg-white/20" />
              <div className="h-3 w-24 rounded bg-white/15" />
            </div>
          </div>
        </div>
      </div>

      <div className="h-8" />

      {/* Content skeleton */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 items-start animate-pulse">
            {/* Left */}
            <div className="space-y-4">
              {/* About */}
              <div className="rounded-2xl border border-[#EBEBEB] p-5 sm:p-6 space-y-3">
                <div className="h-4 w-36 rounded bg-[#EBEBEB]" />
                <div className="h-3 w-full rounded bg-[#F0F0F0]" />
                <div className="h-3 w-[90%] rounded bg-[#F0F0F0]" />
                <div className="h-3 w-2/3 rounded bg-[#F0F0F0]" />
              </div>
              {/* Leistungen */}
              <div className="rounded-2xl border border-[#EBEBEB] p-5 space-y-4">
                <div className="h-4 w-24 rounded bg-[#EBEBEB]" />
                <div className="hidden sm:grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-11 rounded-xl bg-[#F7F7F7]" />
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 sm:hidden">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-7 w-20 rounded-full bg-[#F7F7F7]" />
                  ))}
                </div>
              </div>
            </div>
            {/* Right sidebar */}
            <div className="space-y-4">
              <div className="rounded-2xl border border-[#DDDDDD] p-5 space-y-3">
                <div className="h-4 w-40 rounded bg-[#EBEBEB]" />
                <div className="h-3 w-full rounded bg-[#F0F0F0]" />
                <div className="h-10 w-full rounded-xl bg-[#06a5a5]/20" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
