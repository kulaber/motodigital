'use client'

import dynamic from 'next/dynamic'

const MiniMap = dynamic(() => import('@/components/map/MiniMap'), { ssr: false })

interface Props {
  lat?: number
  lng?: number
  city: string
  visitedCities?: { name: string; lat: number; lng: number }[]
  riderName?: string
}

export default function RiderMapClient({ lat, lng, city, visitedCities, riderName }: Props) {
  return <MiniMap lat={lat} lng={lng} locationName={city} visitedCities={visitedCities} riderName={riderName} />
}
