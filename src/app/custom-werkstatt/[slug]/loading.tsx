import Header from '@/components/layout/Header'

export default function BuilderDetailLoading() {
  return (
    <div className="min-h-screen bg-white text-[#222222]">
      <Header activePage="custom-werkstatt" />

      {/* ── HERO — full-width cover image ── */}
      <div className="relative w-full h-[52vh] min-h-[340px] max-h-[520px] bg-[#F0F0F0] animate-pulse">
        {/* Gradient overlay placeholder */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
        {/* Bottom info */}
        <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-5 lg:px-8 pb-6 sm:pb-8">
          <div className="max-w-7xl mx-auto flex items-end gap-4">
            <div className="flex-shrink-0 w-14 h-14 sm:w-20 sm:h-20 rounded-2xl bg-white/20 animate-pulse" />
            <div className="flex-1 min-w-0 pb-1">
              <div className="h-7 w-48 bg-white/20 animate-pulse rounded mb-2" />
              <div className="h-4 w-28 bg-white/20 animate-pulse rounded" />
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <div className="h-9 w-28 bg-white/20 animate-pulse rounded-full" />
              <div className="h-9 w-9 bg-white/20 animate-pulse rounded-full" />
            </div>
          </div>
        </div>
      </div>

      <div className="h-8" />

      {/* ── FEATURED BUILDS ── */}
      <section className="pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-8">
          <div className="flex items-end justify-between mb-5">
            <div className="h-4 w-56 bg-[#F0F0F0] animate-pulse rounded" />
            <div className="h-4 w-20 bg-[#F0F0F0] animate-pulse rounded" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(3)].map((_, i) => (
              <div key={i}>
                <div className="aspect-[4/3] rounded-2xl bg-[#F0F0F0] animate-pulse mb-3" />
                <div className="h-4 w-3/4 bg-[#F0F0F0] animate-pulse rounded mb-1" />
                <div className="h-3 w-1/2 bg-[#F0F0F0] animate-pulse rounded" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTENT ── */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 items-start">
            {/* LEFT */}
            <div>
              {/* About */}
              <div className="bg-white border border-[#EBEBEB] rounded-2xl p-5 sm:p-6 mb-4">
                <div className="h-4 w-32 bg-[#F0F0F0] animate-pulse rounded mb-3" />
                <div className="space-y-2">
                  <div className="h-3 w-full bg-[#F0F0F0] animate-pulse rounded" />
                  <div className="h-3 w-full bg-[#F0F0F0] animate-pulse rounded" />
                  <div className="h-3 w-2/3 bg-[#F0F0F0] animate-pulse rounded" />
                </div>
              </div>
              {/* Leistungen */}
              <div className="bg-white border border-[#EBEBEB] rounded-2xl p-5 mb-4">
                <div className="h-4 w-24 bg-[#F0F0F0] animate-pulse rounded mb-4" />
                {/* Mobile: chips */}
                <div className="flex flex-wrap gap-2 sm:hidden">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-7 w-24 bg-[#F0F0F0] animate-pulse rounded-full" />
                  ))}
                </div>
                {/* Desktop: grid cards */}
                <div className="hidden sm:grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-10 bg-[#F7F7F7] animate-pulse rounded-xl" />
                  ))}
                </div>
              </div>
              {/* Map */}
              <div className="bg-white border border-[#EBEBEB] rounded-2xl overflow-hidden mb-4">
                <div className="px-5 pt-4 pb-3">
                  <div className="h-4 w-44 bg-[#F0F0F0] animate-pulse rounded" />
                </div>
                <div className="h-64 bg-[#F0F0F0] animate-pulse" />
                <div className="px-5 py-3 border-t border-[#EBEBEB]">
                  <div className="h-3 w-40 bg-[#F0F0F0] animate-pulse rounded" />
                </div>
              </div>
            </div>

            {/* RIGHT sidebar */}
            <div className="flex flex-col gap-4 lg:sticky lg:top-24">
              {/* Contact CTA */}
              <div className="bg-white border border-[#DDDDDD] rounded-2xl p-5">
                <div className="h-4 w-40 bg-[#F0F0F0] animate-pulse rounded mb-1" />
                <div className="h-3 w-48 bg-[#F0F0F0] animate-pulse rounded mb-4" />
                <div className="h-10 w-full bg-[#F0F0F0] animate-pulse rounded-xl" />
              </div>
              {/* Links */}
              <div className="bg-white border border-[#EBEBEB] rounded-2xl p-5">
                <div className="h-4 w-24 bg-[#F0F0F0] animate-pulse rounded mb-3" />
                <div className="h-3 w-32 bg-[#F0F0F0] animate-pulse rounded mb-2.5" />
                <div className="h-3 w-28 bg-[#F0F0F0] animate-pulse rounded" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
