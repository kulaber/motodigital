import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/utils'
import { getWeeklyVisitors } from '@/lib/vercel-analytics'
import Link from 'next/link'
import { Plus, Eye, MessageCircle, TrendingUp, User, ExternalLink, ChevronRight, Users, Wrench, Radio, BarChart3, Shield, Settings } from 'lucide-react'
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
  const isBuilder = profile?.role === 'builder' || profile?.role === 'superadmin'
  const isSuperAdmin = profile?.role === 'superadmin'

  // Superadmin platform stats
  type AdminStats = {
    buildersTotal: number
    buildersLive: number
    ridersTotal: number
    ridersOnline: number
  }
  let adminStats: AdminStats | null = null

  if (isSuperAdmin) {
    const [buildersTotal, buildersLive, ridersTotal, authResult] = await Promise.all([
      (supabase.from('profiles') as any).select('id', { count: 'exact', head: true }).eq('role', 'builder') as Promise<{ count: number | null }>,
      (supabase.from('profiles') as any).select('id', { count: 'exact', head: true }).eq('role', 'builder').eq('is_verified', true) as Promise<{ count: number | null }>,
      (supabase.from('profiles') as any).select('id', { count: 'exact', head: true }).eq('role', 'rider').eq('is_verified', true) as Promise<{ count: number | null }>,
      supabase.auth.admin.listUsers({ perPage: 1000 }),
    ])

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const ridersOnline = authResult.data?.users?.filter(u =>
      u.last_sign_in_at && u.last_sign_in_at > sevenDaysAgo
    ).length ?? 0

    adminStats = {
      buildersTotal: buildersTotal.count ?? 0,
      buildersLive: buildersLive.count ?? 0,
      ridersTotal: ridersTotal.count ?? 0,
      ridersOnline,
    }
  }

  const weeklyVisitors = isSuperAdmin ? await getWeeklyVisitors() : []
  const hasRealVisitors = weeklyVisitors.length > 0
  const chartData = hasRealVisitors
    ? weeklyVisitors
    : [42, 68, 55, 91, 73, 84, 110].map((v, i) => ({
        date: new Date(Date.now() - (6 - i) * 86400000).toISOString().split('T')[0],
        visitors: v,
      }))
  const maxVisitors = Math.max(...chartData.map(d => d.visitors), 1)

  return (
    <div className="min-h-screen bg-[#141414]">
      <Header />
      <div className="max-w-5xl mx-auto px-4 pt-8 pb-12 lg:px-8">

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
            Neues Custom-Bike hinzufügen
          </Link>
        </div>

        {/* Superadmin Platform Stats */}
        {isSuperAdmin && adminStats && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Shield size={14} className="text-amber-400" />
              <p className="text-xs font-bold uppercase tracking-widest text-amber-400/80">Plattform Übersicht</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
              {[
                {
                  label: 'Builder gesamt',
                  value: adminStats.buildersTotal,
                  sub: 'registriert',
                  icon: <Wrench size={15} />,
                  color: 'text-teal',
                  bg: 'bg-teal/8 border-teal/15',
                },
                {
                  label: 'Builder LIVE',
                  value: adminStats.buildersLive,
                  sub: 'verifiziert & aktiv',
                  icon: <Radio size={15} />,
                  color: 'text-green-400',
                  bg: 'bg-green-500/8 border-green-500/15',
                },
                {
                  label: 'Rider registriert',
                  value: adminStats.ridersTotal,
                  sub: 'verifizierte Accounts',
                  icon: <Users size={15} />,
                  color: 'text-[#F0EDE4]',
                  bg: 'bg-[#F0EDE4]/5 border-[#F0EDE4]/10',
                },
                {
                  label: 'Rider online',
                  value: adminStats.ridersOnline,
                  sub: 'letzte 7 Tage',
                  icon: <BarChart3 size={15} />,
                  color: 'text-amber-400',
                  bg: 'bg-amber-500/8 border-amber-500/15',
                },
              ].map(s => (
                <div key={s.label} className={`rounded-2xl border p-4 ${s.bg}`}>
                  <div className={`flex items-center gap-2 mb-2 ${s.color} opacity-70`}>
                    {s.icon}
                    <span className="text-xs">{s.label}</span>
                  </div>
                  <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-[#F0EDE4]/25 mt-0.5">{s.sub}</p>
                </div>
              ))}
            </div>

            {/* Visitor chart placeholder */}
            <div className="bg-[#1C1C1C] border border-[#F0EDE4]/6 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-semibold text-[#F0EDE4]">Besucher</p>
                  <p className="text-xs text-[#F0EDE4]/30 mt-0.5">
                    {hasRealVisitors
                      ? `${chartData.reduce((s, d) => s + d.visitors, 0).toLocaleString('de-DE')} diese Woche`
                      : 'Letzte 7 Tage'}
                  </p>
                </div>
                {!hasRealVisitors && (
                  <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-full font-semibold">
                    Token fehlt
                  </span>
                )}
                {hasRealVisitors && (
                  <span className="text-[10px] bg-teal/10 text-teal border border-teal/20 px-2.5 py-1 rounded-full font-semibold">
                    Live Daten
                  </span>
                )}
              </div>
              {/* Bar chart */}
              <div className="flex items-end gap-1.5 h-20">
                {chartData.map((d, i) => (
                  <div key={i} className="flex-1 group relative">
                    <div
                      className="w-full rounded-sm bg-teal/25 group-hover:bg-teal/50 transition-colors"
                      style={{ height: `${(d.visitors / maxVisitors) * 100}%` }}
                    />
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 hidden group-hover:block bg-[#141414] border border-creme/10 rounded px-1.5 py-0.5 text-[10px] text-creme whitespace-nowrap z-10">
                      {d.visitors}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-2">
                {chartData.map((d, i) => (
                  <span key={i} className="flex-1 text-center text-[10px] text-[#F0EDE4]/20">
                    {new Date(d.date).toLocaleDateString('de-DE', { weekday: 'short' })}
                  </span>
                ))}
              </div>
              {!hasRealVisitors && (
                <p className="text-[10px] text-[#F0EDE4]/20 mt-3">
                  * Platzhalterdaten — VERCEL_ACCESS_TOKEN + VERCEL_PROJECT_ID als Env-Variable setzen
                </p>
              )}
            </div>
          </div>
        )}

        {/* Admin navigation */}
        {isSuperAdmin && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Shield size={14} className="text-amber-400" />
              <p className="text-xs font-bold uppercase tracking-widest text-amber-400/80">Admin-Bereiche</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { label: 'Builder', desc: 'Profile verwalten & verifizieren', href: '/admin/builder', count: adminStats?.buildersTotal },
                { label: 'Magazin', desc: 'Beiträge erstellen & bearbeiten', href: '/admin/magazine', count: null },
                { label: 'Events', desc: 'Events verwalten', href: '/admin/events', count: null },
              ].map(item => (
                <Link key={item.href} href={item.href}
                  className="flex items-center justify-between p-4 bg-[#1C1C1C] border border-[#F0EDE4]/6 hover:border-[#2AABAB]/30 rounded-2xl transition-all group">
                  <div>
                    <p className="text-sm font-semibold text-[#F0EDE4] group-hover:text-[#2AABAB] transition-colors">{item.label}</p>
                    <p className="text-xs text-[#F0EDE4]/30 mt-0.5">{item.desc}</p>
                  </div>
                  <ChevronRight size={14} className="text-[#F0EDE4]/20 group-hover:text-[#2AABAB] transition-colors" />
                </Link>
              ))}
            </div>
          </div>
        )}

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

            {/* Builder profile card — only for builders, not superadmin (uses /admin/builder) */}
            {isBuilder && !isSuperAdmin && (
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
            {!isSuperAdmin && <div className="bg-[#1C1C1C] border border-[#F0EDE4]/6 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#F0EDE4]/5">
                <h2 className="text-sm font-semibold text-[#F0EDE4]">Meine Custom-Bikes</h2>
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
                    <p className="text-sm text-[#F0EDE4]/30 mb-3">Noch keine Custom-Bikes</p>
                    <Link href="/bikes/new" className="text-sm text-[#2AABAB] hover:text-[#3DBFBF] transition-colors">
                      Custom-Bike erstellen →
                    </Link>
                  </div>
                )}
              </div>
            </div>}

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
            {!isSuperAdmin && <div className="bg-[#1C1C1C] border border-[#F0EDE4]/6 rounded-2xl p-4">
              <p className="text-xs text-[#F0EDE4]/25 uppercase tracking-widest font-semibold mb-3">Schnellzugriff</p>
              {[
                { label: 'Neues Custom-Bike hinzufügen', href: '/bikes/new',          icon: <Plus size={13}/> },
                { label: 'Builder entdecken',           href: '/builder',              icon: <Eye size={13}/> },
                ...(isBuilder ? [{ label: 'Profil bearbeiten',     href: '/dashboard/profile',  icon: <User size={13}/> }] : []),
                { label: 'Konto-Einstellungen',         href: '/dashboard/account',    icon: <Settings size={13}/> },
              ].map(l => (
                <Link key={l.href} href={l.href}
                  className="flex items-center gap-2.5 py-2.5 text-xs text-[#F0EDE4]/50 hover:text-[#F0EDE4] transition-colors border-b border-[#F0EDE4]/5 last:border-0">
                  <span className="text-[#F0EDE4]/25">{l.icon}</span>
                  {l.label}
                  <ChevronRight size={11} className="ml-auto text-[#F0EDE4]/20" />
                </Link>
              ))}
            </div>}
          </div>

        </div>
      </div>
    </div>
  )
}
