'use client'

import { useRef, useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

const RideRouteMap = dynamic(() => import('@/components/map/RideRouteMap'), { ssr: false })

interface RideStop {
  name: string
  lon: number
  lat: number
}

interface Props {
  stops: RideStop[]
}

export default function LazyRideMap({ stops }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '200px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref}>
      {visible ? (
        <RideRouteMap stops={stops} />
      ) : (
        <div className="w-full h-[320px] bg-[#F0EDE4] rounded-xl animate-pulse" />
      )}
    </div>
  )
}
