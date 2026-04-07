'use client'

import { useState } from 'react'
import { Lock } from 'lucide-react'
import { LoginModal } from '@/components/ui/LoginModal'

export default function PriceLoginButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <LoginModal isOpen={open} onClose={() => setOpen(false)} triggerContext="price_view" />
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 text-sm font-semibold text-[#222222] bg-[#F7F7F7] border border-[#EBEBEB] hover:border-[#DDDDDD] hover:text-[#06a5a5] px-4 py-2.5 rounded-xl transition-all cursor-pointer"
      >
        <Lock size={14} /> Preis anzeigen
      </button>
    </>
  )
}
