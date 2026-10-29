'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from '@/i18n/navigation'
import { ChevronLeft } from 'lucide-react'
import { useIsProfileOwner } from './ProfileOwner'

interface Props {
  children: React.ReactNode
  slug: string
}

export default function MobileStickyBar({ children, slug }: Props) {
  // Owners reach their profile from the dashboard — no back button
  const hideBack = useIsProfileOwner(slug)
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)
  const hasHistoryRef = useRef(false)

  useEffect(() => {
    hasHistoryRef.current = window.history.length > 1
    function onScroll() { setScrolled(window.scrollY > 10) }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function handleBack() {
    if (hasHistoryRef.current) {
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
