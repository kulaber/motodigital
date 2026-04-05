import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Check if user is post owner or superadmin
  const { data: profile } = await (supabase.from('profiles') as any)
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  const { data: post } = await (supabase.from('community_posts') as any)
    .select('user_id, media_urls')
    .eq('id', id)
    .maybeSingle()

  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const isOwner = post.user_id === user.id
  const isSuperadmin = profile?.role === 'superadmin'

  if (!isOwner && !isSuperadmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const admin = createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Delete media files from storage
  const mediaUrls: string[] = post.media_urls ?? []
  if (mediaUrls.length > 0) {
    const storagePaths = mediaUrls
      .map((url: string) => {
        const match = url.match(/\/storage\/v1\/object\/public\/[^/]+\/(.+)$/)
        return match ? match[1] : null
      })
      .filter(Boolean) as string[]
    if (storagePaths.length > 0) {
      const { error: storageErr } = await admin.storage.from('community-media').remove(storagePaths)
      if (storageErr) console.error('Storage remove community-media failed:', storageErr.message)
    }
  }

  const { error } = await admin.from('community_posts').delete().eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
