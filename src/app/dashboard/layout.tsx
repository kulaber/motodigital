import { redirect } from 'next/navigation'
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

  // Werkstatt ohne Adresse → Onboarding erzwingen (außerhalb des Dashboard-Layouts)
  if (profile?.role === 'custom-werkstatt' && !profile?.address) {
    redirect('/onboarding')
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
