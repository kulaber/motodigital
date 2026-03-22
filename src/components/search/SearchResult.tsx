import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export type SearchResultType = 'bike' | 'workshop' | 'event'

export interface SearchResultItem {
  id: string
  type: SearchResultType
  title: string
  subtitle: string
  href: string
  imageUrl?: string
}

const BADGE_CONFIG: Record<SearchResultType, { label: string; bg: string; text: string }> = {
  bike:     { label: 'Bike',      bg: 'bg-[#06a5a5]', text: 'text-white' },
  workshop: { label: 'Werkstatt', bg: 'bg-[#1A1A1A]', text: 'text-white' },
  event:    { label: 'Event',     bg: 'bg-[#F59E0B]', text: 'text-white' },
}

interface SearchResultProps {
  item: SearchResultItem
  isActive: boolean
  onClick: () => void
}

export default function SearchResult({ item, isActive, onClick }: SearchResultProps) {
  const badge = BADGE_CONFIG[item.type]

  return (
    <Link
      href={item.href}
      role="option"
      aria-selected={isActive}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 px-4 py-2.5 transition-colors duration-100 cursor-pointer',
        isActive ? 'bg-[#222222]/5' : 'hover:bg-[#222222]/3'
      )}
    >
      {/* Thumbnail */}
      {item.imageUrl ? (
        <div className="relative w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 bg-[#F7F7F7]">
          <Image src={item.imageUrl} alt="" fill sizes="36px" className="object-cover" />
        </div>
      ) : (
        <div className="w-9 h-9 rounded-lg flex-shrink-0 bg-[#F7F7F7] flex items-center justify-center">
          <span className="text-[10px] font-bold text-[#222222]/20">
            {item.title.charAt(0).toUpperCase()}
          </span>
        </div>
      )}

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#222222] truncate leading-snug">{item.title}</p>
        <p className="text-xs text-[#222222]/40 truncate leading-snug">{item.subtitle}</p>
      </div>

      {/* Type badge */}
      <span className={cn(
        'text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide flex-shrink-0',
        badge.bg, badge.text,
      )}>
        {badge.label}
      </span>
    </Link>
  )
}
