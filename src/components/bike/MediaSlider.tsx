'use client'

import { useRef, useState, useCallback } from 'react'
import Image from 'next/image'
import { Play } from 'lucide-react'

export interface MediaItem {
  id: string
  url: string
  thumbnail_url: string | null
  media_type: 'image' | 'video'
  position: number
}

interface MediaSliderProps {
  items: MediaItem[]
  alt: string
  aspectClass?: string
}

export default function MediaSlider({ items, alt, aspectClass = 'aspect-[4/5]' }: MediaSliderProps) {
  const [idx, setIdx] = useState(0)
  const [playingVideo, setPlayingVideo] = useState<string | null>(null)
  const startX = useRef<number | null>(null)
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map())

  const setVideoRef = useCallback((id: string, el: HTMLVideoElement | null) => {
    if (el) videoRefs.current.set(id, el)
    else videoRefs.current.delete(id)
  }, [])

  if (items.length === 0) return null

  const current = items[idx]
  const multi = items.length > 1

  function onTouchStart(e: React.TouchEvent) {
    startX.current = e.touches[0].clientX
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (startX.current === null) return
    const dx = e.changedTouches[0].clientX - startX.current
    startX.current = null
    if (Math.abs(dx) < 40) return
    navigate(dx < 0 ? 1 : -1)
  }

  function navigate(dir: number) {
    // Pause any playing video when navigating away
    if (playingVideo) {
      const vid = videoRefs.current.get(playingVideo)
      if (vid) { vid.pause(); vid.currentTime = 0 }
      setPlayingVideo(null)
    }
    setIdx(i => Math.max(0, Math.min(i + dir, items.length - 1)))
  }

  function prev(e: React.MouseEvent) {
    e.preventDefault(); e.stopPropagation()
    navigate(-1)
  }

  function next(e: React.MouseEvent) {
    e.preventDefault(); e.stopPropagation()
    navigate(1)
  }

  function handleVideoToggle(e: React.MouseEvent, item: MediaItem) {
    e.preventDefault(); e.stopPropagation()
    const vid = videoRefs.current.get(item.id)
    if (!vid) return

    if (playingVideo === item.id) {
      vid.pause()
      setPlayingVideo(null)
    } else {
      vid.play()
      setPlayingVideo(item.id)
    }
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowLeft') { e.preventDefault(); navigate(-1) }
    if (e.key === 'ArrowRight') { e.preventDefault(); navigate(1) }
  }

  // Instagram-style dots: max 5 visible, collapse the rest
  function renderDots() {
    const total = items.length
    if (total <= 5) {
      return items.map((item, i) => (
        <span
          key={item.id}
          className={`rounded-full transition-all ${
            i === idx ? 'w-[7px] h-[7px] bg-white' : 'w-[5px] h-[5px] bg-white/50'
          }`}
        />
      ))
    }

    // Show window of 5 dots centered on current index
    let start = Math.max(0, idx - 2)
    const end = Math.min(total, start + 5)
    start = Math.max(0, end - 5)

    return items.slice(start, end).map((item, i) => {
      const realIdx = start + i
      const distance = Math.abs(realIdx - idx)
      const isActive = realIdx === idx
      const isEdge = distance >= 2 && (realIdx === start || realIdx === end - 1)

      return (
        <span
          key={item.id}
          className={`rounded-full transition-all ${
            isActive
              ? 'w-[7px] h-[7px] bg-white'
              : isEdge
                ? 'w-[4px] h-[4px] bg-white/30'
                : 'w-[5px] h-[5px] bg-white/50'
          }`}
        />
      )
    })
  }

  return (
    <div
      className={`relative w-full ${aspectClass} overflow-hidden bg-[#F7F7F7] select-none`}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onKeyDown={onKeyDown}
      tabIndex={0}
    >
      {items.map((item, i) => {
        const isVisible = i === idx

        if (item.media_type === 'video') {
          return (
            <div
              key={item.id}
              className={`absolute inset-0 transition-opacity duration-300 ${isVisible ? 'opacity-100 z-[1]' : 'opacity-0 z-0 pointer-events-none'}`}
            >
              <video
                ref={el => setVideoRef(item.id, el)}
                src={item.url}
                poster={item.thumbnail_url ?? undefined}
                muted
                loop
                playsInline
                preload={item.thumbnail_url ? 'none' : 'metadata'}
                className="w-full h-full object-cover"
              />
              {/* Play button overlay */}
              {playingVideo !== item.id && isVisible && (
                <button
                  onClick={(e) => handleVideoToggle(e, item)}
                  className="absolute inset-0 flex items-center justify-center z-[2]"
                >
                  <div className="w-12 h-12 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <Play size={20} className="text-white ml-0.5" fill="white" />
                  </div>
                </button>
              )}
              {/* Tap to pause when playing */}
              {playingVideo === item.id && isVisible && (
                <button
                  onClick={(e) => handleVideoToggle(e, item)}
                  className="absolute inset-0 z-[2]"
                />
              )}
            </div>
          )
        }

        return (
          <Image
            key={item.id}
            src={item.url}
            alt={i === 0 ? alt : `${alt} ${i + 1}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className={`object-cover transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
            draggable={false}
            loading={i === 0 ? 'eager' : 'lazy'}
          />
        )
      })}

      {/* Arrows (desktop hover) */}
      {multi && (
        <>
          {idx > 0 && (
            <button
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/80 backdrop-blur-sm rounded-full shadow flex items-center justify-center z-10 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <svg width="10" height="10" viewBox="0 0 10 10">
                <path d="M6.5 2L3.5 5l3 3" stroke="#222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
            </button>
          )}
          {idx < items.length - 1 && (
            <button
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/80 backdrop-blur-sm rounded-full shadow flex items-center justify-center z-10 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <svg width="10" height="10" viewBox="0 0 10 10">
                <path d="M3.5 2L6.5 5l-3 3" stroke="#222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
            </button>
          )}

          {/* Dots */}
          <div className="absolute bottom-2.5 left-0 right-0 flex justify-center gap-1 pointer-events-none z-10">
            {renderDots()}
          </div>
        </>
      )}
    </div>
  )
}
