import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/utils'
import Link from 'next/link'
import { Plus, Eye, MessageCircle, TrendingUp, User, ExternalLink, ChevronRight } from 'lucide-react'
import Header from '@/components/layout/Header'
import type { Database } from '@/types/database'

type BikeRow = Database['public']['Tables']['bikes']['Row']
type BikeImageRow = Database['public']['Tables']['bike_images']['Row']

type DashboardBike = Pick<BikeRow, 'id' | 'title' | 'status' | 'price' | 'view_count' | 'created_at'> & {
  bike_images: Pick<BikeImageRow, 'url' | 'is_cover'>[]
}

type DashboardConversation = {
  id: string
  last_message_at: string | null
  bikes: { title: string } | null
  profiles: { username: string; full_name: string | null } | null
}

export const metadata: Metadata = { title: 'Dashboard' }

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase.from('profiles') as any)
    .select('full_name, role, city, specialty, bio, is_verified')
    .eq('id', user.id)
    .single() as { data: { full_name: string | null; role: string; city: string | null; specialty: string | null; bio: string | null; is_verified: boolean } | null }

  const [{ data: bikes }, { data: conversations }] = await Promise.all([
    supabase
      .from('bikes')
      .select('id, title, status, price, view_count, created_at, bike_images(url,is_cover)')
      .eq('seller_id', user.id)
      .order('created_at', { ascending: false }) as unknown as Promise<{ data: DashboardBike[] | null, error: unknown }>,
    supabase
      .from('conversations')
      .select('id, last_message_at, bikes(title), profiles:buyer_id(username, full_name)')
      .or(`seller_id.eq.${user.id},buyer_id.eq.${user.id}`)
      .order('last_message_at', { ascending: false })
      .limit(10) as unknown as Promise<{ data: DashboardConversation[] | null, error: unknown }>,
  ])

  const totalViews = bikes?.reduce((acc, b) => acc + (b.view_count ?? 0), 0) ?? 0
  const activeCount = bikes?.filter(b => b.status === 'active').length ?? 0
  const isBuilder = profile?.role === 'builder' || profile?.role === 'workshop'

  return (
    <div className="min-h-screen bg-[#141414]">
      <Header />
      <div className="max-w-5xl mx-auto px-4 pt-24 pb-12 lg:px-8">

        {/* Header row */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#F0EDE4]">Dashboard</h1>
            {profile?.full_name && (
              <p className="text-sm text-[#F0EDE4]/35 mt-0.5">Hallo, {profile.full_name.split(' ')[0]}</p>
            )}
          </div>
          <Link
            href="/bikes/new"
            className="inline-flex items-center gap-2 bg-[#2AABAB] text-[#141414] text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-[#3DBFBF] transition-all"
          >
            <Plus size={14} />
            Neues Inserat
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { label: 'Aktive Inserate', value: activeCount,                   icon: <TrendingUp size={16}/> },
            { label: 'Gesamte Aufrufe', value: totalViews,                    icon: <Eye size={16}/> },
            { label: 'Nachrichten',     value: conversations?.length ?? 0,    icon: <MessageCircle size={16}/> },
            { label: 'Inserate gesamt', value: bikes?.length ?? 0,            icon: <Plus size={16}/> },
          ].map(s => (
            <div key={s.label} className="bg-[#1C1C1C] border border-[#F0EDE4]/6 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-[#F0EDE4]/40 mb-2">{s.icon}<span className="text-xs">{s.label}</span></div>
              <p className="text-2xl font-bold text-[#F0EDE4]">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5 items-start">

          {/* LEFT */}
          <div className="flex flex-col gap-5">

            {/* Builder profile card — only for builder/workshop */}
            {isBuilder && (
              <div className="bg-[#1C1C1C] border border-[#2AABAB]/20 rounded-2xl p-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 pointer-events-none"
                  style={{ background: 'radial-gradient(circle, rgba(42,171,171,0.08) 0%, transparent 65%)', transform: 'translate(30%,-30%)' }} />
                <div className="flex items-start justify-between gap-4 relative">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#2AABAB]/12 border border-[#2AABAB]/20 flex items-center justify-center flex-shrink-0">
                      <User size={20} className="text-[#2AABAB]" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#F0EDE4] mb-0.5">Builder Profil</p>
                      {profile?.bio ? (
                        <p className="text-xs text-[#F0EDE4]/40 leading-relaxed max-w-xs line-clamp-2">{profile.bio}</p>
                      ) : (
                        <p className="text-xs text-[#F0EDE4]/30">Noch keine Bio — füge eine hinzu, damit Rider dich finden</p>
                      )}
                      {(profile?.city || profile?.specialty) && (
                        <p className="text-xs text-[#F0EDE4]/35 mt-1">
                          {[profile.city, profile.specialty].filter(Boolean).join(' · ')}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <Link
                      href="/dashboard/profile"
                      className="flex items-center gap-1.5 text-xs bg-[#2AABAB] text-[#141414] font-semibold px-4 py-2 rounded-full hover:bg-[#3DBFBF] transition-all whitespace-nowrap"
                    >
                      Profil bearbeiten
                    </Link>
                    <Link
                      href={profile?.full_name ? `/builder/${profile.full_name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}` : '/builder'}
                      className="flex items-center gap-1.5 text-xs text-[#F0EDE4]/40 border border-[#F0EDE4]/10 px-4 py-2 rounded-full hover:text-[#F0EDE4] hover:border-[#F0EDE4]/25 transition-all justify-center"
                    >
                      <ExternalLink size={11} /> Vorschau
                    </Link>
                  </div>
                </div>

                {/* Profile completeness */}
                <div className="mt-4 pt-4 border-t border-[#F0EDE4]/5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-[#F0EDE4]/30">Profil-Vollständigkeit</span>
                    <span className="text-xs font-semibold text-[#2AABAB]">
                      {[profile?.bio, profile?.city, profile?.specialty, profile?.is_verified].filter(Boolean).length * 25}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-[#F0EDE4]/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#2AABAB] rounded-full transition-all"
                      style={{ width: `${[profile?.bio, profile?.city, profile?.specialty, profile?.is_verified].filter(Boolean).length * 25}%` }}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {[
                      { label: 'Bio', done: !!profile?.bio },
                      { label: 'Stadt', done: !!profile?.city },
                      { label: 'Spezialisierung', done: !!profile?.specialty },
                      { label: 'Verifiziert', done: !!profile?.is_verified },
                    ].map(item => (
                      <span key={item.label} className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        item.done
                          ? 'bg-[#2AABAB]/10 text-[#2AABAB] border border-[#2AABAB]/20'
                          : 'bg-[#F0EDE4]/5 text-[#F0EDE4]/25 border border-[#F0EDE4]/8'
                      }`}>
                        {item.done ? '✓ ' : ''}{item.label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Listings */}
            <div className="bg-[#1C1C1C] border border-[#F0EDE4]/6 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#F0EDE4]/5">
                <h2 className="text-sm font-semibold text-[#F0EDE4]">Meine Inserate</h2>
                <span className="text-xs text-[#F0EDE4]/35">{bikes?.length ?? 0} total</span>
              </div>
              <div className="divide-y divide-[#F0EDE4]/5">
                {bikes?.map(bike => (
                  <div key={bike.id} className="flex items-center gap-4 px-5 py-3.5">
                    <div className="w-12 h-9 rounded-lg bg-[#141414] border border-[#F0EDE4]/8 flex-shrink-0 overflow-hidden relative">
                      {bike.bike_images?.[0]?.url ? (
                        <img src={bike.bike_images[0].url} alt={bike.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center opacity-25">
                          <svg width="24" height="17" viewBox="0 0 48 34" fill="none">
                            <circle cx="8" cy="26" r="7" stroke="white" strokeWidth="1.5"/>
                            <circle cx="40" cy="26" r="7" stroke="white" strokeWidth="1.5"/>
                            <path d="M8 26 L15 8 L24 11 L33 6 L40 26" stroke="white" strokeWidth="1.5" fill="none" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#F0EDE4] truncate">{bike.title}</p>
                      <p className="text-xs text-[#F0EDE4]/35">{formatPrice(bike.price)} · {bike.view_count ?? 0} Aufrufe</p>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${
                      bike.status === 'active' ? 'bg-green-500/10 text-green-400'
                      : bike.status === 'sold'   ? 'bg-[#F0EDE4]/5 text-[#F0EDE4]/30'
                      : 'bg-amber-500/10 text-amber-400'
                    }`}>
                      {bike.status === 'active' ? 'Aktiv' : bike.status === 'sold' ? 'Verkauft' : 'Entwurf'}
                    </span>
                    <Link href={`/bikes/${bike.id}/edit`} className="text-xs text-[#F0EDE4]/30 hover:text-[#F0EDE4] transition-colors flex-shrink-0">
                      Bearbeiten
                    </Link>
                  </div>
                ))}
                {!bikes?.length && (
                  <div className="px-5 py-10 text-center">
                    <p className="text-sm text-[#F0EDE4]/30 mb-3">Noch keine Inserate</p>
                    <Link href="/bikes/new" className="text-sm text-[#2AABAB] hover:text-[#3DBFBF] transition-colors">
                      Erstes Inserat erstellen →
                    </Link>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* RIGHT — Messages */}
          <div className="flex flex-col gap-5">
            <div className="bg-[#1C1C1C] border border-[#F0EDE4]/6 rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-[#F0EDE4]/5">
                <h2 className="text-sm font-semibold text-[#F0EDE4]">Nachrichten</h2>
              </div>
              <div className="divide-y divide-[#F0EDE4]/5">
                {conversations?.map((conv) => (
                  <Link
                    key={conv.id}
                    href={`/dashboard?conversation=${conv.id}`}
                    className="flex items-start gap-3 px-4 py-3 hover:bg-[#141414] transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#2AABAB]/15 border border-[#2AABAB]/20 flex items-center justify-center text-xs font-bold text-[#2AABAB] flex-shrink-0 mt-0.5">
                      {(conv.profiles?.full_name ?? conv.profiles?.username ?? '?').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#F0EDE4]">
                        {conv.profiles?.full_name ?? conv.profiles?.username}
                      </p>
                      <p className="text-xs text-[#F0EDE4]/35 truncate">{conv.bikes?.title}</p>
                    </div>
                    <ChevronRight size={14} className="text-[#F0EDE4]/20 flex-shrink-0 mt-1" />
                  </Link>
                ))}
                {!conversations?.length && (
                  <p className="px-5 py-8 text-sm text-[#F0EDE4]/30 text-center">Keine Nachrichten</p>
                )}
              </div>
            </div>

            {/* Quick links */}
            <div className="bg-[#1C1C1C] border border-[#F0EDE4]/6 rounded-2xl p-4">
              <p className="text-xs text-[#F0EDE4]/25 uppercase tracking-widest font-semibold mb-3">Schnellzugriff</p>
              {[
                { label: 'Neues Inserat',    href: '/bikes/new',         icon: <Plus size={13}/> },
                { label: 'Karte öffnen',     href: '/map',               icon: <Eye size={13}/> },
                ...(isBuilder ? [{ label: 'Profil bearbeiten', href: '/dashboard/profile', icon: <User size={13}/> }] : []),
              ].map(l => (
                <Link key={l.href} href={l.href}
                  className="flex items-center gap-2.5 py-2.5 text-xs text-[#F0EDE4]/50 hover:text-[#F0EDE4] transition-colors border-b border-[#F0EDE4]/5 last:border-0">
                  <span className="text-[#F0EDE4]/25">{l.icon}</span>
                  {l.label}
                  <ChevronRight size={11} className="ml-auto text-[#F0EDE4]/20" />
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
