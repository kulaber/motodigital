'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { Play, Pause } from 'lucide-react'

interface PostVideoPlayerProps {
  url: string
  thumbnail_url: string | null
  alt: string
}

export default function PostVideoPlayer({ url, thumbnail_url, alt }: PostVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)
  const [aspectClass, setAspectClass] = useState('aspect-video')
  const [poster, setPoster] = useState<string | undefined>(thumbnail_url ?? undefined)
  const posterGenerated = useRef(false)

  // Detect orientation + generate canvas poster from the ACTUAL video element
  const handleLoadedMetadata = useCallback(() => {
    const video = videoRef.current
    if (!video) return

    const { videoWidth, videoHeight } = video
    if (videoWidth && videoHeight) {
      setAspectClass(videoWidth > videoHeight ? 'aspect-video' : 'aspect-[2/3]')
    }

    // Generate poster via canvas snapshot at t=0.1s if none provided
    if (!thumbnail_url && !posterGenerated.current) {
      posterGenerated.current = true
      video.currentTime = 0.1
    }
  }, [thumbnail_url])

  const handleSeeked = useCallback(() => {
    const video = videoRef.current
    if (!video || thumbnail_url) return

    try {
      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(video, 0, 0)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7)
        setPoster(dataUrl)
      }
    } catch {
      // Canvas tainted or other error — leave poster as-is
    }
  }, [thumbnail_url])

  // Auto-pause when video leaves viewport
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting && !video.paused) {
          video.pause()
          setPlaying(false)
        }
      },
      { threshold: 0.25 }
    )

    observer.observe(video)
    return () => observer.disconnect()
  }, [])

  const togglePlay = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const video = videoRef.current
    if (!video) return

    if (video.paused) {
      const playPromise = video.play()
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Unmuted play blocked — try muted, then unmute after it starts
          video.muted = true
          video.play().then(() => {
            video.muted = false
          }).catch(() => {
            // Truly blocked — nothing we can do
            setPlaying(false)
          })
        })
      }
    } else {
      video.pause()
    }
  }, [])

  const handlePause = useCallback(() => setPlaying(false), [])
  const handlePlay = useCallback(() => setPlaying(true), [])

  return (
    <div className={`relative w-full ${aspectClass} bg-black overflow-hidden`}>
      <video
        ref={videoRef}
        src={url}
        poster={poster}
        muted={false}
        playsInline
        loop
        preload="metadata"
        className="w-full h-full object-cover"
        aria-label={alt}
        onLoadedMetadata={handleLoadedMetadata}
        onSeeked={handleSeeked}
        onPause={handlePause}
        onPlay={handlePlay}
      />

      {/* Play / Pause overlay button */}
      <button
        onClick={togglePlay}
        className="absolute inset-0 flex items-center justify-center z-[2] group/play"
        aria-label={playing ? 'Pause' : 'Play'}
      >
        <div
          className={`w-12 h-12 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center transition-opacity ${
            playing ? 'opacity-0 group-hover/play:opacity-100' : 'opacity-100'
          }`}
        >
          {playing ? (
            <Pause size={20} className="text-white" fill="white" />
          ) : (
            <Play size={20} className="text-white ml-0.5" fill="white" />
          )}
        </div>
      </button>
    </div>
  )
}
