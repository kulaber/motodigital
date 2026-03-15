import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const formData = await request.formData()
  const name  = formData.get('name')  as string
  const email = formData.get('email') as string
  const role  = formData.get('role')  as string

  if (!email || !role) {
    return NextResponse.redirect(new URL('/landing?error=missing_fields', request.url))
  }

  const supabase = await createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
