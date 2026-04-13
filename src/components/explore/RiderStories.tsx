import Link from 'next/link'
import Image from 'next/image'

interface Rider {
  id: string
  username: string
  full_name: string | null
  avatar_url: string | null
  isOnline?: boolean
}

const GRADIENT_PRESETS = [
  'from-rose-500 to-orange-400',
  'from-violet-500 to-fuchsia-400',
  'from-cyan-500 to-blue-400',
  'from-emerald-500 to-teal-400',
  'from-amber-500 to-yellow-400',
  'from-pink-500 to-red-400',
  'from-indigo-500 to-purple-400',
  'from-lime-500 to-green-400',
]

function getGradient(id: string) {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0
  return GRADIENT_PRESETS[Math.abs(hash) % GRADIENT_PRESETS.length]
}

function getInitials(name: string | null, username: string): string {
  if (name && name.trim().length > 0) {
    return name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
  }
  return username.slice(0, 2).toUpperCase()
}

function RiderSkeletons() {
  return (
    <section className="lg:hidden bg-white border-b border-black/[0.07] mb-4 -mx-4 sm:-mx-6 lg:mx-0">
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

export default function RiderList({ riders, loading }: { riders: Rider[]; loading?: boolean }) {
  if (loading) return <RiderSkeletons />
  if (!riders.length) return <RiderSkeletons />

  return (
    <section className="lg:hidden bg-white border-b border-black/[0.07] mb-4 -mx-4 sm:-mx-6 lg:mx-0">
      <p className="text-[10px] font-bold uppercase tracking-[2px] text-[#999] px-6 pt-4 mb-2">
        Entdecke Rider
      </p>
      <div className="flex gap-3.5 px-6 pb-4 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {riders.map(rider => {
          const initials = getInitials(rider.full_name, rider.username)
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
                {rider.full_name ?? rider.username}
              </span>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
