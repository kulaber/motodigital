import { ImageResponse } from 'next/og'
import { createClient } from '@/lib/supabase/server'
import { generateBikeSlug } from '@/lib/utils/bikeSlug'

export const runtime = 'nodejs'
export const alt = 'MotoDigital Custom Bike'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

interface Params {
  params: Promise<{ slug: string; locale: string }>
}

const STYLE_LABELS: Record<string, string> = {
  naked: 'Naked', cafe_racer: 'Cafe Racer', bobber: 'Bobber',
  scrambler: 'Scrambler', tracker: 'Tracker', chopper: 'Chopper',
  street: 'Street', enduro: 'Enduro', other: 'Basis-Bike',
}

export default async function BikeOgImage({ params }: Params) {
  const { slug } = await params
  const supabase = await createClient()

  const select = 'id, title, make, model, year, style, city, price, price_amount, price_on_request, bike_images(url, is_cover, position), slug'

  let bike: Record<string, unknown> | null = null
  {
    const [bySlugRes, byIdRes] = await Promise.all([
      (supabase.from('bikes') as any).select(select).eq('slug', slug).maybeSingle(),
      (supabase.from('bikes') as any).select(select).eq('id', slug).maybeSingle(),
    ])
    bike = (bySlugRes as { data: Record<string, unknown> | null }).data
      ?? (byIdRes as { data: Record<string, unknown> | null }).data
  }
  if (!bike) {
    const { data: nullSlugBikes } = await (supabase.from('bikes') as any)
      .select(select)
      .is('slug', null)
    bike = (nullSlugBikes ?? []).find(
      (b: Record<string, unknown>) =>
        generateBikeSlug(b.title as string) === slug,
    ) ?? null
  }
  if (!bike) {
    return fallback()
  }

  const images = (bike.bike_images as { url: string; is_cover: boolean; position: number }[] | null) ?? []
  const cover =
    images.find((i) => i.is_cover)?.url
    ?? [...images].sort((a, b) => (a.position ?? 0) - (b.position ?? 0))[0]?.url
    ?? null

  const title = (bike.title as string) ?? 'Custom Bike'
  const make = (bike.make as string | null) ?? ''
  const model = (bike.model as string | null) ?? ''
  const year = bike.year ? String(bike.year) : ''
  const subtitle = [make, model, year].filter(Boolean).join(' · ')
  const styleLabel = STYLE_LABELS[bike.style as string] ?? ''
  const city = (bike.city as string | null) ?? ''

  const priceAmount = (bike.price_amount ?? bike.price) as number | null | undefined
  const priceOnRequest = bike.price_on_request as boolean | null
  const priceText = priceOnRequest
    ? 'Preis auf Anfrage'
    : priceAmount && Number(priceAmount) > 0
      ? `€ ${Number(priceAmount).toLocaleString('de-DE')}`
      : ''

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
            background: 'linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.55) 55%, rgba(0,0,0,0.85) 100%)',
          }}
        />

        {/* Top bar: brand + style pill */}
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
          {styleLabel && (
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
              {styleLabel}
            </div>
          )}
        </div>

        {/* Bottom content */}
        <div
          style={{
            position: 'relative',
            marginTop: 'auto',
            padding: '0 56px 56px',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          {subtitle && (
            <div
              style={{
                color: 'rgba(240, 237, 228, 0.75)',
                fontSize: 26,
                fontWeight: 500,
              }}
            >
              {subtitle}
            </div>
          )}
          <div
            style={{
              color: '#F0EDE4',
              fontSize: 68,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: '-0.02em',
              maxWidth: 1080,
              textWrap: 'balance',
            }}
          >
            {title}
          </div>
          <div
            style={{
              marginTop: 8,
              display: 'flex',
              alignItems: 'center',
              gap: 18,
              color: '#F0EDE4',
            }}
          >
            {priceText && (
              <div
                style={{
                  background: '#2AABAB',
                  color: '#F0EDE4',
                  padding: '12px 22px',
                  borderRadius: 999,
                  fontSize: 26,
                  fontWeight: 700,
                }}
              >
                {priceText}
              </div>
            )}
            {city && (
              <div style={{ fontSize: 22, opacity: 0.85 }}>{city}</div>
            )}
          </div>
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
        MotoDigital — Custom Bikes
      </div>
    ),
    size,
  )
}
