import { createClient } from '@/lib/supabase/client'

export async function saveOnboardingStep(step: number): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  await supabase
    .from('profiles')
    .update({ onboarding_step: step })
    .eq('id', user.id)
}

export async function completeOnboarding(): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  await supabase
    .from('profiles')
    .update({ onboarding_completed: true, onboarding_step: 99 })
    .eq('id', user.id)
}
