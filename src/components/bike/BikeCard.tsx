import Image from 'next/image'
import Link from 'next/link'
import { MapPin, BadgeCheck } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import type { Database } from '@/types/database'

type BikeRow = Database['public']['Tables']['bikes']['Row']
type Bike = Pick<BikeRow, 'id' | 'title' | 'price' | 'style' | 'year' | 'city' | 'mileage_km' | 'is_verified'> & {
  bike_images?: { url: string; is_cover: boolean }[]
}

interface Props {
  bike: Bike
  highlighted?: boolean
}

const STYLE_LABELS: Record<string, string> = {
  naked: 'Naked', cafe_racer: 'Cafe Racer', bobber: 'Bobber',
  scrambler: 'Scrambler', tracker: 'Tracker', chopper: 'Chopper',
  street: 'Street', enduro: 'Enduro', other: 'Other',
}

export default function BikeCard({ bike, highlighted = false }: Props) {
  const images = bike.bike_images ?? []
  const sorted = [
    ...images.filter(i => i.is_cover),
    ...images.filter(i => !i.is_cover),
  ]

  return (
    <Link
      href={`/bikes/${bike.id}`}
      className={`
        group block rounded-2xl overflow-hidden bg-white
        border transition-all duration-200
        ${highlighted
          ? 'border-[#222222]/40 shadow-lg shadow-[#06a5a5]/10'
          : 'border-[#222222]/6 hover:border-[#222222]/15'
        }
      `}
    >
      {/* Swipeable image gallery */}
      <div className="relative aspect-[4/3] overflow-hidden bg-[#F7F7F7]">
        {sorted.length > 0 ? (
          <>
            {/* Scroll container */}
            <div
              className="flex h-full overflow-x-auto snap-x snap-mandatory scrollbar-none"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              onClick={e => e.preventDefault()}
            >
              {sorted.map((img, idx) => (
                <div key={idx} className="relative flex-shrink-0 w-full h-full snap-center">
                  <Image
                    src={img.url}
                    alt={`${bike.title} ${idx + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, 400px"
                    priority={idx === 0}
                  />
                </div>
              ))}
            </div>

            {/* Dot indicators — only if multiple images */}
            {sorted.length > 1 && (
              <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1 pointer-events-none">
                {sorted.map((_, idx) => (
                  <span
                    key={idx}
                    className="w-1.5 h-1.5 rounded-full bg-white/60"
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg width="48" height="34" viewBox="0 0 48 34" fill="none">
              <circle cx="8" cy="26" r="7" stroke="#444" strokeWidth="1.5"/>
              <circle cx="40" cy="26" r="7" stroke="#444" strokeWidth="1.5"/>
              <path d="M8 26 L15 8 L24 11 L33 6 L40 26"
                stroke="#444" strokeWidth="1.5" fill="none" strokeLinejoin="round"/>
            </svg>
          </div>
        )}

        {/* Style tag */}
        <span className="absolute top-2.5 left-2.5 bg-white/75 backdrop-blur-sm border border-[#222222]/15 text-[#222222] text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full pointer-events-none">
          {STYLE_LABELS[bike.style] ?? bike.style}
        </span>
        {bike.is_verified && (
          <span className="absolute top-2.5 right-2.5 bg-[#222222]/90 text-white rounded-full p-0.5 pointer-events-none">
            <BadgeCheck size={14} />
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-3.5">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="text-sm font-semibold text-[#222222] leading-snug line-clamp-1">
            {bike.title}
          </h3>
          <span className="text-sm font-semibold text-[#222222] flex-shrink-0">
            {formatPrice(bike.price)}
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-[#222222]/40">
          <span>{bike.year}</span>
          {bike.mileage_km && <span>{bike.mileage_km.toLocaleString('de-DE')} km</span>}
          {bike.city && (
            <span className="flex items-center gap-0.5">
              <MapPin size={10} />
              {bike.city}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
