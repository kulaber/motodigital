import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const schema = z.object({
  name:  z.string().min(1).max(100).optional(),
  email: z.string().email(),
  role:  z.enum(['builder', 'rider']),
})

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000
const RATE_LIMIT_MAX = 5
type Bucket = { count: number; resetAt: number }
const buckets = new Map<string, Bucket>()

function consumeRateLimit(ip: string): { allowed: boolean; resetAt: number } {
  const now = Date.now()
  const bucket = buckets.get(ip)
  if (!bucket || now >= bucket.resetAt) {
    const resetAt = now + RATE_LIMIT_WINDOW_MS
    buckets.set(ip, { count: 1, resetAt })
    return { allowed: true, resetAt }
  }
  if (bucket.count >= RATE_LIMIT_MAX) {
    return { allowed: false, resetAt: bucket.resetAt }
  }
  bucket.count += 1
  return { allowed: true, resetAt: bucket.resetAt }
}

// Opportunistic cleanup so a long-running instance doesn't accumulate dead keys.
function gcBuckets() {
  if (buckets.size < 1000) return
  const now = Date.now()
  for (const [ip, b] of buckets) {
    if (now >= b.resetAt) buckets.delete(ip)
  }
}

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? request.headers.get('x-real-ip')
    ?? 'unknown'

  const { allowed, resetAt } = consumeRateLimit(ip)
  if (!allowed) {
    const retryAfter = Math.max(1, Math.ceil((resetAt - Date.now()) / 1000))
    const res = NextResponse.redirect(new URL('/landing?error=rate_limit', request.url))
    res.headers.set('Retry-After', String(retryAfter))
    return res
  }
  gcBuckets()

  const formData = await request.formData()
  const parsed = schema.safeParse({
    name:  formData.get('name')  ?? undefined,
    email: formData.get('email'),
    role:  formData.get('role'),
  })

  if (!parsed.success) {
    return NextResponse.redirect(new URL('/landing?error=missing_fields', request.url))
  }

  const { name, email, role } = parsed.data

  const supabase = await createClient()

  const { error } = await (supabase.from('waitlist') as any)
    .insert({ name, email, role })

  if (error?.code === '23505') {
    // Already signed up — redirect to success anyway
    return NextResponse.redirect(new URL('/landing?success=already', request.url))
  }

  if (error) {
    return NextResponse.redirect(new URL('/landing?error=server', request.url))
  }

  return NextResponse.redirect(new URL('/landing?success=true', request.url))
}
