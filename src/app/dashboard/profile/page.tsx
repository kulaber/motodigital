import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import Header from '@/components/layout/Header'
import ProfileEditForm from './ProfileEditForm'

export const metadata: Metadata = { title: 'Builder Profil bearbeiten' }

export default async function ProfileEditPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase.from('profiles') as any)
    .select('id, full_name, bio, city, specialty, since_year, tags, instagram_url, tiktok_url, website_url, avatar_url')
    .eq('id', user.id)
    .single()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: media } = await (supabase.from('builder_media') as any)
    .select('id, url, type, title, position')
    .eq('builder_id', user.id)
    .order('position', { ascending: true })

  return (
    <div className="min-h-screen bg-[#141414]">
      <Header />
      <div className="max-w-3xl mx-auto px-4 pt-24 pb-16 lg:px-8">
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-xs text-[#F0EDE4]/35 hover:text-[#F0EDE4] transition-colors mb-8">
          <ArrowLeft size={13} /> Dashboard
        </Link>
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#F0EDE4]">Builder Profil</h1>
          <p className="text-sm text-[#F0EDE4]/40 mt-1">Dein öffentliches Profil auf MotoDigital</p>
        </div>
        <ProfileEditForm profile={profile} media={media ?? []} />
      </div>
    </div>
  )
}
