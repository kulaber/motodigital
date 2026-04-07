'use client'

import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { RiderNavBar } from './RiderNavBar'
import { WerkstattNavBar } from './WerkstattNavBar'
import PostComposerSheet from '@/components/layout/PostComposerSheet'

/**
 * Role-aware bottom navigation wrapper.
 * Renders RiderNavBar or WerkstattNavBar based on the user's role.
 * PostComposerSheet is rendered alongside the rider nav (only riders have the FAB).
 */
export default function AppBottomNav() {
  const { user, role, loading } = useAuth()
  const pathname = usePathname()

  if (loading || !user) return null

  const isWerkstatt = role === 'custom-werkstatt'

  return (
    <>
      {/* PostComposerSheet — global, listens for 'open-post-composer' event */}
      {!isWerkstatt && <PostComposerSheet />}

      {/* Spacer — prevents content from being hidden behind the nav (skip dashboard pages which manage own layout) */}
      {!pathname.startsWith('/dashboard') && !pathname.startsWith('/werkstatt') && (
        <div className="block md:hidden" style={{ height: 96 }} />
      )}

      {/* Role-specific bottom navigation */}
      {isWerkstatt ? <WerkstattNavBar /> : <RiderNavBar />}
    </>
  )
}
