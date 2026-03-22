// Light Mode only — no dark: classes
'use client'

import { useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, BadgeCheck, X } from 'lucide-react'
import type { Builder } from '@/lib/data/builders'

interface Props {
  builder: Builder
  onClose: () => void
}

export default function WorkshopBottomSheet({ builder, onClose }: Props) {
  const [dragging, setDragging] = useState(false)
  const [translateY, setTranslateY] = useState(0)
  const startY = useRef(0)

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY
    setDragging(true)
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const dy = e.touches[0].clientY - startY.current
    if (dy > 0) setTranslateY(dy)
  }, [])

  const handleTouchEnd = useCallback(() => {
    setDragging(false)
    if (translateY > 100) {
      onClose()
    } else {
      setTranslateY(0)
    }
  }, [translateY, onClose])

  const b = builder
  const coverImage = b.media?.find(m => m.type === 'image')?.url

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[998] bg-black/20"
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className="fixed bottom-0 left-0 right-0 z-[999] bg-white rounded-t-2xl shadow-lg"
        style={{
          transform: `translateY(${translateY}px)`,
          transition: dragging ? 'none' : 'transform 0.3s ease',
          maxHeight: '60vh',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-[#E5E5E5] rounded-full" />
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-[#F9F8F5] hover:bg-[#E5E5E5] transition-colors"
          aria-label="Schließen"
        >
          <X size={14} className="text-[#1A1A1A]" />
        </button>

        <div className="px-5 pb-5">
          <div className="flex gap-4">
            {/* Cover thumbnail */}
            {coverImage && (
              <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                <Image
                  src={coverImage}
                  alt={b.name}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </div>
            )}

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-1">
                <h3 className="text-[15px] font-bold text-[#1A1A1A] truncate">{b.name}</h3>
                {b.verified && <BadgeCheck size={14} className="text-[#2AABAB] flex-shrink-0" />}
              </div>

              <p className="text-xs text-[#6B6B6B] flex items-center gap-1 mb-1">
                <MapPin size={10} className="flex-shrink-0" />
                <span className="truncate">{b.city}{b.specialty ? ` · ${b.specialty}` : ''}</span>
              </p>

            </div>
          </div>

          {/* Bio snippet */}
          {b.bio && (
            <p className="text-[13px] text-[#6B6B6B] leading-relaxed mt-3 line-clamp-2">{b.bio}</p>
          )}

          {/* CTA */}
          <Link
            href={`/custom-werkstatt/${b.slug}`}
            className="mt-4 w-full flex items-center justify-center gap-1.5 bg-[#2AABAB] hover:bg-[#239494] text-white text-sm font-semibold px-5 py-3 rounded-full transition-colors"
          >
            Profil ansehen →
          </Link>
        </div>
      </div>
    </>
  )
}
