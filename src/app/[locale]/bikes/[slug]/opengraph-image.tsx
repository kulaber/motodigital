import { ImageResponse } from 'next/og'
import { BIKE_STYLE_CONTENT } from '@/lib/data/bikeStyleContent'

export const runtime = 'nodejs'
export const alt = 'MotoDigital — Custom Bikes'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

interface Params {
  params: Promise<{ slug: string; locale: string }>
}

const STYLE_LABEL: Record<string, string> = {
  'cafe-racer': 'Cafe Racer',
  'bobber': 'Bobber',
  'scrambler': 'Scrambler',
  'tracker': 'Tracker',
  'chopper': 'Chopper',
  'brat-style': 'Brat Style',
  'street-fighter': 'Street Fighter',
  'enduro': 'Enduro',
  'old-school': 'Old School',
  'street': 'Street',
  'naked': 'Naked',
  'basis-bike': 'Basis-Bike',
}

export default async function StyleHubOgImage({ params }: Params) {
  const { slug } = await params
  const name = STYLE_LABEL[slug]
  if (!name) return fallback()

  const lead = BIKE_STYLE_CONTENT[slug]?.lead ?? `Custom ${name} Motorräder auf MotoDigital`

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
          padding: '64px',
        }}
      >
        {/* Subtle teal radial accent */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(ellipse at 75% 30%, rgba(42,171,171,0.20) 0%, transparent 55%)',
          }}
        />

        {/* Brand row */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 12,
              background: '#2AABAB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#F0EDE4',
              fontSize: 32,
              fontWeight: 800,
            }}
          >
            M
          </div>
          <div
            style={{
              color: '#F0EDE4',
              fontSize: 24,
              fontWeight: 700,
              letterSpacing: '0.02em',
            }}
          >
            MotoDigital
          </div>
        </div>

        {/* Style category chip */}
        <div
          style={{
            position: 'relative',
            marginTop: 'auto',
            color: '#2AABAB',
            background: 'rgba(42,171,171,0.12)',
            border: '1px solid rgba(42,171,171,0.35)',
            padding: '10px 22px',
            borderRadius: 999,
            fontSize: 20,
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            alignSelf: 'flex-start',
            marginBottom: 24,
          }}
        >
          Custom · {name}
        </div>

        {/* Headline */}
        <div
          style={{
            position: 'relative',
            color: '#F0EDE4',
            fontSize: 92,
            fontWeight: 800,
            lineHeight: 1.02,
            letterSpacing: '-0.035em',
            maxWidth: 1080,
            textWrap: 'balance',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            marginBottom: 24,
          }}
        >
          {name} Custom Bikes
        </div>

        {/* Lead */}
        <div
          style={{
            position: 'relative',
            color: 'rgba(240,237,228,0.78)',
            fontSize: 26,
            fontWeight: 500,
            lineHeight: 1.35,
            maxWidth: 980,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {lead}
        </div>
      </div>
    ),
    size,
  )
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
        MotoDigital · Custom Bikes
      </div>
    ),
    size,
  )
}
