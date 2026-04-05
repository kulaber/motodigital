import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'

/** Superadmin guard — returns profile or error response */
async function requireSuperadmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 }) }

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

/** POST — Create new unclaimed werkstatt */
export async function POST(request: Request) {
  try {
    const guard = await requireSuperadmin()
    if ('error' in guard && guard.error) return guard.error

    const body = await request.json()
    const { name, username } = body

    if (!name || !username) {
      return NextResponse.json({ error: 'Name und Username sind erforderlich' }, { status: 400 })
    }

    const slug = username.toLowerCase().replace(/[^a-z0-9_-]/g, '')
    if (!slug) {
      return NextResponse.json({ error: 'Username ist ungueltig' }, { status: 400 })
    }

    const admin = getAdminClient()

    // Check if username already exists
    const { data: existing } = await admin
      .from('profiles')
      .select('id')
      .eq('username', slug)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ error: 'Dieser Username ist bereits vergeben' }, { status: 409 })
    }

    // Create auth user with placeholder email (trigger auto-creates profile)
    const placeholderEmail = `unclaimed-${crypto.randomUUID()}@motodigital.local`
    const { data: authUser, error: authError } = await admin.auth.admin.createUser({
      email: placeholderEmail,
      email_confirm: true,
      user_metadata: {
        role: 'custom-werkstatt',
        username: slug,
      },
    })

    if (authError || !authUser.user) {
      return NextResponse.json(
        { error: authError?.message ?? 'Fehler beim Erstellen des Auth-Users' },
        { status: 500 },
      )
    }

    // Update profile with name
    const { error: updateError } = await admin
      .from('profiles')
      .update({ full_name: name })
      .eq('id', authUser.user.id)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, id: authUser.user.id, username: slug })
  } catch (err) {
    console.error('[POST /api/admin/werkstatt]', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Interner Serverfehler' },
      { status: 500 },
    )
  }
}

/** Helper: extract storage path from Supabase public URL */
function extractStoragePath(url: string): string | null {
  const match = url.match(/\/storage\/v1\/object\/public\/[^/]+\/(.+)$/)
  return match ? match[1] : null
}

/** DELETE — Permanently delete werkstatt + auth user */
export async function DELETE(request: Request) {
  try {
    const guard = await requireSuperadmin()
    if ('error' in guard && guard.error) return guard.error

    const { profileId } = await request.json()
    if (!profileId) {
      return NextResponse.json({ error: 'Profil-ID ist erforderlich' }, { status: 400 })
    }

    const admin = getAdminClient()

    // 1. Delete bike images from storage
    const { data: bikes } = await admin
      .from('bikes')
      .select('id')
      .eq('seller_id', profileId)

    for (const bike of bikes ?? []) {
      const { data: images } = await admin
        .from('bike_images')
        .select('url, thumbnail_url')
        .eq('bike_id', bike.id)

      if (images && images.length > 0) {
        const paths = images
          .flatMap((img: { url: string; thumbnail_url?: string | null }) => [
            extractStoragePath(img.url),
            img.thumbnail_url ? extractStoragePath(img.thumbnail_url) : null,
          ])
          .filter(Boolean) as string[]

        if (paths.length > 0) {
          await admin.storage.from('bike-images').remove(paths)
        }
      }
    }

    // 2. Delete builder media from storage
    const { data: media } = await admin
      .from('builder_media')
      .select('url, thumbnail_url')
      .eq('profile_id', profileId)

    if (media && media.length > 0) {
      const mediaPaths = media
        .flatMap((m: { url: string; thumbnail_url?: string | null }) => [
          extractStoragePath(m.url),
          m.thumbnail_url ? extractStoragePath(m.thumbnail_url) : null,
        ])
        .filter(Boolean) as string[]

      if (mediaPaths.length > 0) {
        await admin.storage.from('builder-media').remove(mediaPaths)
      }
    }

    // 3. Delete auth user (cascades to profile → bikes → images → conversations → messages etc.)
    const { error: authError } = await admin.auth.admin.deleteUser(profileId)
    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[DELETE /api/admin/werkstatt]', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Interner Serverfehler' },
      { status: 500 },
    )
  }
}

/** PATCH — Assign real email to unclaimed werkstatt */
export async function PATCH(request: Request) {
  try {
    const guard = await requireSuperadmin()
    if ('error' in guard && guard.error) return guard.error

    const { profileId, email } = await request.json()

    if (!profileId || !email) {
      return NextResponse.json({ error: 'Profil-ID und E-Mail sind erforderlich' }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Ungueltiges E-Mail-Format' }, { status: 400 })
    }

    const admin = getAdminClient()

    // Check if email is already in use by another user
    const { data: authUsers } = await admin.auth.admin.listUsers()
    const emailInUse = authUsers?.users?.some(
      (u) => u.email?.toLowerCase() === email.toLowerCase() && u.id !== profileId,
    )
    if (emailInUse) {
      return NextResponse.json({ error: 'Diese E-Mail-Adresse ist bereits vergeben' }, { status: 409 })
    }

    // Update auth user email
    const { error: authError } = await admin.auth.admin.updateUserById(profileId, {
      email,
      email_confirm: true,
    })

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[PATCH /api/admin/werkstatt]', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Interner Serverfehler' },
      { status: 500 },
    )
  }
}
