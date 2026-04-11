import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getStripe } from '@/lib/stripe'

const bodySchema = z.object({
  bike_id: z.string().uuid(),
  duration: z.union([z.literal(14), z.literal(30)]),
})

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Nicht angemeldet' }, { status: 401 })
  }

  const parsed = bodySchema.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json({ error: 'Ungültige Anfrage' }, { status: 400 })
  }

  const { bike_id, duration } = parsed.data

  // Load bike with seller and workshop info
  const { data: bike } = await (supabase.from('bikes') as any)
    .select('id, seller_id, workshop_id, slug')
    .eq('id', bike_id)
    .maybeSingle()

  if (!bike) {
    return NextResponse.json({ error: 'Bike nicht gefunden' }, { status: 404 })
  }

  // Authorization: user must be bike seller OR owner of the workshop that listed the bike
  let authorized = bike.seller_id === user.id

  if (!authorized && bike.workshop_id) {
    const { data: workshop } = await (supabase.from('workshops') as any)
      .select('owner_id')
      .eq('id', bike.workshop_id)
      .maybeSingle()

    authorized = workshop?.owner_id === user.id
  }

  if (!authorized) {
    return NextResponse.json(
      { error: 'Du kannst nur deine eigenen Bikes featuren.' },
      { status: 403 },
    )
  }

  // Select price ID based on duration
  const priceId = duration === 30
    ? process.env.STRIPE_FEATURED_BIKE_30_PRICE_ID!
    : process.env.STRIPE_FEATURED_BIKE_14_PRICE_ID!

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://motodigital.io'
  const bikeUrl = bike.slug ? `/bikes/${bike.slug}` : `/bikes/${bike.id}`

  const session = await getStripe().checkout.sessions.create({
    mode: 'payment',
    line_items: [{ price: priceId, quantity: 1 }],
    automatic_tax: { enabled: true },
    customer_email: user.email!,
    metadata: {
      supabase_user_id: user.id,
      bike_id: bike_id,
      duration_days: String(duration),
    },
    success_url: `${baseUrl}${bikeUrl}?featured=true`,
    cancel_url: `${baseUrl}${bikeUrl}`,
  })

  return NextResponse.json({ url: session.url })
}
