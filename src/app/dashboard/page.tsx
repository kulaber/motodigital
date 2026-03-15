import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/utils'
import Link from 'next/link'
import { Plus, Eye, MessageCircle, TrendingUp } from 'lucide-react'

export const metadata: Metadata = { title: 'Dashboard' }

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [{ data: bikes }, { data: conversations }] = await Promise.all([
    supabase
      .from('bikes')
      .select('id, title, status, price, view_count, created_at, bike_images(url,is_cover)')
      .eq('seller_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('conversations')
      .select('id, last_message_at, bikes(title), profiles:buyer_id(username, full_name)')
      .or(`seller_id.eq.${user.id},buyer_id.eq.${user.id}`)
      .order('last_message_at', { ascending: false })
      .limit(10),
  ])

  const totalViews = bikes?.reduce((acc, b) => acc + (b.view_count ?? 0), 0) ?? 0
  const activeCount = bikes?.filter(b => b.status === 'active').length ?? 0
  const unreadCount = 0 // TODO: count unread messages

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-5xl mx-auto px-4 py-8 lg:px-8">

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-creme">Dashboard</h1>
          <Link
            href="/bikes/new"
            className="inline-flex items-center gap-2 bg-teal text-bg text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-teal-light transition-all"
          >
            <Plus size={14} />
            Neues Inserat
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { label: 'Aktive Inserate', value: activeCount, icon: <TrendingUp size={16}/> },
            { label: 'Gesamte Aufrufe', value: totalViews, icon: <Eye size={16}/> },
            { label: 'Nachrichten', value: conversations?.length ?? 0, icon: <MessageCircle size={16}/> },
            { label: 'Ungelesen', value: unreadCount, icon: <MessageCircle size={16}/> },
          ].map(s => (
            <div key={s.label} className="bg-bg-2 border border-creme/6 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-creme/40 mb-2">{s.icon}<span className="text-xs">{s.label}</span></div>
              <p className="text-2xl font-bold text-creme">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">

          {/* Listings */}
          <div className="bg-bg-2 border border-creme/6 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-creme/5">
              <h2 className="text-sm font-semibold text-creme">Meine Inserate</h2>
              <span className="text-xs text-creme/35">{bikes?.length ?? 0} total</span>
            </div>
            <div className="divide-y divide-creme/5">
              {bikes?.map(bike => (
                <div key={bike.id} className="flex items-center gap-4 px-5 py-3.5">
                  <div className="w-12 h-9 rounded-lg bg-bg-3 border border-creme/8 flex-shrink-0 overflow-hidden relative">
                    {(bike.bike_images as any)?.[0]?.url ? null : (
                      <div className="w-full h-full flex items-center justify-center opacity-30">
                        <svg width="24" height="17" viewBox="0 0 48 34" fill="none">
                          <circle cx="8" cy="26" r="7" stroke="white" strokeWidth="1.5"/>
                          <circle cx="40" cy="26" r="7" stroke="white" strokeWidth="1.5"/>
                          <path d="M8 26 L15 8 L24 11 L33 6 L40 26" stroke="white" strokeWidth="1.5" fill="none" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-creme truncate">{bike.title}</p>
                    <p className="text-xs text-creme/35">{formatPrice(bike.price)} · {bike.view_count ?? 0} Aufrufe</p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${
                    bike.status === 'active' ? 'bg-green-500/10 text-green-400'
                    : bike.status === 'sold' ? 'bg-creme/5 text-creme/30'
                    : 'bg-amber-500/10 text-amber-400'
                  }`}>
                    {bike.status === 'active' ? 'Aktiv' : bike.status === 'sold' ? 'Verkauft' : 'Entwurf'}
                  </span>
                  <Link href={`/bikes/${bike.id}/edit`} className="text-xs text-creme/30 hover:text-creme transition-colors flex-shrink-0">
                    Bearbeiten
                  </Link>
                </div>
              ))}
              {!bikes?.length && (
                <div className="px-5 py-10 text-center">
                  <p className="text-sm text-creme/30 mb-3">Noch keine Inserate</p>
                  <Link href="/bikes/new" className="text-sm text-teal hover:text-teal-light transition-colors">
                    Erstes Inserat erstellen →
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Messages */}
          <div className="bg-bg-2 border border-creme/6 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-creme/5">
              <h2 className="text-sm font-semibold text-creme">Nachrichten</h2>
            </div>
            <div className="divide-y divide-creme/5">
              {conversations?.map((conv: any) => (
                <Link
                  key={conv.id}
                  href={`/dashboard?conversation=${conv.id}`}
                  className="flex items-start gap-3 px-4 py-3 hover:bg-bg-3 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-teal/15 border border-teal/20 flex items-center justify-center text-xs font-bold text-teal flex-shrink-0 mt-0.5">
                    {(conv.profiles?.full_name ?? conv.profiles?.username ?? '?').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-creme">
                      {conv.profiles?.full_name ?? conv.profiles?.username}
                    </p>
                    <p className="text-xs text-creme/35 truncate">{conv.bikes?.title}</p>
                  </div>
                </Link>
              ))}
              {!conversations?.length && (
                <p className="px-5 py-8 text-sm text-creme/30 text-center">Keine Nachrichten</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
