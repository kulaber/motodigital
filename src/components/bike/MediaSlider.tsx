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

export default function MediaSlider({ items, alt, aspectClass = 'aspect-[16/9]' }: MediaSliderProps) {
  const [idx, setIdx] = useState(0)
  const [dragPx, setDragPx] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [playingVideo, setPlayingVideo] = useState<string | null>(null)
  const startX = useRef<number | null>(null)
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map())

  const setVideoRef = useCallback((id: string, el: HTMLVideoElement | null) => {
    if (el) videoRefs.current.set(id, el)
    else videoRefs.current.delete(id)
  }, [])

  if (items.length === 0) return null

  const N = items.length
  const multi = N > 1
  // Each slide is (100/N)% of track width — which equals 100% of the container
  const slideW = 100 / N

  function pauseVideo(id: string) {
    const vid = videoRefs.current.get(id)
    if (vid) { vid.pause(); vid.currentTime = 0 }
  }

  function navigate(dir: number) {
    if (playingVideo) { pauseVideo(playingVideo); setPlayingVideo(null) }
    setIdx(i => Math.max(0, Math.min(i + dir, N - 1)))
    setDragPx(0)
  }

  // Rubber-band resistance when dragging past the first/last slide
  function rubberband(dx: number): number {
    if (idx === 0 && dx > 0) return dx * 0.3
    if (idx === N - 1 && dx < 0) return dx * 0.3
    return dx
  }

  function onTouchStart(e: React.TouchEvent) {
    startX.current = e.touches[0].clientX
    setDragging(false)
  }

  function onTouchMove(e: React.TouchEvent) {
    if (startX.current === null) return
    const dx = e.touches[0].clientX - startX.current
    setDragging(true)
    setDragPx(rubberband(dx))
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (startX.current === null) return
    const dx = e.changedTouches[0].clientX - startX.current
    startX.current = null
    setDragging(false)
    setDragPx(0)
    if (Math.abs(dx) >= 40) navigate(dx < 0 ? 1 : -1)
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowLeft') { e.preventDefault(); navigate(-1) }
    if (e.key === 'ArrowRight') { e.preventDefault(); navigate(1) }
  }

  function prev(e: React.MouseEvent) { e.preventDefault(); e.stopPropagation(); navigate(-1) }
  function next(e: React.MouseEvent) { e.preventDefault(); e.stopPropagation(); navigate(1) }

  function handleVideoToggle(e: React.MouseEvent, item: MediaItem) {
    e.preventDefault(); e.stopPropagation()
    const vid = videoRefs.current.get(item.id)
    if (!vid) return
    if (playingVideo === item.id) { vid.pause(); setPlayingVideo(null) }
    else { vid.play(); setPlayingVideo(item.id) }
  }

  // translateX: move film-strip so slide `idx` is visible, plus live drag offset
  // % is relative to track's own width (N * containerWidth), so (100/N)% = 1 slide = containerWidth
  const trackTransform = `translateX(calc(${-idx * slideW}% + ${dragPx}px))`

  function renderDots() {
    if (N <= 5) {
      return items.map((item, i) => (
        <span
          key={item.id}
          className={`rounded-full transition-all ${i === idx ? 'w-[7px] h-[7px] bg-white' : 'w-[5px] h-[5px] bg-white/50'}`}
        />
      ))
    }
    let start = Math.max(0, idx - 2)
    const end = Math.min(N, start + 5)
    start = Math.max(0, end - 5)
    return items.slice(start, end).map((item, i) => {
      const ri = start + i
      const isActive = ri === idx
      const isEdge = Math.abs(ri - idx) >= 2 && (ri === start || ri === end - 1)
      return (
        <span
          key={item.id}
          className={`rounded-full transition-all ${isActive ? 'w-[7px] h-[7px] bg-white' : isEdge ? 'w-[4px] h-[4px] bg-white/30' : 'w-[5px] h-[5px] bg-white/50'}`}
        />
      )
    })
  }

  return (
    <div
      className={`relative w-full ${aspectClass} overflow-hidden bg-[#F7F7F7] select-none`}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onKeyDown={onKeyDown}
      tabIndex={0}
    >
      {/* Horizontal film-strip: all slides laid out side-by-side */}
      <div
        className="absolute top-0 left-0 h-full flex"
        style={{
          width: `${N * 100}%`,
          transform: trackTransform,
          transition: dragging ? 'none' : 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        }}
      >
        {items.map((item, i) => (
          <div
            key={item.id}
            className="relative h-full flex-shrink-0"
            style={{ width: `${slideW}%` }}
          >
            {item.media_type === 'video' ? (
              <>
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
                {playingVideo !== item.id && (
                  <button
                    onClick={(e) => handleVideoToggle(e, item)}
                    className="absolute inset-0 flex items-center justify-center z-[2]"
                  >
                    <div className="w-12 h-12 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <Play size={20} className="text-white ml-0.5" fill="white" />
                    </div>
                  </button>
                )}
                {playingVideo === item.id && (
                  <button onClick={(e) => handleVideoToggle(e, item)} className="absolute inset-0 z-[2]" />
                )}
              </>
            ) : (
              <Image
                src={item.url}
                alt={i === 0 ? alt : `${alt} ${i + 1}`}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover"
                draggable={false}
                loading={i === 0 ? 'eager' : 'lazy'}
              />
            )}
          </div>
        ))}
      </div>

      {/* Arrows (visible on desktop hover via parent group) */}
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
          {idx < N - 1 && (
            <button
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/80 backdrop-blur-sm rounded-full shadow flex items-center justify-center z-10 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <svg width="10" height="10" viewBox="0 0 10 10">
                <path d="M3.5 2L6.5 5l-3 3" stroke="#222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
            </button>
          )}

          {/* Instagram-style indicator dots */}
          <div className="absolute bottom-2.5 left-0 right-0 flex justify-center gap-1 pointer-events-none z-10">
            {renderDots()}
          </div>
        </>
      )}
    </div>
  )
}
