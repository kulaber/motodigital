'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Trash2, Pencil, Eye } from 'lucide-react'
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal'
import { deleteOwnBike } from '@/lib/actions/bikes'

// ── Publish toggle ────────────────────────────────────────────────────────────
export function PublishToggle({ bikeId, initialStatus }: { bikeId: string; initialStatus: string }) {
  const supabase = createClient()
  const [published, setPublished] = useState(initialStatus === 'active')
  const [toggling, setToggling] = useState(false)

  async function handleToggle() {
    setToggling(true)
    const newStatus = published ? 'draft' : 'active'
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('bikes') as any).update({ status: newStatus }).eq('id', bikeId)
    setPublished(!published)
    setToggling(false)
  }

  return (
    <button
      onClick={handleToggle}
      disabled={toggling}
      className="flex items-center gap-2 cursor-pointer disabled:opacity-60 group/toggle"
    >
      <span className={`text-xs font-semibold whitespace-nowrap transition-colors ${
        published ? 'text-[#06a5a5]' : 'text-[#222222]/30 group-hover/toggle:text-[#222222]/55'
      }`}>
        Veröffentlichen
      </span>
      <div
        className={`relative flex-shrink-0 rounded-full transition-colors duration-200 ${published ? 'bg-[#06a5a5]' : 'bg-[#222222]/15'}`}
        style={{ width: 36, height: 22 }}
      >
        <span
          className="absolute top-[3px] left-[3px] bg-white rounded-full shadow-sm transition-transform duration-200"
          style={{ width: 16, height: 16, transform: published ? 'translateX(14px)' : 'translateX(0)' }}
        />
      </div>
    </button>
  )
}

// ── Action buttons ────────────────────────────────────────────────────────────
interface Props {
  bikeId: string
  editHref: string
  viewHref?: string
}

export default function BikeCardActions({ bikeId, editHref, viewHref }: Props) {
  const router = useRouter()
  const [modalOpen, setModalOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    setDeleting(true)
    await deleteOwnBike(bikeId)
    setModalOpen(false)
    router.refresh()
  }

  return (
    <>
      <DeleteConfirmModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Möchtest du dieses Bike wirklich löschen?"
      />
      <div className="flex items-center gap-2">
        {viewHref && (
          <Link
            href={viewHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-[13px] font-semibold px-4 py-2 rounded-full border border-[#222222]/10 text-[#222222]/50 hover:border-[#222222]/25 hover:text-[#222222] transition-colors whitespace-nowrap"
          >
            <Eye size={13} /> Ansehen
          </Link>
        )}
        <Link
          href={editHref}
          className="flex items-center gap-1.5 text-[13px] font-semibold px-4 py-2 rounded-full bg-[#222222] text-white hover:bg-[#444] transition-colors whitespace-nowrap"
        >
          <Pencil size={13} /> Bearbeiten
        </Link>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 text-[13px] font-semibold px-4 py-2 rounded-full border border-[#222222]/10 text-[#222222]/30 hover:border-red-200 hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer whitespace-nowrap"
        >
          <Trash2 size={13} /> Löschen
        </button>
      </div>
    </>
  )
}
