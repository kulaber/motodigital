import Header from '@/components/layout/Header'

export default function ExploreLoading() {
  return (
    <div className="min-h-dvh flex flex-col bg-[#F7F7F7]">
      <Header activePage="explore" />
      <div className="flex flex-1 justify-center bg-[#F7F7F7]">
        <div className="w-full max-w-2xl px-4 py-6 space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#F0F0F0] animate-pulse" />
                <div className="space-y-1.5">
                  <div className="h-3.5 w-28 bg-[#F0F0F0] animate-pulse rounded" />
                  <div className="h-2.5 w-16 bg-[#F0F0F0] animate-pulse rounded" />
                </div>
              </div>
              <div className="h-3 w-full bg-[#F0F0F0] animate-pulse rounded" />
              <div className="h-3 w-2/3 bg-[#F0F0F0] animate-pulse rounded" />
              <div className="aspect-[16/9] bg-[#F0F0F0] animate-pulse rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
