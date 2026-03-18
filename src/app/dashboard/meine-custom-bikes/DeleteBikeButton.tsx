'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Trash2, Pencil } from 'lucide-react'

interface Props {
  bikeId: string
  editHref: string
  viewHref?: string
}

export default function BikeCardActions({ bikeId, editHref, viewHref }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    setDeleting(true)
    await (supabase.from('bikes') as any).delete().eq('id', bikeId)
    router.refresh()
  }

  if (confirming) {
    return (
      <div className="flex gap-2 w-full">
        <button
          onClick={() => setConfirming(false)}
          className="flex-1 text-xs font-semibold py-2 rounded-full border border-[#222222]/10 text-[#222222]/40 hover:text-[#222222] transition-colors cursor-pointer"
        >
          Abbrechen
        </button>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="flex-1 text-xs font-semibold py-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50 cursor-pointer"
        >
          {deleting ? '…' : 'Löschen'}
        </button>
      </div>
    )
  }

  if (viewHref) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href={viewHref}
          className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2 rounded-full border border-[#06a5a5]/30 text-[#06a5a5] hover:bg-[#06a5a5]/5 transition-colors cursor-pointer"
        >
          Ansehen →
        </Link>
        <Link
          href={editHref}
          className="w-8 h-8 rounded-full flex items-center justify-center border border-[#222222]/10 text-[#222222]/50 hover:border-[#222222]/25 hover:text-[#222222] transition-colors cursor-pointer flex-shrink-0"
        >
          <Pencil size={13} />
        </Link>
        <button
          onClick={() => setConfirming(true)}
          className="w-8 h-8 rounded-full flex items-center justify-center text-[#222222]/25 hover:text-red-500 hover:bg-red-500/8 transition-all cursor-pointer flex-shrink-0"
        >
          <Trash2 size={13} />
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href={editHref}
        className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2 rounded-full border border-[#222222]/10 text-[#222222]/50 hover:border-[#222222]/25 hover:text-[#222222] transition-colors cursor-pointer"
      >
        <Pencil size={11} /> Bearbeiten
      </Link>
      <button
        onClick={() => setConfirming(true)}
        className="w-8 h-8 rounded-full flex items-center justify-center text-[#222222]/25 hover:text-red-500 hover:bg-red-500/8 transition-all cursor-pointer flex-shrink-0"
      >
        <Trash2 size={13} />
      </button>
    </div>
  )
}
