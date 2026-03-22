'use client'

import { useRef, useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { BadgeCheck } from 'lucide-react'
import type { Builder } from '@/lib/data/builders'

interface Props {
  builders: Builder[]
}

export default function BuilderCarousel({ builders }: Props) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [paused, setPaused] = useState(false)
  const [dragging, setDragging] = useState(false)
  const rafRef = useRef<number>(0)
  const posRef = useRef(0)

  // Duplicate items for seamless loop
  const items = [...builders, ...builders]

  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    const speed = 0.5 // px per frame

    function step() {
      if (!paused && !dragging && track) {
        posRef.current += speed
        // Reset when first set is fully scrolled
        const half = track.scrollWidth / 2
        if (posRef.current >= half) posRef.current -= half
        track.style.transform = `translateX(-${posRef.current}px)`
      }
      rafRef.current = requestAnimationFrame(step)
    }

    rafRef.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(rafRef.current)
  }, [paused, dragging])

  // Touch drag support for mobile
  const touchStartX = useRef(0)
  const touchStartPos = useRef(0)

  function onTouchStart(e: React.TouchEvent) {
    setDragging(true)
    touchStartX.current = e.touches[0].clientX
    touchStartPos.current = posRef.current
  }

  function onTouchMove(e: React.TouchEvent) {
    if (!dragging) return
    const delta = touchStartX.current - e.touches[0].clientX
    const track = trackRef.current
    if (!track) return
    const half = track.scrollWidth / 2
    let next = touchStartPos.current + delta
    if (next < 0) next += half
    if (next >= half) next -= half
    posRef.current = next
    track.style.transform = `translateX(-${posRef.current}px)`
  }

  function onTouchEnd() {
    setDragging(false)
  }

  return (
    <div
      className="relative py-3 overflow-hidden sm:fade-mask"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        ref={trackRef}
        className="flex gap-4 w-max cursor-default"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {items.map((b, i) => {
          const coverImg = b.media.find(m => m.type === 'image')?.url
          return (
            <Link
              key={`${b.slug}-${i}`}
              href={`/custom-werkstatt/${b.slug}`}
              className="group flex-shrink-0 w-72 bg-white border border-[#222222]/6 rounded-2xl overflow-hidden hover:border-[#DDDDDD] hover:shadow-lg hover:shadow-black/5 hover:-translate-y-1 transition-all duration-300 block"
            >
              {/* Cover image */}
              <div className="relative h-36 overflow-hidden bg-[#F7F7F7]">
                {coverImg ? (
                  <Image
                    src={coverImg}
                    alt={b.name}
                    fill
                    sizes="288px"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-[#DDDDDD]">{b.initials}</span>
                  </div>
                )}
                {b.featured && (
                  <span className="absolute top-2 left-2 text-[9px] font-bold uppercase tracking-widest bg-white/90 text-[#222222] px-2 py-0.5 rounded-full shadow-sm">
                    Top Builder
                  </span>
                )}
              </div>

              {/* Card body */}
              <div className="p-4">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-[#222222]/10 flex items-center justify-center text-xs font-bold text-[#717171] flex-shrink-0">
                    {b.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <p className="text-sm font-semibold text-[#222222] truncate">{b.name}</p>
                      {b.verified && <BadgeCheck size={11} className="text-[#717171] flex-shrink-0" />}
                    </div>
                    <p className="text-[10px] text-[#222222]/35 truncate">{b.city} · {b.tags.slice(0, 2).join(' · ')}</p>
                  </div>
                  <div className="flex items-center gap-0.5 flex-shrink-0">
                    <svg width="10" height="10" viewBox="0 0 14 14" fill="#06a5a5"><path d="M7 1L8.5 5.5H13L9.5 8L11 12L7 9.5L3 12L4.5 8L1 5.5H5.5Z"/></svg>
                    <span className="text-xs text-[#222222]/40 font-medium">{b.rating}</span>
                  </div>
                </div>

                <p className="text-xs text-[#222222]/40 leading-relaxed line-clamp-2 mb-3">{b.bio}</p>

                <div className="flex items-center justify-between pt-3 border-t border-[#222222]/6">
                  <span className="text-xs text-[#222222]/30 font-medium">{b.builds} Builds</span>
                  <span className="text-xs text-[#06a5a5] font-semibold opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">Profil →</span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      <style>{`
        @media (min-width: 640px) {
          .fade-mask {
            mask-image: linear-gradient(to right, transparent 0%, black 4%, black 96%, transparent 100%);
            -webkit-mask-image: linear-gradient(to right, transparent 0%, black 4%, black 96%, transparent 100%);
          }
        }
      `}</style>
    </div>
  )
}
