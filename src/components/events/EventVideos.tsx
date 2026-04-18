'use client'

import { useState } from 'react'
import { Play } from 'lucide-react'
import { youtubeId } from '@/lib/data/events'

interface Props {
  videos: string[]
  title: string
}

export default function EventVideos({ videos, title }: Props) {
  const [playing, setPlaying] = useState<Set<string>>(new Set())

  const valid = videos.map(url => ({ url, id: youtubeId(url) })).filter(v => v.id)
  if (valid.length === 0) return null

  function play(id: string) {
    setPlaying(prev => {
      const next = new Set(prev)
      next.add(id)
      return next
    })
  }

  return (
    <>
      <div className="mb-5">
        <h2 className="text-xl sm:text-2xl font-bold text-[#222222]" style={{ letterSpacing: '-0.02em' }}>
          Videos
        </h2>
        <p className="text-sm text-[#717171] mt-1">
          {valid.length === 1 ? 'Aftermovie' : `${valid.length} Aftermovies`}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {valid.map(({ id }) => {
          const isPlaying = playing.has(id!)
          return (
            <div
              key={id}
              className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black border border-[#222222]/6 group"
            >
              {isPlaying ? (
                <iframe
                  src={`https://www.youtube.com/embed/${id}?autoplay=1&rel=0`}
                  title={`${title} Video`}
                  allow="accelerated-2d-canvas; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                />
              ) : (
                <button
                  onClick={() => play(id!)}
                  className="absolute inset-0 w-full h-full cursor-pointer"
                  aria-label="Video abspielen"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://i.ytimg.com/vi/${id}/maxresdefault.jpg`}
                    alt={`${title} Video Thumbnail`}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    onError={(e) => {
                      // Fall back to hqdefault if maxres is not available
                      const img = e.currentTarget
                      if (!img.src.includes('hqdefault')) {
                        img.src = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
                      }
                    }}
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/95 shadow-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Play size={28} className="text-[#222222] ml-1" fill="#222222" />
                    </div>
                  </div>
                </button>
              )}
            </div>
          )
        })}
      </div>
    </>
  )
}
