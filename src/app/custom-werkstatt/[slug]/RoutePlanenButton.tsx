'use client'

import { Navigation } from 'lucide-react'
import { track } from '@/lib/track'

interface Props {
  adresse: string
  workshopId?: string | null
  builderId?: string | null
}

export default function RoutePlanenButton({ adresse, workshopId, builderId }: Props) {
  function handleClick() {
    if (workshopId) {
      track({ event_type: 'route_click', target_type: 'workshop', target_id: builderId ?? undefined, workshop_id: workshopId })
    }
    const encoded = encodeURIComponent(adresse)
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    const url = isIOS
      ? `maps://maps.apple.com/?q=${encoded}`
      : `https://maps.google.com/?q=${encoded}`
    window.open(url, '_blank')
  }

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-2 text-xs font-semibold text-[#06a5a5] hover:text-[#058f8f] border border-[#06a5a5]/20 hover:border-[#06a5a5]/40 bg-[#06a5a5]/5 hover:bg-[#06a5a5]/10 px-3.5 py-2 rounded-full transition-colors flex-shrink-0 whitespace-nowrap"
    >
      <Navigation size={12} />
      Route planen
    </button>
  )
}
