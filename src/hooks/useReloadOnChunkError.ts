import { useEffect } from 'react'

const RELOADED_AT_KEY = 'chunk-error-reloaded-at'

/**
 * After a deploy, Vercel no longer serves the previous build's JS chunks (Skew
 * Protection needs the Pro plan). HTML from the old build then throws a
 * ChunkLoadError while hydrating — Googlebot renders pages late and indexed
 * that error screen as the homepage snippet. A reload fetches HTML that matches
 * the current build. Returns true while the reload is pending, so the error
 * boundary renders nothing instead of the error screen.
 */
export function useReloadOnChunkError(error: Error): boolean {
  const reload = shouldReload(error)
  useEffect(() => {
    if (!reload) return
    try {
      sessionStorage.setItem(RELOADED_AT_KEY, String(Date.now()))
    } catch {}
    window.location.reload()
  }, [reload])
  return reload
}

function shouldReload(error: Error): boolean {
  if (error.name !== 'ChunkLoadError') return false
  try {
    // At most one reload per 10 s, so a chunk that is really missing can't loop
    return Date.now() - Number(sessionStorage.getItem(RELOADED_AT_KEY)) > 10_000
  } catch {
    return false
  }
}
