import { ImageResponse } from 'next/og'
import { createClient } from '@/lib/supabase/server'
import { generateBikeSlug } from '@/lib/utils/bikeSlug'
import { sortedBikeImageUrls } from '@/lib/utils/bikeImages'

export const runtime = 'nodejs'
export const alt = 'MotoDigital Custom Bike'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

interface Params {
  params: Promise<{ slug: string; locale: string }>
}

export default async function BikeOgImage({ params }: Params) {
  const { slug } = await params
  const supabase = await createClient()
  const select = 'title, slug, bike_images(url, is_cover, position)'

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
      (b: Record<string, unknown>) => generateBikeSlug(b.title as string) === slug,
    ) ?? null
  }

  const rawImages = (bike?.bike_images as { url: string; is_cover: boolean; position: number }[] | null) ?? []
  const cover = sortedBikeImageUrls(rawImages)[0] ?? null

  if (cover) {
    return new ImageResponse(
      (
        <div style={{ display: 'flex', width: '100%', height: '100%' }}>
          <img
            src={cover}
            alt=""
            width={1200}
            height={630}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      ),
      size,
    )
  }

  return placeholder()
}

function placeholder() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#2AABAB',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 2834.6 2834.6"
          width="500"
          height="500"
          style={{ opacity: 0.25 }}
        >
          <path
            fill="white"
            d="M1417,167L298.8,627.4L430.3,1943l657.8,723.6v-592l328.9,197.3l328.9-197.3v592l657.8-723.6l131.6-1315.6L1417,167z M2191.2,1611.1l-773.9,451.4v0v0l0,0v0l-773.9-451.4V834.4L1185.2,615v537.7l232.2,135.4l232.2-135.4V615l541.7,219.4V1611.1z"
          />
        </svg>
      </div>
    ),
    size,
  )
}
