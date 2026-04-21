import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { RiderOnboarding } from '@/components/onboarding/RiderOnboarding'
import { WerkstattOnboarding } from '@/components/onboarding/WerkstattOnboarding'

export default async function WillkommenPage({
  searchParams,
}: {
  searchParams: Promise<{ confirmed?: string; step?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await (supabase.from('profiles') as any)
    .select('id, username, avatar_url, role, onboarding_completed, onboarding_step, riding_styles, address, lat, lng, bio, bio_long')
    .eq('id', user.id)
    .maybeSingle() as { data: {
      id: string; username: string; avatar_url: string | null; role: string;
      onboarding_completed: boolean; onboarding_step: number; riding_styles: string[] | null;
      address: string | null; lat: number | null; lng: number | null; bio: string | null; bio_long: string | null;
    } | null }

  // Bereits onboarded → weg hier
  if (profile?.onboarding_completed === true) {
    redirect(profile.role === 'custom-werkstatt' ? '/dashboard' : '/explore')
  }

  const { confirmed, step: stepParam } = await searchParams
  const forcedStep = stepParam ? parseInt(stepParam, 10) : null

  // Werkstatt-Flow
  if (profile?.role === 'custom-werkstatt') {
    const { data: werkstatt } = await supabase
      .from('workshops')
      .select('id, name, slug, description, address, logo_url, cover_image_url, services')
      .eq('owner_id', user.id)
      .maybeSingle()

    return (
      <WerkstattOnboarding
        profile={profile}
        werkstatt={werkstatt}
        confirmed={confirmed === 'true'}
        initialStep={forcedStep ?? profile?.onboarding_step ?? 0}
      />
    )
  }

  // Rider-Flow (default)
  return (
    <RiderOnboarding
      profile={profile!}
      confirmed={confirmed === 'true'}
      initialStep={forcedStep ?? profile?.onboarding_step ?? 0}
    />
  )
}
