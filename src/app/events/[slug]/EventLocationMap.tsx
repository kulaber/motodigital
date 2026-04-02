'use client'

import dynamic from 'next/dynamic'

const MiniMap = dynamic(() => import('@/components/map/MiniMap'), { ssr: false })

export default function EventLocationMap({ lat, lng, locationName }: { lat: number; lng: number; locationName: string }) {
  return <MiniMap lat={lat} lng={lng} locationName={locationName} />
}
