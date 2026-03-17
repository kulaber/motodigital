import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import Header from '@/components/layout/Header'
import AccountSettingsForm from './AccountSettingsForm'

export const metadata: Metadata = { title: 'Konto-Einstellungen' }

export default async function AccountSettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase.from('profiles') as any)
    .select('username, full_name, avatar_url, bio, address, role')
    .eq('id', user.id)
    .single() as { data: { username: string | null; full_name: string | null; avatar_url: string | null; bio: string | null; address: string | null; role: string | null } | null }

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      <Header />
      <div className="max-w-2xl mx-auto px-4 pt-8 pb-16 lg:px-8">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/dashboard" className="text-xs text-[#222222]/35 hover:text-[#222222] transition-colors">
            Dashboard
          </Link>
          <span className="text-[#222222]/15">/</span>
          <span className="text-xs text-[#222222]/60 font-medium">Konto-Einstellungen</span>
        </div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#222222]">Konto-Einstellungen</h1>
          <p className="text-sm text-[#222222]/40 mt-1">Profil, E-Mail und Passwort verwalten</p>
        </div>
        <AccountSettingsForm
          userId={user.id}
          currentEmail={user.email ?? ''}
          currentUsername={profile?.username ?? ''}
          currentFullName={profile?.full_name ?? ''}
          currentAvatarUrl={profile?.avatar_url ?? null}
          currentBio={profile?.bio ?? null}
          currentAddress={profile?.address ?? null}
          role={profile?.role ?? null}
        />
      </div>
    </div>
  )
}
