import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getStripe } from '@/lib/stripe'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Nicht angemeldet' }, { status: 401 })
  }

  const { data: workshop } = await (supabase.from('workshops') as any)
    .select('*')
    .eq('owner_id', user.id)
    .maybeSingle()

  if (!workshop?.stripe_customer_id) {
    return NextResponse.json(
      { error: 'Kein aktives Abo gefunden' },
      { status: 400 },
    )
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://motodigital.io'

  const session = await getStripe().billingPortal.sessions.create({
    customer: workshop.stripe_customer_id,
    return_url: `${baseUrl}/dashboard/account`,
  })

  return NextResponse.json({ url: session.url })
}
