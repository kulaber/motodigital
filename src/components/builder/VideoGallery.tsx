'use client'

import { useState, useEffect } from 'react'
import { Play, X } from 'lucide-react'

type VideoItem = { url: string; title?: string }

export default function VideoGallery({ videos }: { videos: VideoItem[] }) {
  const [open, setOpen] = useState<number | null>(null)

  useEffect(() => {
    if (open === null) return
    document.body.style.overflow = 'hidden'
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') setOpen(null) }
    window.addEventListener('keydown', onKey)
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey) }
  }, [open])

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {videos.map((item, i) => (
          <button
            key={item.url}
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/88 backdrop-blur-md p-4"
          onClick={() => setOpen(null)}
        >
          {/* Close button — fixed top-right, always visible */}
          <button
            onClick={() => setOpen(null)}
            className="fixed top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center transition-all hover:scale-105"
          >
            <X size={16} className="text-white" />
          </button>

          {/* Wrapper shrinks to video size → controls align with video edges */}
          <div
            className="relative flex flex-col items-center w-fit max-w-[92vw]"
            onClick={e => e.stopPropagation()}
          >
            <video
              key={open}
              src={videos[open].url}
              controls
              autoPlay
              playsInline
              className="block max-h-[85vh] max-w-[92vw] w-auto h-auto rounded-2xl shadow-2xl"
            />
            {videos[open].title && (
              <p className="mt-3 text-xs font-medium text-white/40 tracking-widest uppercase text-center">
                {videos[open].title}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  )
}
