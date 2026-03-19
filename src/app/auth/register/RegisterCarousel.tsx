'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

const SLIDES = [
  {
    src: '/custom-werkstatt.png',
    label: 'Custom Werkstatt',
    sub: 'Deine Builds. Deine Kunden.',
  },
  {
    src: '/rider.png',
    label: 'Rider',
    sub: 'Entdecke. Kauf. Erlebe.',
  },
  {
    src: '/custom-bikes.png',
    label: 'Custom Bikes',
    sub: 'Handgefertigte Einzelstücke.',
  },
]

// Fake avatars — initials + teal/gray
const AVATARS = [
  { initials: 'JK', teal: true },
  { initials: 'MS', teal: true },
  { initials: 'TH', teal: false },
  { initials: 'FR', teal: false },
  { initials: 'AK', teal: true },
  { initials: 'LM', teal: false },
]

export default function RegisterCarousel() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setCurrent(i => (i + 1) % SLIDES.length)
    }, 3500)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="relative flex flex-col">

      {/* Image carousel */}
      <div className="relative h-52 rounded-2xl overflow-hidden bg-[#1a1a1a]">
        {SLIDES.map((slide, i) => (
          <div
            key={slide.src}
            className="absolute inset-0 transition-opacity duration-700 flex items-center justify-center"
            style={{ opacity: i === current ? 1 : 0 }}
          >
            <Image
              src={slide.src}
              alt={slide.label}
              fill
              sizes="420px"
              className="object-contain"
              priority={i === 0}
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)' }} />
            {/* Label */}
            <div className="absolute bottom-4 left-4">
              <p className="text-white font-bold text-base leading-tight">{slide.label}</p>
              <p className="text-white/50 text-xs mt-0.5">{slide.sub}</p>
            </div>
          </div>
        ))}

        {/* Dot indicators */}
        <div className="absolute bottom-4 right-4 flex gap-1.5 z-10">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === current ? 'w-5 bg-white' : 'w-1.5 bg-white/30'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Community avatars */}
      <div className="mt-5">
        <p className="text-xs text-white/30 mb-3">Bereits dabei</p>
        <div className="flex items-center gap-2">
          {AVATARS.map((a, i) => (
            <div
              key={i}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 border-2 border-[#111111] ${
                a.teal
                  ? 'bg-[#06a5a5]/30 text-[#06a5a5] ring-1 ring-[#06a5a5]/20'
                  : 'bg-white/10 text-white/60'
              }`}
              style={{ marginLeft: i > 0 ? '-6px' : 0 }}
            >
              {a.initials}
            </div>
          ))}
          <span className="text-xs text-white/30 ml-3">+120 Nutzer</span>
        </div>
      </div>
    </div>
  )
}
