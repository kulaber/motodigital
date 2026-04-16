/**
 * Fire-and-forget analytics event tracking.
 * Called from client components — no await needed.
 */

type TrackEvent = {
  event_type: 'profile_view' | 'contact_click' | 'route_click' | 'save_click' | 'bike_view' | 'gallery_click' | 'share_click'
  target_type?: 'workshop' | 'bike'
  target_id?: string
  workshop_id?: string
  referrer?: string
}

/** Known external traffic sources — hostname substring → key */
const EXTERNAL_SOURCES: [string, string][] = [
  ['google.',    'google'],
  ['instagram.', 'instagram'],
  ['facebook.',  'facebook'],
  ['fb.com',     'facebook'],
  ['tiktok.',    'tiktok'],
  ['youtube.',   'youtube'],
  ['youtu.be',   'youtube'],
  ['twitter.',   'twitter'],
  ['x.com',      'twitter'],
  ['pinterest.', 'pinterest'],
  ['linkedin.',  'linkedin'],
  ['t.co',       'twitter'],
]

/** Map document.referrer to internal or external source */
function resolveReferrer(): string {
  if (typeof window === 'undefined') return 'direct'
  const ref = document.referrer
  if (!ref) return 'direct'
  try {
    const url = new URL(ref)

    // Internal referrer → map by path
    if (url.origin === window.location.origin) {
      const path = url.pathname
      if (path.startsWith('/custom-werkstatt')) return 'werkstattsuche'
      if (path.startsWith('/explore')) return 'explore'
      if (path.startsWith('/bikes') || path.startsWith('/custom-bike')) return 'bikes'
      return 'direct'
    }

    // External referrer → match known sources
    const host = url.hostname.toLowerCase()
    for (const [pattern, key] of EXTERNAL_SOURCES) {
      if (host.includes(pattern)) return key
    }
    return 'external'
  } catch {
    return 'direct'
  }
}

/** Track once per session for a given key (e.g. profile_view:workshop:abc) */
export function trackOnce(event: TrackEvent, sessionKey: string) {
  if (typeof window === 'undefined') return
  const storageKey = `tracked:${sessionKey}`
  if (sessionStorage.getItem(storageKey)) return
  sessionStorage.setItem(storageKey, '1')
  track(event)
}

/** Fire-and-forget track event */
export function track(event: TrackEvent) {
  if (typeof window === 'undefined') return
  const payload = {
    ...event,
    referrer: event.referrer ?? resolveReferrer(),
  }
  fetch('/api/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).catch(() => {})
}
