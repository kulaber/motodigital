import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import ProfileEditForm from './ProfileEditForm'
import RiderProfileEditForm from './RiderProfileEditForm'

export const metadata: Metadata = { title: 'Profil bearbeiten' }

export default async function ProfileEditPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // Fetch profile + media + workshop in parallel
  const [{ data: profile }, { data: media }, { data: workshop }] = await Promise.all([
    (supabase.from('profiles') as any)
      .select('id, role, full_name, username, slug, bio, bio_long, city, specialty, since_year, tags, bases, address, lat, lng, instagram_url, tiktok_url, website_url, youtube_url, avatar_url, riding_style, visited_cities')
      .eq('id', user.id)
      .maybeSingle(),
    (supabase.from('builder_media') as any)
      .select('id, url, type, title, position')
      .eq('builder_id', user.id)
      .order('position', { ascending: true }),
    (supabase.from('workshops') as any)
      .select('id, subscription_tier')
      .eq('owner_id', user.id)
      .maybeSingle(),
  ])

  if (profile?.role === 'superadmin') redirect('/dashboard')

  const isRider = profile?.role === 'rider'
  const profileSlug = (profile?.slug ?? profile?.username) as string | null
  const backHref = isRider && profileSlug
    ? `/rider/${profileSlug}`
    : !isRider && profile?.slug
      ? `/custom-werkstatt/${profile.slug}`
      : '/dashboard'

  if (isRider) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-16">
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <Link href={backHref} className="md:hidden w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full bg-white transition-colors">
              <ArrowLeft size={18} className="text-[#222222]" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-[#222222]">Profil bearbeiten</h1>
              <p className="text-sm text-[#222222]/40 mt-1">Dein öffentliches Profil auf MotoDigital</p>
            </div>
          </div>
        </div>
        <RiderProfileEditForm profile={profile} coverImage={(media ?? []).find((m: { title: string | null }) => m.title === 'cover') ?? null} />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-16">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <Link href={backHref} className="md:hidden w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full bg-white transition-colors">
            <ArrowLeft size={18} className="text-[#222222]" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[#222222]">Custom Werkstatt Profil</h1>
            <p className="text-sm text-[#222222]/40 mt-1">Dein öffentliches Profil auf MotoDigital</p>
          </div>
        </div>
      </div>
      <ProfileEditForm profile={profile} media={media ?? []} subscriptionTier={workshop?.subscription_tier ?? 'free'} workshopId={workshop?.id ?? null} />
    </div>
  )
}
