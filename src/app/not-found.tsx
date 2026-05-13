export default function NotFound() {
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
          <p
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: '#2AABAB',
              marginBottom: '1rem',
            }}
          >
            404
          </p>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            Seite nicht gefunden
          </h1>
          <p style={{ color: 'rgba(240, 237, 228, 0.6)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
            Die angeforderte Seite existiert nicht oder wurde verschoben.
          </p>
          <a
            href="/"
            style={{
              display: 'inline-block',
              background: '#2AABAB',
              color: 'white',
              padding: '0.625rem 1.5rem',
              borderRadius: '9999px',
              fontWeight: 600,
              fontSize: '0.875rem',
              textDecoration: 'none',
            }}
          >
            Zur Startseite
          </a>
        </div>
      </body>
    </html>
  )
}
