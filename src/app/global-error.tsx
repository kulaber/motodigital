'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Global error:', error)
  }, [error])

  return (
    <html lang="de">
      <body
        style={{
          margin: 0,
          fontFamily: 'system-ui, -apple-system, sans-serif',
          background: '#111111',
          color: '#F0EDE4',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
        }}
      >
        <div style={{ textAlign: 'center', maxWidth: '28rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            Etwas ist schiefgelaufen
          </h1>
          <p style={{ color: 'rgba(240, 237, 228, 0.6)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
            Ein unerwarteter Fehler ist aufgetreten. Bitte versuche es erneut.
          </p>
          <button
            onClick={reset}
            style={{
              background: '#2AABAB',
              color: 'white',
              border: 'none',
              padding: '0.625rem 1.5rem',
              borderRadius: '9999px',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: 'pointer',
            }}
          >
            Erneut versuchen
          </button>
        </div>
      </body>
    </html>
  )
}
