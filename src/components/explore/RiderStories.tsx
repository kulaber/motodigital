import { Link } from '@/i18n/navigation'
import Image from 'next/image'

interface Rider {
  id: string
  username: string
  full_name: string | null
  avatar_url: string | null
  isOnline?: boolean
}

function RiderSkeletons() {
  return (
    <section className="lg:hidden bg-white border-b-[6px] border-[#F0F0F0] -mx-4 sm:-mx-6 lg:mx-0">
      <div className="h-3 w-24 bg-[#F0EDE4] rounded-full mx-4 mt-4 mb-2" />
      <div className="flex gap-3.5 px-4 pb-4 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5 flex-shrink-0">
            <div className="size-[72px] rounded-full bg-[#F0EDE4] animate-pulse" />
            <div className="h-2.5 w-10 bg-[#F0EDE4] rounded-full animate-pulse" />
          </div>
        ))}
      </div>
    </section>
  )
}

export default function RiderList({ riders, loading, currentUserId }: { riders: Rider[]; loading?: boolean; currentUserId?: string | null }) {
  if (loading) return <RiderSkeletons />
  if (!riders.length) return <RiderSkeletons />

  return (
    <section className="lg:hidden bg-white border-b-[6px] border-[#F0F0F0] -mx-4 sm:-mx-6 lg:mx-0">
      <p className="text-[10px] font-bold uppercase tracking-[2px] text-[#999] px-6 pt-4 mb-2">
        Entdecke Rider
      </p>
      <div className="flex gap-3.5 px-6 pb-4 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {riders.map(rider => {
          return (
            <Link
              key={rider.id}
              href={`/rider/${rider.username}`}
              className="flex flex-col items-center gap-1.5 flex-shrink-0"
            >
              <div className="relative w-[72px] h-[72px]">
                <div className="w-full h-full rounded-full overflow-hidden">
                  {rider.avatar_url ? (
                    <Image
                      src={rider.avatar_url}
                      alt={rider.full_name ?? rider.username}
                      width={72}
                      height={72}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#2AABAB]">
                      <Image src="/pin-logo.svg" alt="" width={32} height={32} className="w-8 h-8 object-contain" />
                    </div>
                  )}
                </div>
                {rider.isOnline && (
                  <span className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                )}
              </div>
              <span className="text-[10px] font-semibold text-[#111] max-w-[72px] truncate text-center">
                {currentUserId && rider.id === currentUserId ? 'Dein Profil' : (rider.full_name ?? rider.username)}
              </span>
            </Link>
          )
        })}

        {/* "Alle Rider entdecken" button */}
        <Link
          href="/rider"
          className="flex flex-col items-center gap-1.5 flex-shrink-0"
        >
          <div className="w-[72px] h-[72px] rounded-full border-2 border-dashed border-[#222]/15 flex items-center justify-center hover:border-[#2AABAB]/50 transition-colors">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-[#222]/30">
              <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <span className="text-[10px] font-semibold text-[#2AABAB] max-w-[72px] text-center leading-tight">
            Alle Rider
          </span>
        </Link>
      </div>
    </section>
  )
}
