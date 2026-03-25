import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import DashboardShell from '@/components/layout/DashboardShell'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase.from('profiles') as any)
    .select('role, full_name, avatar_url, address')
    .eq('id', user.id)
    .maybeSingle()

  // Werkstatt ohne Adresse → Onboarding erzwingen (server-side, nicht bypassbar)
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') ?? ''
  const needsOnboarding = profile?.role === 'custom-werkstatt' && !profile?.address
  if (needsOnboarding && !pathname.startsWith('/dashboard/onboarding')) {
    redirect('/dashboard/onboarding')
  }

  return (
    <DashboardShell
      role={profile?.role ?? null}
      userName={profile?.full_name ?? null}
      avatarUrl={profile?.avatar_url ?? null}
    >
      {children}
    </DashboardShell>
  )
}
