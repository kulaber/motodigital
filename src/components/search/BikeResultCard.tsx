import Link from 'next/link'
import Image from 'next/image'
import { MapPin } from 'lucide-react'
import type { BikeResult } from '@/lib/actions/search'

const STYLE_LABELS: Record<string, string> = {
  naked: 'Naked', cafe_racer: 'Cafe Racer', bobber: 'Bobber',
  scrambler: 'Scrambler', tracker: 'Tracker', chopper: 'Chopper',
  street: 'Street', enduro: 'Enduro', other: 'Basis-Bike',
}

export function BikeResultCard({ bike }: { bike: BikeResult }) {
  const priceLabel = bike.price_on_request
    ? 'Auf Anfrage'
    : bike.price > 0
      ? `${bike.price.toLocaleString('de-DE')} €`
      : null

  return (
    <Link
      href={`/custom-bike/${bike.slug}`}
      className="group rounded-2xl overflow-hidden bg-white
                 border border-[#222222]/6 hover:border-[#222222]/15
                 hover:shadow-sm transition-all"
    >
      {/* Cover image */}
      <div className="relative aspect-[16/10] bg-[#F7F7F7] overflow-hidden">
        {bike.cover_url ? (
          <Image
            src={bike.cover_url}
            alt={bike.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#222222]/10 text-xs">
            Kein Bild
          </div>
        )}
        {bike.style && (
          <span className="absolute top-2.5 left-2.5 bg-white/75 backdrop-blur-sm border border-[#222222]/15 text-[#222222] text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full">
            {STYLE_LABELS[bike.style] ?? bike.style}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-3.5">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="text-sm font-semibold text-[#222222] leading-snug line-clamp-1">
            {bike.title}
          </h3>
          {priceLabel && (
            <span className="text-sm font-semibold text-[#222222] flex-shrink-0">
              {priceLabel}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs text-[#222222]/40">
          <span>{bike.make} {bike.model}</span>
          <span>{bike.year}</span>
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
