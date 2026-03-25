import Link from 'next/link'
import { MapPin, BadgeCheck } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import MediaSlider from './MediaSlider'
import type { MediaItem } from './MediaSlider'
import { generateBikeSlug } from '@/lib/utils/bikeSlug'
import type { Database } from '@/types/database'

type BikeRow = Database['public']['Tables']['bikes']['Row']
type Bike = Pick<BikeRow, 'id' | 'title' | 'price' | 'style' | 'year' | 'city' | 'mileage_km' | 'is_verified'> & {
  slug?: string | null
  bike_images?: { id?: string; url: string; is_cover: boolean; media_type?: 'image' | 'video'; thumbnail_url?: string | null; position?: number }[]
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
  const bikeHref = `/custom-bike/${bike.slug ?? generateBikeSlug(bike.title, bike.id)}`
  const images = bike.bike_images ?? []

  // Sort: cover first, then by position
  const sorted: MediaItem[] = [
    ...images.filter(i => i.is_cover),
    ...images.filter(i => !i.is_cover),
  ].map((i, idx) => ({
    id: i.id ?? `img-${idx}`,
    url: i.url,
    thumbnail_url: i.thumbnail_url ?? null,
    media_type: i.media_type ?? 'image',
    position: i.position ?? idx,
  }))

  return (
    <div className={`
      group rounded-2xl overflow-hidden bg-white
      border transition-all duration-200
      ${highlighted
        ? 'border-[#222222]/40 shadow-lg shadow-[#06a5a5]/10'
        : 'border-[#222222]/6 hover:border-[#222222]/15'
      }
    `}>
      {/* Media slider — outside Link so touch/video events work */}
      <Link href={bikeHref} className="block relative">
        {sorted.length > 0 ? (
          <div className="relative">
            <MediaSlider items={sorted} alt={`${bike.title}`} />
            {/* Style tag */}
            <span className="absolute top-2.5 left-2.5 bg-white/75 backdrop-blur-sm border border-[#222222]/15 text-[#222222] text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full pointer-events-none z-10">
              {STYLE_LABELS[bike.style] ?? bike.style}
            </span>
            {bike.is_verified && (
              <span className="absolute top-2.5 right-2.5 bg-[#222222]/90 text-white rounded-full p-0.5 pointer-events-none z-10">
                <BadgeCheck size={14} />
              </span>
            )}
          </div>
        ) : (
          <div className="aspect-[16/9] bg-[#F7F7F7] flex items-center justify-center rounded-t-2xl">
            <svg width="48" height="34" viewBox="0 0 48 34" fill="none">
              <circle cx="8" cy="26" r="7" stroke="#444" strokeWidth="1.5"/>
              <circle cx="40" cy="26" r="7" stroke="#444" strokeWidth="1.5"/>
              <path d="M8 26 L15 8 L24 11 L33 6 L40 26" stroke="#444" strokeWidth="1.5" fill="none" strokeLinejoin="round"/>
            </svg>
          </div>
        )}
      </Link>

      {/* Content — separate link */}
      <Link href={bikeHref} className="block p-3.5">
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
      </Link>
    </div>
  )
}
