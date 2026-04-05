import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const schema = z.object({
  name:  z.string().min(1).max(100).optional(),
  email: z.string().email(),
  role:  z.enum(['builder', 'rider']),
})

export async function POST(request: Request) {
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
