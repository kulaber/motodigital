'use client'

import { useState } from 'react'
import { Play, X } from 'lucide-react'

type VideoItem = { url: string; title?: string }

export default function VideoGallery({ videos }: { videos: VideoItem[] }) {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {videos.map((item, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setOpen(i)}
            className="group relative rounded-xl overflow-hidden bg-[#F7F7F7] border border-[#222222]/5 text-left"
          >
            <div className="aspect-video w-full relative">
              <video
                src={item.url}
                className="w-full h-full object-cover"
                muted
                playsInline
                preload="metadata"
              />
              {/* Play overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                <div className="w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                  <Play size={18} className="text-[#222222] ml-0.5" fill="currentColor" />
                </div>
              </div>
            </div>
            {item.title && (
              <div className="px-3 py-2.5">
                <p className="text-xs text-[#222222]/60 font-medium flex items-center gap-1.5">
                  <Play size={10} className="text-[#717171]" /> {item.title}
                </p>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Modal */}
      {open !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setOpen(null)}
        >
          <div
            className="relative w-full max-w-4xl"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setOpen(null)}
              className="absolute -top-10 right-0 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <X size={16} className="text-white" />
            </button>
            <video
              key={open}
              src={videos[open].url}
              controls
              autoPlay
              className="w-full rounded-xl max-h-[80vh]"
            />
            {videos[open].title && (
              <p className="mt-3 text-sm text-white/60 text-center">{videos[open].title}</p>
            )}
          </div>
        </div>
      )}
    </>
  )
}
