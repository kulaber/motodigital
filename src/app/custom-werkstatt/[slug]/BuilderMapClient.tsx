'use client'

import dynamic from 'next/dynamic'

const BuilderMap = dynamic(() => import('@/components/builder/BuilderMap'), { ssr: false })

export default function BuilderMapClient(props: {
  lat: number
  lng: number
  name: string
  address?: string | null
}) {
  return <BuilderMap {...props} />
}
