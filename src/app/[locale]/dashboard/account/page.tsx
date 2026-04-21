import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Link } from '@/i18n/navigation'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import AccountSettingsForm from './AccountSettingsForm'
import SubscriptionSection from './SubscriptionSection'
import NotificationSettings from './NotificationSettings'
import LogoutButton from './LogoutButton'

export const metadata: Metadata = { title: 'Konto-Einstellungen' }

export default async function AccountSettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await (supabase.from('profiles') as any)
    .select('username, slug, avatar_url, bio, role, full_name')
    .eq('id', user.id)
    .maybeSingle() as { data: { username: string | null; slug: string | null; avatar_url: string | null; bio: string | null; role: string | null; full_name: string | null } | null }

  // Load workshop subscription data for werkstatt users
  let workshopSub: { subscription_tier: string; subscription_started_at: string | null; subscription_cancel_at: string | null; stripe_customer_id: string | null } | null = null
  if (profile?.role === 'custom-werkstatt') {
    const { data } = await (supabase.from('workshops') as any)
      .select('*')
      .eq('owner_id', user.id)
      .maybeSingle()
    if (data) {
      workshopSub = {
        subscription_tier: data.subscription_tier ?? 'free',
        subscription_started_at: data.subscription_started_at ?? null,
        subscription_cancel_at: data.subscription_cancel_at ?? null,
        stripe_customer_id: data.stripe_customer_id ?? null,
      }
    }
  }

  const backHref = profile?.role === 'rider' && (profile.slug || profile.username)
    ? `/rider/${profile.slug || profile.username}`
    : profile?.role === 'custom-werkstatt' && profile.slug
      ? `/custom-werkstatt/${profile.slug}`
      : '/dashboard'

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-32 sm:pb-16 min-h-full bg-[#F7F7F7]">
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <Link href={backHref} className="md:hidden w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full bg-white transition-colors">
              <ArrowLeft size={18} className="text-[#222222]" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-[#222222]">Konto-Einstellungen</h1>
              <p className="text-sm text-[#222222]/40 mt-1">Profil, E-Mail und Passwort verwalten</p>
            </div>
          </div>
        </div>
        {/* Abo & Abrechnung — nur für Werkstätten */}
        {profile?.role === 'custom-werkstatt' && (
          <div className="mb-5">
            <SubscriptionSection
              subscriptionTier={workshopSub?.subscription_tier ?? 'free'}
              subscriptionStartedAt={workshopSub?.subscription_started_at ?? null}
              subscriptionCancelAt={workshopSub?.subscription_cancel_at ?? null}
              hasStripeCustomer={!!workshopSub?.stripe_customer_id}
            />
          </div>
        )}

        <AccountSettingsForm
          userId={user.id}
          currentEmail={user.email ?? ''}
          currentUsername={profile?.username ?? ''}
          currentAvatarUrl={profile?.avatar_url ?? null}
          currentBio={profile?.bio ?? null}
          currentFullName={profile?.full_name ?? null}
          role={profile?.role ?? null}
        />

        <div className="mt-8">
          <NotificationSettings userId={user.id} role={profile?.role ?? null} />
        </div>

        <div className="mt-8">
          <LogoutButton />
        </div>
    </div>
  )
}
