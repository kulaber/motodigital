import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import OnboardingAddressForm from './OnboardingAddressForm'

export const metadata: Metadata = {
  title: 'Onboarding — MotoDigital',
  description: 'Richte dein MotoDigital-Profil ein.',
}

export default async function OnboardingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // Email muss bestätigt sein, bevor Onboarding startet
  if (!user.email_confirmed_at) {
    redirect(`/verify-email?email=${encodeURIComponent(user.email ?? '')}`)
  }

  const { data: profile } = await (supabase.from('profiles') as any)
    .select('role, address')
    .eq('id', user.id)
    .maybeSingle()

  // Adresse bereits gesetzt → direkt ins Dashboard
  if (profile?.address) redirect('/dashboard')

  return (
    <div className="min-h-dvh bg-[#F7F7F7] flex items-center justify-center px-4">
      <OnboardingAddressForm userId={user.id} />
    </div>
  )
}
