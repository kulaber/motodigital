import { Link } from '@/i18n/navigation'
import Image from 'next/image'
import type { RiderResult } from '@/lib/actions/search'

export function RiderResultCard({ rider }: { rider: RiderResult }) {
  return (
    <Link
      href={`/rider/${rider.username}`}
      className="flex items-center gap-3 p-3 rounded-2xl
                 bg-white border border-[#222222]/6
                 hover:border-[#222222]/15 hover:shadow-sm
                 transition-all active:scale-[0.99]"
    >
      {/* Avatar */}
      <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0
                      bg-[#06a5a5]/10 border border-[#06a5a5]/20 flex items-center justify-center">
        {rider.avatar_url ? (
          <Image
            src={rider.avatar_url}
            alt={rider.username}
            width={40}
            height={40}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-xs font-bold text-[#06a5a5]/50">
            {(rider.full_name ?? rider.username).charAt(0).toUpperCase()}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-[#222222]">
          {rider.full_name ?? rider.username}
        </div>
        <div className="text-xs text-[#222222]/40">
          @{rider.username}
          {rider.city && ` · ${rider.city}`}
          {rider.bike_count > 0 && ` · ${rider.bike_count} Bikes`}
        </div>
        {rider.riding_style && (
          <div className="text-[10px] text-[#222222]/25 mt-0.5">
            {rider.riding_style}
          </div>
        )}
      </div>

      <span className="text-[#222222]/15 text-sm flex-shrink-0">›</span>
    </Link>
  )
}
