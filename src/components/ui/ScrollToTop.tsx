'use client'

import { useEffect, useLayoutEffect } from 'react'
import { usePathname } from '@/i18n/navigation'

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

export default function ScrollToTop() {
  const pathname = usePathname()
  useIsomorphicLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname])
  return null
}
