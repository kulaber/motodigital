'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'

interface Props {
  images: { url: string; alt?: string }[]
  aspectClass?: string
}

export default function SwipeableImages({ images, aspectClass = 'aspect-[4/3]' }: Props) {
  const [idx, setIdx] = useState(0)
  const startX = useRef<number | null>(null)

  if (images.length === 0) return null

  function onTouchStart(e: React.TouchEvent) {
    startX.current = e.touches[0].clientX
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (startX.current === null) return
    const dx = e.changedTouches[0].clientX - startX.current
    startX.current = null
    if (Math.abs(dx) < 40) return
    if (dx < 0) setIdx(i => Math.min(i + 1, images.length - 1))
    else         setIdx(i => Math.max(i - 1, 0))
  }

  function prev(e: React.MouseEvent) {
    e.preventDefault(); e.stopPropagation()
    setIdx(i => Math.max(i - 1, 0))
  }

  function next(e: React.MouseEvent) {
    e.preventDefault(); e.stopPropagation()
    setIdx(i => Math.min(i + 1, images.length - 1))
  }

  return (
    <div
      className={`relative w-full ${aspectClass} overflow-hidden bg-[#F7F7F7] rounded-xl select-none`}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {images.map((img, i) => (
        <Image
          key={img.url}
          src={img.url}
          alt={img.alt ?? ''}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className={`object-cover transition-opacity duration-300 ${i === idx ? 'opacity-100' : 'opacity-0'}`}
          draggable={false}
          loading={i === 0 ? 'eager' : 'lazy'}
        />
      ))}

      {/* Arrows (desktop hover) */}
      {images.length > 1 && (
        <>
          {idx > 0 && (
            <button onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-6 h-6 bg-white/90 rounded-full shadow flex items-center justify-center z-10 opacity-0 group-hover:opacity-100 transition-opacity">
              <svg width="10" height="10" viewBox="0 0 10 10"><path d="M6.5 2L3.5 5l3 3" stroke="#222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
            </button>
          )}
          {idx < images.length - 1 && (
            <button onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 bg-white/90 rounded-full shadow flex items-center justify-center z-10 opacity-0 group-hover:opacity-100 transition-opacity">
              <svg width="10" height="10" viewBox="0 0 10 10"><path d="M3.5 2L6.5 5l-3 3" stroke="#222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
            </button>
          )}

          {/* Dots */}
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1 pointer-events-none">
            {images.map((img, i) => (
              <span key={img.url} className={`rounded-full transition-all ${i === idx ? 'w-3 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/50'}`} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
