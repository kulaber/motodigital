'use client'

import dynamic from 'next/dynamic'

const EventMap = dynamic(() => import('@/components/events/EventMap'), { ssr: false })

export default function EventLocationMap({ lat, lng, locationName }: { lat: number; lng: number; locationName: string }) {
  return <EventMap lat={lat} lng={lng} locationName={locationName} />
}
