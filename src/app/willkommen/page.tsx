import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { RiderOnboarding } from '@/components/onboarding/RiderOnboarding'
import { WerkstattOnboarding } from '@/components/onboarding/WerkstattOnboarding'

export default async function WillkommenPage({
  searchParams,
}: {
  searchParams: Promise<{ confirmed?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username, avatar_url, role, onboarding_completed, onboarding_step, riding_styles')
    .eq('id', user.id)
    .maybeSingle()

  // Bereits onboarded → weg hier
  if (profile?.onboarding_completed === true) {
    redirect(profile.role === 'custom-werkstatt' ? '/dashboard' : '/explore')
  }

  const { confirmed } = await searchParams

  // Werkstatt-Flow
  if (profile?.role === 'custom-werkstatt') {
    const { data: werkstatt } = await supabase
      .from('workshops')
      .select('id, name, slug, description, address, logo_url, services')
      .eq('owner_id', user.id)
      .maybeSingle()

    return (
      <WerkstattOnboarding
        profile={profile}
        werkstatt={werkstatt}
        confirmed={confirmed === 'true'}
        initialStep={profile?.onboarding_step ?? 0}
      />
    )
  }

  // Rider-Flow (default)
  return (
    <RiderOnboarding
      profile={profile!}
      confirmed={confirmed === 'true'}
      initialStep={profile?.onboarding_step ?? 0}
    />
  )
}
