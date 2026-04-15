import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getStripe } from '@/lib/stripe'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Nicht angemeldet' }, { status: 401 })
    }

    const body = await req.json().catch(() => ({}))
    const workshopId = body.workshopId as string | undefined

    // Load the user's workshop (by ID if provided, otherwise by owner)
    const query = (supabase.from('workshops') as any).select('id, stripe_customer_id, subscription_tier')
    const { data: workshop } = workshopId
      ? await query.eq('id', workshopId).eq('owner_id', user.id).maybeSingle()
      : await query.eq('owner_id', user.id).maybeSingle()

    if (!workshop) {
      return NextResponse.json(
        { error: 'Kein Werkstatt-Profil gefunden.' },
        { status: 400 },
      )
    }

    if (workshop.subscription_tier === 'founding_partner' || workshop.subscription_tier === 'pro') {
      return NextResponse.json(
        { error: 'Du hast bereits ein Premium-Abo.' },
        { status: 400 },
      )
    }

    const stripe = getStripe()
    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'https://motodigital.io'

    // Ensure Stripe customer exists
    let customerId = workshop.stripe_customer_id as string | null
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email!,
        metadata: {
          supabase_user_id: user.id,
          workshop_id: workshop.id,
        },
      })
      customerId = customer.id

      await (supabase.from('workshops') as any)
        .update({ stripe_customer_id: customerId })
        .eq('id', workshop.id)
    }

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [
        { price: process.env.STRIPE_PRO_PRICE_ID!, quantity: 1 },
      ],
      automatic_tax: { enabled: true },
      customer: customerId,
      metadata: {
        supabase_user_id: user.id,
        workshop_id: workshop.id,
      },
      success_url: `${origin}/dashboard?upgrade=success`,
      cancel_url: `${origin}/dashboard/account`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('[Stripe Checkout] Error:', err)
    const message = err instanceof Error ? err.message : 'Unbekannter Fehler'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
