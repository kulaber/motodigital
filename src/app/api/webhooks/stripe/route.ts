import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { getStripe } from '@/lib/stripe'
import type Stripe from 'stripe'

// Disable body parsing — Stripe needs the raw body for signature verification
export const dynamic = 'force-dynamic'

function getAdmin() {
  return createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = getStripe().webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!,
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[Stripe Webhook] Signature verification failed:', message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const admin = getAdmin()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const meta = session.metadata ?? {}

        if (meta.workshop_id) {
          // Subscription checkout — activate founding partner
          const { error } = await admin
            .from('workshops')
            .update({
              subscription_tier: 'founding_partner',
              stripe_customer_id: session.customer as string,
              stripe_subscription_id: session.subscription as string,
              subscription_started_at: new Date().toISOString(),
            })
            .eq('id', meta.workshop_id)

          if (error) {
            console.error('[Stripe Webhook] Workshop update error:', error)
          }
        }

        if (meta.bike_id) {
          // Featured bike payment
          const durationDays = parseInt(meta.duration_days ?? '14', 10)
          const featuredUntil = new Date()
          featuredUntil.setDate(featuredUntil.getDate() + durationDays)

          const { error } = await admin
            .from('bikes')
            .update({
              is_featured: true,
              featured_until: featuredUntil.toISOString(),
              featured_by_user_id: meta.supabase_user_id,
            })
            .eq('id', meta.bike_id)

          if (error) {
            console.error('[Stripe Webhook] Bike featured update error:', error)
          }
        }

        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        // Find workshop by stripe_customer_id and downgrade
        const { error } = await admin
          .from('workshops')
          .update({
            subscription_tier: 'free',
            stripe_subscription_id: null,
          })
          .eq('stripe_customer_id', customerId)

        if (error) {
          console.error('[Stripe Webhook] Subscription cancel error:', error)
        }

        break
      }

      default:
        // Unhandled event type — acknowledge receipt
        break
    }
  } catch (err) {
    console.error('[Stripe Webhook] Processing error:', err)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
