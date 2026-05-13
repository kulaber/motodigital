import { ImageResponse } from 'next/og'
import { ARTICLES } from '@/lib/data/magazine'

export const runtime = 'nodejs'
export const alt = 'MotoDigital Magazin'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

interface Params {
  params: Promise<{ slug: string; locale: string }>
}

export default async function MagazineOgImage({ params }: Params) {
  const { slug } = await params
  const article = ARTICLES.find((a) => a.slug === slug)

  if (!article) return fallback()

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
        {article.coverImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={article.coverImage}
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
              MotoDigital · Magazin
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
            {article.categoryLabel}
          </div>
        </div>

        {/* Bottom content */}
        <div
          style={{
            position: 'relative',
            marginTop: 'auto',
            padding: '0 56px 56px',
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          }}
        >
          <div
            style={{
              color: '#F0EDE4',
              fontSize: 56,
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              maxWidth: 1080,
              textWrap: 'balance',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {article.title}
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              color: 'rgba(240, 237, 228, 0.85)',
              fontSize: 22,
              fontWeight: 500,
            }}
          >
            <span>{article.author}</span>
            <span style={{ opacity: 0.5 }}>·</span>
            <span>{article.readTime}</span>
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
        MotoDigital · Magazin
      </div>
    ),
    size,
  )
}
