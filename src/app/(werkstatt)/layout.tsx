import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

/**
 * Werkstatt route group layout.
 * Guards all /werkstatt/* routes — only users with role 'custom-werkstatt' may access.
 * Bottom navigation (WerkstattNavBar) is handled by AppBottomNav in the root layout.
 */
export default async function WerkstattLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await (supabase.from('profiles') as any)
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  // Non-werkstatt users get redirected to explore
  if (profile?.role !== 'custom-werkstatt') {
    redirect('/explore')
  }

  return <>{children}</>
}
