'use client'

import dynamic from 'next/dynamic'

const MiniMap = dynamic(() => import('@/components/map/MiniMap'), { ssr: false })

interface Props {
  lat: number
  lng: number
  city: string
}

export default function RiderMapClient({ lat, lng, city }: Props) {
  return <MiniMap lat={lat} lng={lng} locationName={city} />
}
