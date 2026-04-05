'use client'

import { useRef, useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

const MiniMap = dynamic(() => import('@/components/map/MiniMap'), { ssr: false })

interface LazyMapProps {
  lat: number
  lng: number
  label?: string | null
}

export default function LazyMap({ lat, lng, label }: LazyMapProps) {
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
        <MiniMap lat={lat} lng={lng} locationName={label} />
      ) : (
        <div className="w-full h-[200px] bg-[#F0EDE4] rounded-xl animate-pulse" />
      )}
    </div>
  )
}
