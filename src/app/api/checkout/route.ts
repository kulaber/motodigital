import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getStripe } from '@/lib/stripe'

const FOUNDING_PARTNER_LIMIT = 10

export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Nicht angemeldet' }, { status: 401 })
    }

    // Load the user's workshop
    const { data: workshop } = await (supabase.from('workshops') as any)
      .select('*')
      .eq('owner_id', user.id)
      .maybeSingle()

    if (!workshop) {
      return NextResponse.json(
        { error: 'Kein Werkstatt-Profil gefunden. Bitte erstelle zuerst eine Werkstatt.' },
        { status: 400 },
      )
    }

    if (workshop.subscription_tier === 'founding_partner') {
      return NextResponse.json(
        { error: 'Du bist bereits Founding Partner.' },
        { status: 400 },
      )
    }

    // Check founding partner slot availability
    const { count } = await (supabase.from('workshops') as any)
      .select('id', { count: 'exact', head: true })
      .eq('subscription_tier', 'founding_partner')

    if ((count ?? 0) >= FOUNDING_PARTNER_LIMIT) {
      return NextResponse.json(
        { error: 'Alle Founding Partner Plätze sind vergeben.' },
        { status: 400 },
      )
    }

    // Create Stripe Checkout Session
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://motodigital.io'

    const session = await getStripe().checkout.sessions.create({
      mode: 'subscription',
      line_items: [
        { price: process.env.STRIPE_FOUNDING_PRICE_ID!, quantity: 1 },
      ],
      automatic_tax: { enabled: true },
      tax_id_collection: { enabled: true },
      customer_email: user.email!,
      metadata: {
        supabase_user_id: user.id,
        workshop_id: workshop.id,
      },
      success_url: `${baseUrl}/dashboard?welcome=founding`,
      cancel_url: `${baseUrl}/dashboard/account`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('[Checkout] Error:', err)
    const message = err instanceof Error ? err.message : 'Unbekannter Fehler'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
