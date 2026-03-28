import Header from '@/components/layout/Header'

export default function SearchLoading() {
  return (
    <div className="skeleton-delayed min-h-screen bg-white text-[#222222]">
      <Header />
      <div className="max-w-3xl mx-auto px-4 sm:px-5 pt-8 pb-16 animate-pulse">
        <div className="h-10 w-full rounded-xl bg-[#F0F0F0] mb-8" />
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-[#EBEBEB]">
              <div className="w-14 h-14 rounded-xl bg-[#F0F0F0] flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 w-1/2 rounded bg-[#F0F0F0]" />
                <div className="h-3 w-1/3 rounded bg-[#F0F0F0]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
