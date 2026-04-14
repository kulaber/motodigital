'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'

interface Props {
  children: React.ReactNode
  hideBack?: boolean
}

export default function MobileStickyBar({ children, hideBack }: Props) {
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)
  const [hasHistory, setHasHistory] = useState(false)

  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > 10) }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setHasHistory(window.history.length > 1)
  }, [])

  function handleBack() {
    if (hasHistory) {
      router.back()
    } else {
      router.push('/custom-werkstatt')
    }
  }

  return (
    <div className={`sm:hidden sticky top-12 lg:top-16 z-30 -mb-14 px-3 py-2 flex items-center justify-between transition-colors duration-200 ${scrolled ? 'bg-white shadow-sm' : ''}`}>
      {!hideBack ? (
        <button
          type="button"
          onClick={handleBack}
          className={`w-10 h-10 flex items-center justify-center rounded-full transition-all ${scrolled ? 'bg-[#F0F0F0] text-[#222]' : 'bg-white/90 shadow-md text-[#222] hover:bg-white'}`}
          aria-label="Zurück"
        >
          <ChevronLeft size={20} />
        </button>
      ) : (
        <div />
      )}
      <div className="flex items-center gap-2">
        {children}
      </div>
    </div>
  )
}
