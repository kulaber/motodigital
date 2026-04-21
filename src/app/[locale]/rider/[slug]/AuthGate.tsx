'use client'

import { useState } from 'react'
import { useRouter } from '@/i18n/navigation'
import { LoginModal } from '@/components/ui/LoginModal'
import Header from '@/components/layout/Header'

export default function AuthGate() {
  const [open, setOpen] = useState(true)
  const router = useRouter()

  return (
    <div className="min-h-screen bg-white">
      <Header activePage="explore" />
      <LoginModal
        isOpen={open}
        onClose={() => {
          setOpen(false)
          router.back()
        }}
      />
    </div>
  )
}
