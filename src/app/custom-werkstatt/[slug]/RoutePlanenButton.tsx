'use client'

import { Navigation } from 'lucide-react'

interface Props {
  adresse: string
}

export default function RoutePlanenButton({ adresse }: Props) {
  function handleClick() {
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
