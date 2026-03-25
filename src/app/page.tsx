import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import LandingPage from './landing/page'

export { metadata } from './landing/page'

export default async function RootPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const { data: profile } = await (supabase.from('profiles') as any)
      .select('role')
      .eq('id', user.id)
      .maybeSingle()

    if (profile?.role === 'rider') {
      redirect('/explore')
    }
  }

  return <LandingPage />
}
