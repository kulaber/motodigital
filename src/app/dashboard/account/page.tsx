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
    .select('username')
    .eq('id', user.id)
    .single() as { data: { username: string | null } | null }

  return (
    <div className="min-h-screen bg-[#141414]">
      <Header />
      <div className="max-w-2xl mx-auto px-4 pt-24 pb-16 lg:px-8">
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-xs text-[#F0EDE4]/35 hover:text-[#F0EDE4] transition-colors mb-8">
          <ArrowLeft size={13} /> Dashboard
        </Link>
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#F0EDE4]">Konto-Einstellungen</h1>
          <p className="text-sm text-[#F0EDE4]/40 mt-1">Benutzername, E-Mail und Passwort verwalten</p>
        </div>
        <AccountSettingsForm
          userId={user.id}
          currentEmail={user.email ?? ''}
          currentUsername={profile?.username ?? ''}
        />
      </div>
    </div>
  )
}
