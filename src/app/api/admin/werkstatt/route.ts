import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'

/** Superadmin guard — returns profile or error response */
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

/** POST — Create new unclaimed werkstatt */
export async function POST(request: Request) {
  const guard = await requireSuperadmin()
  if ('error' in guard && guard.error) return guard.error

  const body = await request.json()
  const { name, username, city, specialty, bio, tags, is_verified, since_year } = body

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

  // Update profile with additional fields
  const { error: updateError } = await admin
    .from('profiles')
    .update({
      full_name: name,
      city: city || null,
      specialty: specialty || null,
      bio: bio || null,
      tags: tags?.length ? tags : null,
      is_verified: is_verified ?? false,
      since_year: since_year || null,
    })
    .eq('id', authUser.user.id)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, id: authUser.user.id, username: slug })
}

/** PATCH — Assign real email to unclaimed werkstatt */
export async function PATCH(request: Request) {
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
}
