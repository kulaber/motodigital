import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Wrench } from 'lucide-react'
import type { WorkshopResult } from '@/lib/actions/search'

export function WorkshopResultCard({ workshop }: { workshop: WorkshopResult }) {
  return (
    <Link
      href={`/custom-werkstatt/${workshop.slug}`}
      className="group rounded-2xl overflow-hidden bg-white
                 border border-[#222222]/6 hover:border-[#222222]/15
                 hover:shadow-sm transition-all"
    >
      {/* Cover */}
      <div className="relative aspect-[4/3] bg-[#F7F7F7] overflow-hidden">
        <Image
          src={workshop.logo_url || '/images/workshop-default.png'}
          alt={workshop.name}
          fill
          sizes="(max-width: 640px) 100vw, 50vw"
          className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
        />
      </div>

      {/* Content */}
      <div className="p-3.5">
        <h3 className="text-sm font-semibold text-[#222222] leading-snug line-clamp-1">
          {workshop.name}
        </h3>
        <div className="flex items-center gap-3 text-xs text-[#222222]/40 mt-1">
          {workshop.city && (
            <span className="flex items-center gap-0.5">
              <MapPin size={10} />
              {workshop.city}
            </span>
          )}
          {workshop.bike_count > 0 && (
            <span className="flex items-center gap-0.5">
              <Wrench size={10} />
              {workshop.bike_count} Builds
            </span>
          )}
        </div>
        {workshop.services.length > 0 && (
          <div className="flex gap-1.5 mt-2 flex-wrap">
            {workshop.services.slice(0, 3).map((s) => (
              <span
                key={s}
                className="text-[10px] px-2 py-0.5 rounded-full font-medium
                           bg-[#06a5a5]/6 border border-[#06a5a5]/12 text-[#06a5a5]"
              >
                {s}
              </span>
            ))}
            {workshop.services.length > 3 && (
              <span className="text-[10px] text-[#222222]/20 self-center">
                +{workshop.services.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  )
}
