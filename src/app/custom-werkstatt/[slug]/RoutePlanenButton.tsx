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
      className="md:hidden flex items-center gap-2 text-xs font-medium text-[#717171] hover:text-[#222222] border border-[#EBEBEB] hover:border-[#DDDDDD] px-3.5 py-2 rounded-full transition-colors mt-2"
    >
      <Navigation size={12} />
      Route planen
    </button>
  )
}
