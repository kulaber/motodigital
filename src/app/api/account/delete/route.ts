import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { getStripe } from '@/lib/stripe'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Nicht angemeldet' }, { status: 401 })
  }

  const admin = createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  // Load workshop with stripe subscription info
  const { data: workshop } = await admin
    .from('workshops')
    .select('*')
    .eq('owner_id', user.id)
    .maybeSingle()

  // Cancel active Stripe subscription if present
  if (workshop?.stripe_subscription_id) {
    try {
      await getStripe().subscriptions.cancel(workshop.stripe_subscription_id)
    } catch (err) {
      console.error('[Account Delete] Stripe cancel error:', err)
      // Continue with soft delete even if Stripe cancel fails —
      // the webhook will handle the subscription.deleted event
    }
  }

  // Soft delete workshop
  if (workshop) {
    const { error: workshopErr } = await admin
      .from('workshops')
      .update({
        deleted_at: new Date().toISOString(),
        subscription_tier: 'free',
      })
      .eq('id', workshop.id)

    if (workshopErr) {
      console.error('[Account Delete] Workshop soft-delete error:', workshopErr)
    }
  }

  // Soft delete profile
  const { error: profileErr } = await admin
    .from('profiles')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', user.id)

  if (profileErr) {
    console.error('[Account Delete] Profile soft-delete error:', profileErr)
    return NextResponse.json(
      { error: 'Fehler beim Löschen des Accounts' },
      { status: 500 },
    )
  }

  // Sign out the user (don't hard-delete auth user — 30-day grace period)
  await supabase.auth.signOut()

  return NextResponse.json({ success: true })
}
