import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import AccountSettingsForm from './AccountSettingsForm'

export const metadata: Metadata = { title: 'Konto-Einstellungen' }

export default async function AccountSettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase.from('profiles') as any)
    .select('username, avatar_url, bio, address, role')
    .eq('id', user.id)
    .maybeSingle() as { data: { username: string | null; avatar_url: string | null; bio: string | null; address: string | null; role: string | null } | null }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-16">
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="md:hidden w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full bg-white transition-colors">
              <ArrowLeft size={18} className="text-[#222222]" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-[#222222]">Konto-Einstellungen</h1>
              <p className="text-sm text-[#222222]/40 mt-1">Profil, E-Mail und Passwort verwalten</p>
            </div>
          </div>
        </div>
        <AccountSettingsForm
          userId={user.id}
          currentEmail={user.email ?? ''}
          currentUsername={profile?.username ?? ''}
          currentAvatarUrl={profile?.avatar_url ?? null}
          currentBio={profile?.bio ?? null}
          currentAddress={profile?.address ?? null}
          role={profile?.role ?? null}
        />
    </div>
  )
}
