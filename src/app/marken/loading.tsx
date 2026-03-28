import Header from '@/components/layout/Header'

export default function MarkenLoading() {
  return (
    <div className="skeleton-delayed min-h-screen bg-white text-[#222222]">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-8 pt-12 pb-4 animate-pulse">
        <div className="h-3 w-40 rounded bg-[#F0F0F0] mb-3" />
        <div className="h-8 w-72 rounded bg-[#F0F0F0] mb-3" />
        <div className="h-3.5 w-96 rounded bg-[#F0F0F0]" />
      </div>

      <section className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-2xl border border-[#EBEBEB] p-6 space-y-3">
              <div className="h-12 w-28 rounded bg-[#F0F0F0]" />
              <div className="h-4 w-1/2 rounded bg-[#F0F0F0]" />
              <div className="h-3 w-full rounded bg-[#F0F0F0]" />
              <div className="h-3 w-3/4 rounded bg-[#F0F0F0]" />
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
