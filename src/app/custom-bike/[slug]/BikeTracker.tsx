'use client'

import { useEffect } from 'react'
import { trackOnce } from '@/lib/track'

interface Props {
  bikeId: string
  workshopId?: string | null
}

/**
 * Tracks bike_view once per session when the bike detail page loads.
 */
export default function BikeTracker({ bikeId, workshopId }: Props) {
  useEffect(() => {
    trackOnce(
      {
        event_type: 'bike_view',
        target_type: 'bike',
        target_id: bikeId,
        workshop_id: workshopId ?? undefined,
      },
      `bike_view:${bikeId}`,
    )
  }, [bikeId, workshopId])

  return null
}
