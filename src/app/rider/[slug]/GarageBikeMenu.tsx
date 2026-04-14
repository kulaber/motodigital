'use client'

import { useState, useRef, useEffect } from 'react'
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Props {
  bikeId: string
}

export default function GarageBikeMenu({ bikeId }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    if (!open) return
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [open])

  return (
    <div className="relative z-20" ref={ref}>
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(v => !v) }}
        className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/50 hover:bg-white/20 hover:text-white transition-colors"
      >
        <MoreHorizontal size={16} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-2xl shadow-black/20 border border-[#222222]/8 overflow-hidden w-44 z-50">
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); router.push(`/bikes/${bikeId}/edit`); setOpen(false) }}
            className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-[#222222] hover:bg-[#F7F7F7] transition-colors"
          >
            <Pencil size={14} className="text-[#222222]/40" />
            Bearbeiten
          </button>
          <div className="h-px bg-[#222222]/6 mx-3" />
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(false) }}
            className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-red-50 transition-colors"
          >
            <Trash2 size={14} />
            Löschen
          </button>
        </div>
      )}
    </div>
  )
}
