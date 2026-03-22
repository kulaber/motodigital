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

  // Detect orientation from video dimensions + generate canvas poster if needed
  useEffect(() => {
    const video = document.createElement('video')
    video.preload = 'metadata'
    video.muted = true
    video.playsInline = true
    video.crossOrigin = 'anonymous'
    video.src = url

    video.onloadedmetadata = () => {
      const { videoWidth, videoHeight } = video
      if (videoWidth && videoHeight) {
        // landscape → 16:9, portrait/square → 2:3
        setAspectClass(videoWidth > videoHeight ? 'aspect-video' : 'aspect-[2/3]')
      }

      // Generate poster via canvas snapshot at t=0.1s if none provided
      if (!thumbnail_url) {
        video.currentTime = 0.1
      }
    }

    video.onseeked = () => {
      if (!thumbnail_url) {
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
          // CORS or other error — leave poster undefined
        }
      }
      // Clean up the probe video
      video.src = ''
      video.load()
    }

    video.onerror = () => {
      video.src = ''
      video.load()
    }

    return () => {
      video.src = ''
      video.load()
    }
  }, [url, thumbnail_url])

  // Auto-pause when video leaves viewport
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
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
      video.play()
      setPlaying(true)
    } else {
      video.pause()
      setPlaying(false)
    }
  }, [])

  const handleEnded = useCallback(() => setPlaying(false), [])
  const handlePause = useCallback(() => setPlaying(false), [])
  const handlePlay = useCallback(() => setPlaying(true), [])

  return (
    <div className={`relative w-full ${aspectClass} bg-black overflow-hidden`}>
      <video
        ref={videoRef}
        src={url}
        poster={poster}
        playsInline
        loop
        preload={poster ? 'none' : 'metadata'}
        className="w-full h-full object-cover"
        aria-label={alt}
        onEnded={handleEnded}
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
