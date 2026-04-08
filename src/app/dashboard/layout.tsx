import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardShell from '@/components/layout/DashboardShell'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // Email verification gate (belt-and-suspenders — middleware handles this too)
  if (!user.email_confirmed_at) {
    redirect(`/verify-email?email=${encodeURIComponent(user.email ?? '')}`)
  }

  const { data: profile } = await (supabase.from('profiles') as any)
    .select('role, full_name, avatar_url, address, slug, username, onboarding_completed')
    .eq('id', user.id)
    .maybeSingle()

  // Werkstatt ohne Onboarding → Willkommen-Flow erzwingen
  if (profile?.role === 'custom-werkstatt' && !profile?.onboarding_completed) {
    redirect('/willkommen')
  }

  return (
    <DashboardShell
      role={profile?.role ?? null}
      userName={profile?.full_name ?? null}
      avatarUrl={profile?.avatar_url ?? null}
      slug={profile?.slug ?? profile?.username ?? null}
    >
      {children}
    </DashboardShell>
  )
}
