import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createHash } from 'crypto'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

const VALID_EVENT_TYPES = [
  'profile_view',
  'contact_click',
  'route_click',
  'save_click',
  'bike_view',
  'gallery_click',
  'share_click',
] as const

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { event_type, target_type, target_id, workshop_id, referrer } = body

    if (!event_type || !VALID_EVENT_TYPES.includes(event_type)) {
      return NextResponse.json({ ok: true }) // silent fail, always 200
    }

    // Build visitor fingerprint from IP + User-Agent (hashed, no PII)
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
    const ua = req.headers.get('user-agent') ?? 'unknown'
    const fingerprint = createHash('sha256').update(`${ip}:${ua}`).digest('hex').slice(0, 16)

    // Insert via service role
    const { error } = await supabaseAdmin.from('analytics_events').insert({
      event_type,
      target_type: target_type ?? null,
      target_id: target_id ?? null,
      workshop_id: workshop_id ?? null,
      visitor_fingerprint: fingerprint,
      region: null, // best-effort, hardcoded null for now
      referrer: referrer ?? null,
    })
    if (error) console.error('[track] insert failed:', error.message)

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: true }) // always 200
  }
}
