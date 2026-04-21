'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from '@/i18n/navigation'

export default function PageViewTracker() {
  const pathname = usePathname()
  const lastPath = useRef('')

  useEffect(() => {
    if (pathname === lastPath.current) return
    lastPath.current = pathname

    // Skip dashboard/api/auth routes
    if (
      pathname.startsWith('/dashboard') ||
      pathname.startsWith('/api') ||
      pathname.startsWith('/auth') ||
      pathname.startsWith('/admin')
    ) return

    fetch('/api/pageview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: pathname,
        referrer: document.referrer || null,
      }),
    }).catch(() => {})
  }, [pathname])

  return null
}
