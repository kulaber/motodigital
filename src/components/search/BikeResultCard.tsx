import Link from 'next/link'
import Image from 'next/image'
import type { BikeResult } from '@/lib/actions/search'

export function BikeResultCard({ bike }: { bike: BikeResult }) {
  return (
    <Link
      href={`/custom-bike/${bike.slug}`}
      className="flex items-center gap-3 p-3 rounded-2xl
                 bg-white border border-[#222222]/6
                 hover:border-[#222222]/15 hover:shadow-sm
                 transition-all active:scale-[0.99]"
    >
      {/* Thumbnail */}
      <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-[#F7F7F7]">
        {bike.cover_url ? (
          <Image
            src={bike.cover_url}
            alt={bike.title}
            width={64}
            height={64}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#222222]/10 text-xs">
            Kein Bild
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-[#222222] truncate">
          {bike.title}
        </div>
        <div className="text-xs text-[#222222]/40 mt-0.5">
          {bike.make} {bike.model} · {bike.year}
          {bike.city && ` · ${bike.city}`}
        </div>
        <div className="flex items-center gap-2 mt-1">
          {bike.style && (
            <span className="text-[10px] px-2 py-0.5 rounded-full
                             bg-[#06a5a5]/8 border border-[#06a5a5]/15 text-[#06a5a5] font-medium">
              {bike.style}
            </span>
          )}
          {!bike.price_on_request && bike.price > 0 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full
                             bg-[#222222]/4 border border-[#222222]/8 text-[#222222]/45 font-medium">
              {bike.price.toLocaleString('de-DE')} €
            </span>
          )}
          {bike.price_on_request && (
            <span className="text-[10px] px-2 py-0.5 rounded-full
                             bg-[#222222]/4 border border-[#222222]/8 text-[#222222]/45 font-medium">
              Auf Anfrage
            </span>
          )}
        </div>
      </div>

      {/* Owner */}
      <div className="flex-shrink-0 text-right hidden sm:block">
        <div className="text-[10px] text-[#222222]/30 truncate max-w-[80px]">
          {bike.owner_name}
        </div>
        <div className="text-[10px] text-[#222222]/20">
          {bike.owner_type === 'workshop' ? 'Werkstatt' : 'Rider'}
        </div>
      </div>
    </Link>
  )
}
