import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { isPremium } from '@/lib/werkstatt-tier'

/** Superadmin guard */
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

/**
 * PATCH — Assign a bike to a workshop (or unassign).
 * Enforces tier limits: FREE = max 1 bike, PRO/founding_partner = unlimited.
 */
export async function PATCH(request: Request) {
  try {
    const guard = await requireSuperadmin()
    if ('error' in guard && guard.error) return guard.error

    const { bike_id, workshop_owner_id } = await request.json()

    if (!bike_id) {
      return NextResponse.json({ error: 'bike_id ist erforderlich' }, { status: 400 })
    }

    const admin = getAdminClient()

    // If unassigning (workshop_owner_id is null), just clear
    if (!workshop_owner_id) {
      const { error } = await admin
        .from('bikes')
        .update({ workshop_id: null, seller_id: (await requireSuperadmin()).user!.id })
        .eq('id', bike_id)

      if (error) {
        console.error('[PATCH /api/admin/bikes/assign] unassign error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ success: true, assigned: false })
    }

    // Get workshop record for this owner
    const { data: workshop } = await admin
      .from('workshops')
      .select('id, subscription_tier')
      .eq('owner_id', workshop_owner_id)
      .maybeSingle()

    const workshopId = workshop?.id ?? null
    const tier = workshop?.subscription_tier ?? 'free'

    // Check bike limit for FREE tier
    if (!isPremium(tier)) {
      // Count existing bikes for this workshop owner (excluding the bike being assigned)
      const { count } = await admin
        .from('bikes')
        .select('id', { count: 'exact', head: true })
        .eq('seller_id', workshop_owner_id)
        .neq('id', bike_id)

      if ((count ?? 0) >= 1) {
        return NextResponse.json(
          { error: 'Diese Werkstatt hat den FREE-Tarif und bereits 1 Bike. Upgrade auf PRO für unbegrenzte Bikes.' },
          { status: 400 },
        )
      }
    }

    // Assign the bike
    const { error } = await admin
      .from('bikes')
      .update({
        seller_id: workshop_owner_id,
        workshop_id: workshopId,
      })
      .eq('id', bike_id)

    if (error) {
      console.error('[PATCH /api/admin/bikes/assign] assign error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, assigned: true })
  } catch (err) {
    console.error('[PATCH /api/admin/bikes/assign]', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Interner Serverfehler' },
      { status: 500 },
    )
  }
}
