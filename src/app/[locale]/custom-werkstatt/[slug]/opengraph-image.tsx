import { ImageResponse } from 'next/og'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const alt = 'MotoDigital Custom Werkstatt'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

interface Params {
  params: Promise<{ slug: string; locale: string }>
}

export default async function WerkstattOgImage({ params }: Params) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: row } = await (supabase.from('profiles') as any)
    .select('id, full_name, city, specialty, avatar_url, address')
    .eq('slug', slug)
    .eq('role', 'custom-werkstatt')
    .maybeSingle()

  if (!row) return fallback()

  const { data: coverRow } = await (supabase.from('builder_media') as any)
    .select('url')
    .eq('builder_id', row.id)
    .order('position', { ascending: true })
    .limit(1)
    .maybeSingle()

  const name = (row.full_name as string | null) ?? 'Custom Werkstatt'
  const city = (row.city as string | null)
    ?? extractCityFromAddress((row.address as string | null) ?? '')
  const specialty = (row.specialty as string | null) ?? ''
  const avatar = (row.avatar_url as string | null) ?? null
  const cover = (coverRow?.url as string | null) ?? null

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          backgroundColor: '#111111',
        }}
      >
        {cover && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover}
            alt=""
            width={1200}
            height={630}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        )}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(180deg, rgba(0,0,0,0.20) 0%, rgba(0,0,0,0.55) 55%, rgba(0,0,0,0.88) 100%)',
          }}
        />

        {/* Top bar */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '40px 56px 0',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                background: '#2AABAB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#F0EDE4',
                fontSize: 28,
                fontWeight: 800,
              }}
            >
              M
            </div>
            <div
              style={{
                color: '#F0EDE4',
                fontSize: 22,
                fontWeight: 700,
                letterSpacing: '0.02em',
              }}
            >
              MotoDigital
            </div>
          </div>
          <div
            style={{
              color: '#111111',
              background: '#F0EDE4',
              padding: '8px 18px',
              borderRadius: 999,
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}
          >
            Custom Werkstatt
          </div>
        </div>

        {/* Bottom */}
        <div
          style={{
            position: 'relative',
            marginTop: 'auto',
            padding: '0 56px 56px',
            display: 'flex',
            alignItems: 'flex-end',
            gap: 28,
          }}
        >
          {avatar && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatar}
              alt=""
              width={140}
              height={140}
              style={{
                width: 140,
                height: 140,
                borderRadius: 12,
                objectFit: 'cover',
                border: '4px solid #F0EDE4',
                flexShrink: 0,
              }}
            />
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 920 }}>
            {city && (
              <div
                style={{
                  color: 'rgba(240, 237, 228, 0.75)',
                  fontSize: 24,
                  fontWeight: 500,
                  letterSpacing: '0.02em',
                }}
              >
                {city}
              </div>
            )}
            <div
              style={{
                color: '#F0EDE4',
                fontSize: 62,
                fontWeight: 800,
                lineHeight: 1.05,
                letterSpacing: '-0.02em',
                textWrap: 'balance',
              }}
            >
              {name}
            </div>
            {specialty && (
              <div
                style={{
                  marginTop: 6,
                  color: 'rgba(240, 237, 228, 0.85)',
                  fontSize: 22,
                  fontWeight: 500,
                  lineHeight: 1.3,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {specialty}
              </div>
            )}
          </div>
        </div>
      </div>
    ),
    size,
  )
}

function extractCityFromAddress(addr: string): string {
  const m = addr.match(/,\s*\d{4,5}\s+([^,]+)/)
  return m ? m[1].trim() : ''
}

function fallback() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#111111',
          color: '#F0EDE4',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 56,
          fontWeight: 800,
          letterSpacing: '-0.02em',
        }}
      >
        MotoDigital — Custom Werkstätten
      </div>
    ),
    size,
  )
}
