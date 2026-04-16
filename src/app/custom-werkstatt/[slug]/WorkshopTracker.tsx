'use client'

import { useEffect } from 'react'
import { trackOnce } from '@/lib/track'

interface Props {
  workshopId: string
  builderId: string
}

/**
 * Tracks profile_view once per session when the workshop page loads.
 * Mounted inside the server-rendered workshop detail page.
 */
export default function WorkshopTracker({ workshopId, builderId }: Props) {
  useEffect(() => {
    trackOnce(
      {
        event_type: 'profile_view',
        target_type: 'workshop',
        target_id: builderId,
        workshop_id: workshopId,
      },
      `profile_view:${builderId}`,
    )
  }, [workshopId, builderId])

  return null
}
