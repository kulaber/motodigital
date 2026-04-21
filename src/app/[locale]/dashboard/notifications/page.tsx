import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Link } from '@/i18n/navigation'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import NotificationsFeed from '@/components/notifications/NotificationsFeed'

export const metadata: Metadata = { title: 'Benachrichtigungen' }

export default async function NotificationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-32 sm:pb-16 min-h-full bg-[#F7F7F7]">
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <Link href="/explore" className="md:hidden w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full bg-white transition-colors">
            <ArrowLeft size={18} className="text-[#222222]" />
          </Link>
          <h1 className="text-2xl font-bold text-[#222222]">Benachrichtigungen</h1>
        </div>
      </div>
      <NotificationsFeed userId={user.id} />
    </div>
  )
}
