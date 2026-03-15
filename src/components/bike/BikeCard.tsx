import Image from 'next/image'
import Link from 'next/link'
import { Star, MapPin, BadgeCheck } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import type { Database } from '@/types/database'

type Bike = Database['public']['Tables']['bikes']['Row'] & {
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
  const cover = bike.bike_images?.find(i => i.is_cover) ?? bike.bike_images?.[0]

  return (
    <Link
      href={`/bikes/${bike.id}`}
      className={`
        group block rounded-2xl overflow-hidden bg-bg-2
        border transition-all duration-200
        ${highlighted
          ? 'border-teal/40 shadow-lg shadow-teal/10'
          : 'border-creme/6 hover:border-creme/15'
        }
      `}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-bg-3">
        {cover ? (
          <Image
            src={cover.url}
            alt={bike.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            sizes="(max-width: 768px) 100vw, 400px"
          />
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
        <span className="absolute top-2.5 left-2.5 bg-bg/75 backdrop-blur-sm border border-creme/15 text-creme text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full">
          {STYLE_LABELS[bike.style] ?? bike.style}
        </span>
        {bike.is_verified && (
          <span className="absolute top-2.5 right-2.5 bg-teal/90 text-bg rounded-full p-0.5">
            <BadgeCheck size={14} />
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-3.5">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="text-sm font-semibold text-creme leading-snug line-clamp-1">
            {bike.title}
          </h3>
          <span className="text-sm font-semibold text-creme flex-shrink-0">
            {formatPrice(bike.price)}
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-creme/40">
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
