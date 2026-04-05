import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { generateBikeSlug } from '@/lib/utils/bikeSlug'

/** Superadmin guard — returns user or error response */
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

/** POST — Create bike as superadmin (bypasses RLS) */
export async function POST(request: Request) {
  try {
    const guard = await requireSuperadmin()
    if ('error' in guard && guard.error) return guard.error

    const body = await request.json()
    const {
      seller_id, workshop_id, title, make, model, year,
      style, cc, mileage_km, description, modifications, status,
      listing_type, price_amount, price_on_request,
    } = body

    if (!seller_id || !title || !make || !model || !year || !style) {
      return NextResponse.json(
        { error: 'Pflichtfelder fehlen (seller_id, title, make, model, year, style)' },
        { status: 400 },
      )
    }

    const admin = getAdminClient()

    // Insert bike record via admin client (bypasses RLS)
    const { data: bike, error: bikeError } = await admin
      .from('bikes')
      .insert({
        seller_id,
        workshop_id: workshop_id || null,
        title: title.trim(),
        make,
        model,
        year: parseInt(year),
        style,
        cc: cc ? parseInt(cc) : null,
        mileage_km: mileage_km ? parseInt(mileage_km) : null,
        price: 0,
        city: null,
        lat: null,
        lng: null,
        description: description?.trim() || null,
        modifications: (modifications ?? []).map((m: string) => m.trim()).filter(Boolean),
        status: status || 'draft',
        is_verified: false,
        listing_type: listing_type || 'showcase',
        price_amount: price_amount ?? null,
        price_on_request: price_on_request ?? false,
      })
      .select('id')
      .maybeSingle()

    if (bikeError || !bike) {
      console.error('[POST /api/admin/bikes] insert error:', bikeError)
      return NextResponse.json(
        { error: bikeError?.message ?? 'Fehler beim Speichern' },
        { status: 500 },
      )
    }

    // Generate and save slug
    const slug = generateBikeSlug(title.trim(), bike.id)
    await admin.from('bikes').update({ slug }).eq('id', bike.id)

    return NextResponse.json({ success: true, id: bike.id, slug })
  } catch (err) {
    console.error('[POST /api/admin/bikes]', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Interner Serverfehler' },
      { status: 500 },
    )
  }
}
