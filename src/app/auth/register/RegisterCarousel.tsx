'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

const SLIDES = [
  { src: '/custom-werkstatt.png', alt: 'Custom Werkstatt' },
  { src: '/rider.png', alt: 'Rider' },
  { src: '/custom-bikes.png', alt: 'Custom Bikes' },
]

export default function RegisterCarousel() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setCurrent(i => (i + 1) % SLIDES.length), 4000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {SLIDES.map((slide, i) => (
        <div
          key={slide.src}
          className="absolute inset-0 flex items-center justify-center transition-opacity duration-1000 ease-in-out"
          style={{ opacity: i === current ? 1 : 0 }}
        >
          <Image
            src={slide.src}
            alt={slide.alt}
            width={700}
            height={525}
            className="w-[80%] max-w-[580px] h-auto object-contain"
            priority={i === 0}
          />
        </div>
      ))}

      {/* Dot indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              i === current ? 'w-6 bg-[#06a5a5]' : 'w-1.5 bg-white/20'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
