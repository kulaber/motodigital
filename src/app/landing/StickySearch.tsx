'use client'

import { useRef, useState, useEffect } from 'react'
import GlobalSearch from '@/components/search/GlobalSearch'

export default function StickySearch() {
  const sentinelRef = useRef<HTMLDivElement>(null)
  const [stuck, setStuck] = useState(false)
  const [focused, setFocused] = useState(false)

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return
    const observer = new IntersectionObserver(
      ([entry]) => setStuck(!entry.isIntersecting),
      { threshold: 0 },
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [])

  const collapsed = stuck && !focused

  return (
    <>
      <div ref={sentinelRef} className="h-0" />
      <section className="sticky top-12 lg:top-16 z-40 py-3 sm:py-4 lg:py-5">
        <div
          onFocusCapture={() => setFocused(true)}
          onBlurCapture={() => setFocused(false)}
          className={`mx-auto px-4 sm:px-5 lg:px-8 transition-all duration-300 ease-in-out ${
            collapsed ? 'max-w-sm sm:max-w-md' : 'max-w-7xl'
          }`}
        >
          <GlobalSearch dropUp />
        </div>
      </section>
    </>
  )
}
