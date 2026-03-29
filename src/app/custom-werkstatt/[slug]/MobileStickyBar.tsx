'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

interface Props {
  children: React.ReactNode
}

export default function MobileStickyBar({ children }: Props) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > 10) }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className={`sm:hidden sticky top-16 z-30 -mb-14 px-3 py-2 flex items-center justify-between transition-colors duration-200 ${scrolled ? 'bg-white shadow-sm' : ''}`}>
      <Link
        href="/custom-werkstatt"
        className={`w-10 h-10 flex items-center justify-center rounded-full transition-all ${scrolled ? 'bg-[#F0F0F0] text-[#222]' : 'bg-white/90 shadow-md text-[#222] hover:bg-white'}`}
        aria-label="Zurück"
      >
        <ChevronLeft size={20} />
      </Link>
      <div className="flex items-center gap-2">
        {children}
      </div>
    </div>
  )
}
