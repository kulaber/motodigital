import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Zugang — Websites',
  robots: 'noindex, nofollow',
}

async function loginAction(formData: FormData) {
  'use server'
  const password = formData.get('password') as string
  if (password === process.env.WEBSITES_PASSWORD) {
    const cookieStore = await cookies()
    cookieStore.set('websites_auth', password, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/websites',
      maxAge: 60 * 60 * 24 * 30,
    })
    redirect('/websites')
  }
  redirect('/websites/login?error=1')
}

export default async function WebsitesLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  return (
    <main style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: '#f7f7f7',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
    }}>
      <div style={{
        background: '#ffffff',
        border: '1px solid #e5e5e5',
        borderRadius: '16px',
        padding: '40px',
        width: '100%',
        maxWidth: '360px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
      }}>
        <p style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#06a5a5', marginBottom: '8px' }}>
          MotoDigital
        </p>
        <h1 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111', marginBottom: '4px' }}>
          Projektübersicht
        </h1>
        <p style={{ fontSize: '0.82rem', color: '#888', marginBottom: '28px' }}>
          Bitte Passwort eingeben.
        </p>
        <form action={loginAction} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input
            type="password"
            name="password"
            placeholder="Passwort"
            autoFocus
            required
            style={{
              padding: '10px 14px',
              border: error ? '1px solid #ef4444' : '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '0.9rem',
              width: '100%',
              outline: 'none',
              background: '#fff',
            }}
          />
          {error && (
            <p style={{ fontSize: '0.78rem', color: '#ef4444', marginTop: '-4px' }}>
              Falsches Passwort.
            </p>
          )}
          <button
            type="submit"
            style={{
              background: '#06a5a5',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 20px',
              fontSize: '0.88rem',
              fontWeight: 600,
              cursor: 'pointer',
              width: '100%',
            }}
          >
            Anmelden →
          </button>
        </form>
      </div>
    </main>
  )
}
