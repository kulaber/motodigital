'use client'

import { useEffect, useRef } from 'react'

export default function HeroVideo() {
  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const v = ref.current
    if (!v) return
    // React/SSR can drop the `muted` attribute; unmuted autoplay is blocked
    // everywhere, so set it explicitly before calling play().
    v.muted = true
    v.play().catch(() => {
      // Autoplay blocked (low-power mode, strict browser policy, etc.).
      // The poster stays visible — acceptable fallback.
    })
  }, [])

  return (
    <video
      ref={ref}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      poster="/custombike_intro_poster.webp"
      className="w-full aspect-[9/12] sm:aspect-[16/9] lg:aspect-[21/9] object-cover"
    >
      <source src="/custombike_intro_optimized.mp4" type="video/mp4" />
    </video>
  )
}
