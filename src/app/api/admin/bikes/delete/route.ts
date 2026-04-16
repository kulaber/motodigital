import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'

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

/** DELETE — Delete a bike and its images as superadmin */
export async function DELETE(request: Request) {
  try {
    const guard = await requireSuperadmin()
    if ('error' in guard && guard.error) return guard.error

    const { bike_id } = await request.json()

    if (!bike_id) {
      return NextResponse.json({ error: 'bike_id ist erforderlich' }, { status: 400 })
    }

    const admin = createAdmin(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )

    // Delete bike images first (foreign key constraint)
    await admin.from('bike_images').delete().eq('bike_id', bike_id)

    // Delete the bike record
    const { error } = await admin.from('bikes').delete().eq('id', bike_id)

    if (error) {
      console.error('[DELETE /api/admin/bikes/delete] error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[DELETE /api/admin/bikes/delete]', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Interner Serverfehler' },
      { status: 500 },
    )
  }
}
