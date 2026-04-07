import Link from 'next/link'
import Image from 'next/image'
import type { WorkshopResult } from '@/lib/actions/search'

export function WorkshopResultCard({ workshop }: { workshop: WorkshopResult }) {
  return (
    <Link
      href={`/custom-werkstatt/${workshop.slug}`}
      className="flex items-center gap-3 p-3 rounded-2xl
                 bg-white border border-[#222222]/6
                 hover:border-[#222222]/15 hover:shadow-sm
                 transition-all active:scale-[0.99]"
    >
      {/* Logo */}
      <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0
                      bg-[#F7F7F7] flex items-center justify-center">
        {workshop.logo_url ? (
          <Image
            src={workshop.logo_url}
            alt={workshop.name}
            width={48}
            height={48}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-sm font-bold text-[#222222]/15">
            {workshop.name.charAt(0).toUpperCase()}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-[#222222] truncate">
          {workshop.name}
        </div>
        <div className="text-xs text-[#222222]/40 mt-0.5">
          {workshop.city ?? 'Standort unbekannt'}
          {workshop.bike_count > 0 && ` · ${workshop.bike_count} Builds`}
        </div>
        {workshop.services.length > 0 && (
          <div className="flex gap-1 mt-1 flex-wrap">
            {workshop.services.slice(0, 2).map((s) => (
              <span
                key={s}
                className="text-[10px] px-2 py-0.5 rounded-full font-medium
                           bg-[#1A1A1A]/5 border border-[#1A1A1A]/10 text-[#222222]/40"
              >
                {s}
              </span>
            ))}
            {workshop.services.length > 2 && (
              <span className="text-[10px] text-[#222222]/20">
                +{workshop.services.length - 2}
              </span>
            )}
          </div>
        )}
      </div>

      <span className="text-[#222222]/15 text-sm flex-shrink-0">›</span>
    </Link>
  )
}
