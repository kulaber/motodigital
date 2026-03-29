import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'

/** Superadmin guard */
async function requireSuperadmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 }) }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase.from('profiles') as any)
    .select('role')
    .eq('id', user.id)
    .maybeSingle() as { data: { role: string } | null }

  if (profile?.role !== 'superadmin') {
    return { error: NextResponse.json({ error: 'Keine Berechtigung' }, { status: 403 }) }
  }
  return { user }
}

function getAdminClient() {
  return createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

/** POST — Upload media for a bike as superadmin */
export async function POST(request: Request) {
  try {
    const guard = await requireSuperadmin()
    if ('error' in guard && guard.error) return guard.error

    const formData = await request.formData()
    const bikeId = formData.get('bike_id') as string
    const sellerId = formData.get('seller_id') as string
    const position = formData.get('position') as string
    const file = formData.get('file') as File | null
    const thumbnail = formData.get('thumbnail') as File | null

    if (!bikeId || !sellerId || position === null || !file) {
      return NextResponse.json(
        { error: 'bike_id, seller_id, position und file sind erforderlich' },
        { status: 400 },
      )
    }

    const admin = getAdminClient()
    const ext = file.name.split('.').pop() ?? 'jpg'
    const path = `${sellerId}/${bikeId}/${position}.${ext}`

    // Upload file to storage
    const fileBuffer = Buffer.from(await file.arrayBuffer())
    const { error: uploadError } = await admin.storage
      .from('bike-images')
      .upload(path, fileBuffer, {
        upsert: true,
        contentType: file.type,
      })

    if (uploadError) {
      console.error('[POST /api/admin/bikes/media] upload error:', uploadError)
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    const { data: urlData } = admin.storage.from('bike-images').getPublicUrl(path)

    // Upload thumbnail for videos
    let thumbnailUrl: string | null = null
    if (thumbnail) {
      const thumbPath = `${sellerId}/${bikeId}/${position}_thumb.jpg`
      const thumbBuffer = Buffer.from(await thumbnail.arrayBuffer())
      const { error: thumbError } = await admin.storage
        .from('bike-images')
        .upload(thumbPath, thumbBuffer, {
          upsert: true,
          contentType: 'image/jpeg',
        })
      if (!thumbError) {
        thumbnailUrl = admin.storage.from('bike-images').getPublicUrl(thumbPath).data.publicUrl
      }
    }

    const isVideo = ['video/mp4', 'video/webm', 'video/quicktime'].includes(file.type)

    // Insert bike_images record
    const { error: insertError } = await admin
      .from('bike_images')
      .insert({
        bike_id: bikeId,
        url: urlData.publicUrl,
        position: parseInt(position),
        is_cover: parseInt(position) === 0,
        media_type: isVideo ? 'video' : 'image',
        thumbnail_url: thumbnailUrl,
      })

    if (insertError) {
      console.error('[POST /api/admin/bikes/media] insert error:', insertError)
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, url: urlData.publicUrl })
  } catch (err) {
    console.error('[POST /api/admin/bikes/media]', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Interner Serverfehler' },
      { status: 500 },
    )
  }
}
