'use client'

import { useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { useToast, ToastContainer } from '@/components/ui/Toast'

export default function UpgradeSuccessToast() {
  const searchParams = useSearchParams()
  const { toasts, success } = useToast()
  const shownRef = useRef(false)

  useEffect(() => {
    if (searchParams.get('upgrade') === 'success' && !shownRef.current) {
      shownRef.current = true
      success('Willkommen bei Premium! Deine Features sind jetzt freigeschaltet.')
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [searchParams, success])

  return <ToastContainer toasts={toasts} />
}
