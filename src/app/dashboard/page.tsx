import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/utils'
import { getWeeklyVisitors } from '@/lib/vercel-analytics'
import Link from 'next/link'
import { Plus, Eye, MessageCircle, TrendingUp, ExternalLink, ChevronRight, Users, Wrench, Radio, BarChart3, Shield, Settings, Star, Bike, User } from 'lucide-react'
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
    .select('full_name, role, city, specialty, bio, is_verified, avatar_url, slug')
    .eq('id', user.id)
    .maybeSingle() as { data: { full_name: string | null; role: string; city: string | null; specialty: string | null; bio: string | null; is_verified: boolean; avatar_url: string | null; slug: string | null } | null }

  const [{ data: bikes }, { data: conversations }, { count: savedBikesCount }, { count: savedBuildersCount }] = await Promise.all([
    supabase
      .from('bikes')
      .select('id, title, status, price, view_count, created_at, bike_images(id, url, is_cover, position, media_type, thumbnail_url)')
      .eq('seller_id', user.id)
      .order('created_at', { ascending: false }) as unknown as Promise<{ data: DashboardBike[] | null, error: unknown }>,
    supabase
      .from('conversations')
      .select('id, last_message_at, bikes(title), profiles:buyer_id(username, full_name)')
      .or(`seller_id.eq.${user.id},buyer_id.eq.${user.id}`)
      .order('last_message_at', { ascending: false })
      .limit(10) as unknown as Promise<{ data: DashboardConversation[] | null, error: unknown }>,
    supabase.from('saved_bikes').select('bike_id', { count: 'exact', head: true }).eq('user_id', user.id) as unknown as Promise<{ count: number | null }>,
    supabase.from('saved_builders').select('builder_id', { count: 'exact', head: true }).eq('user_id', user.id) as unknown as Promise<{ count: number | null }>,
  ])

  const totalViews = bikes?.reduce((acc, b) => acc + (b.view_count ?? 0), 0) ?? 0
  const activeCount = bikes?.filter(b => b.status === 'active').length ?? 0
  const isRider = profile?.role === 'rider'
  const isBuilder = profile?.role === 'custom-werkstatt'
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
      (supabase.from('profiles') as any).select('id', { count: 'exact', head: true }).eq('role', 'custom-werkstatt') as Promise<{ count: number | null }>,
      (supabase.from('profiles') as any).select('id', { count: 'exact', head: true }).eq('role', 'custom-werkstatt').eq('is_verified', true) as Promise<{ count: number | null }>,
      (supabase.from('profiles') as any).select('id', { count: 'exact', head: true }).eq('role', 'rider').eq('is_verified', true) as Promise<{ count: number | null }>,
      supabase.auth.admin.listUsers({ perPage: 1000 }),
    ])

    // eslint-disable-next-line react-hooks/purity
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
        // eslint-disable-next-line react-hooks/purity
        date: new Date(Date.now() - (6 - i) * 86400000).toISOString().split('T')[0],
        visitors: v,
      }))
  const maxVisitors = Math.max(...chartData.map(d => d.visitors), 1)

  return (
    <div className={`max-w-5xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-16 ${isRider ? 'md:h-auto md:overflow-auto h-[calc(100dvh-140px)] overflow-hidden' : ''}`}>

        {/* Header row */}
        <div className="flex items-center justify-between gap-3 mb-6 sm:mb-8">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#222222]">
              {profile?.full_name ? `Hallo ${profile.full_name.split(' ')[0]}` : 'Hallo'}
            </h1>
          </div>
          {!isRider && !isSuperAdmin && (
            <Link
              href="/bikes/new"
              className="inline-flex items-center gap-2 bg-[#06a5a5] text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-[#058f8f] transition-all"
            >
              <Plus size={14} />
              Bike hinzufügen
            </Link>
          )}
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
                },
                {
                  label: 'Builder LIVE',
                  value: adminStats.buildersLive,
                  sub: 'verifiziert & aktiv',
                  icon: <Radio size={15} />,
                },
                {
                  label: 'Rider registriert',
                  value: adminStats.ridersTotal,
                  sub: 'verifizierte Accounts',
                  icon: <Users size={15} />,
                },
                {
                  label: 'Rider LIVE',
                  value: adminStats.ridersOnline,
                  sub: 'letzte 7 Tage',
                  icon: <BarChart3 size={15} />,
                },
              ].map(s => (
                <div key={s.label} className="rounded-2xl border border-[#222222]/8 bg-[#222222]/4 p-4">
                  <div className="flex items-center gap-2 mb-2 text-[#222222]/40">
                    {s.icon}
                    <span className="text-xs">{s.label}</span>
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold text-[#222222]">{s.value}</p>
                  <p className="text-xs text-[#222222]/25 mt-0.5">{s.sub}</p>
                </div>
              ))}
            </div>

            {/* Visitor chart placeholder */}
            <div className="bg-white border border-[#222222]/6 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-semibold text-[#222222]">Besucher</p>
                  <p className="text-xs text-[#222222]/30 mt-0.5">
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
                  <span className="text-[10px] bg-[#222222]/10 text-[#717171] border border-[#222222]/20 px-2.5 py-1 rounded-full font-semibold">
                    Live Daten
                  </span>
                )}
              </div>
              {/* Bar chart */}
              <div className="flex items-end gap-1.5 h-20">
                {chartData.map((d, i) => (
                  <div key={i} className="flex-1 group relative">
                    <div
                      className="w-full rounded-sm bg-[#222222]/25 group-hover:bg-[#222222]/50 transition-colors"
                      style={{ height: `${(d.visitors / maxVisitors) * 100}%` }}
                    />
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 hidden group-hover:block bg-white border border-[#222222]/10 rounded px-1.5 py-0.5 text-[10px] text-[#222222] whitespace-nowrap z-10">
                      {d.visitors}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-2">
                {chartData.map((d, i) => (
                  <span key={i} className="flex-1 text-center text-[10px] text-[#222222]/20">
                    {new Date(d.date).toLocaleDateString('de-DE', { weekday: 'short' })}
                  </span>
                ))}
              </div>
              {!hasRealVisitors && (
                <p className="text-[10px] text-[#222222]/20 mt-3">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { label: 'Custom Werkstätte', desc: 'Profile verwalten & verifizieren', href: '/admin/custom-werkstatt', count: adminStats?.buildersTotal },
                { label: 'Rider', desc: 'Rider verwalten', href: '/admin/riders', count: adminStats?.ridersTotal },
                { label: 'Magazin', desc: 'Beiträge erstellen & bearbeiten', href: '/admin/magazine', count: null },
                { label: 'Events', desc: 'Events verwalten', href: '/admin/events', count: null },
              ].map(item => (
                <Link key={item.href} href={item.href}
                  className="flex items-center justify-between p-4 bg-white border border-[#222222]/6 hover:border-[#DDDDDD]/30 rounded-2xl transition-all group">
                  <div>
                    <p className="text-sm font-semibold text-[#222222] group-hover:text-[#717171] transition-colors">{item.label}</p>
                    <p className="text-xs text-[#222222]/30 mt-0.5">{item.desc}</p>
                  </div>
                  <ChevronRight size={14} className="text-[#222222]/20 group-hover:text-[#717171] transition-colors" />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── RIDER DASHBOARD ── */}
        {isRider ? (
          <div className="grid grid-cols-2 gap-3 max-w-2xl">

            {/* Rider Profil */}
            <Link href="/dashboard/profile" className="bg-white border border-[#222222]/6 hover:border-[#222222]/15 rounded-2xl p-4 flex flex-col items-center justify-center aspect-square transition-colors group">
              <div className="relative w-14 h-14 rounded-full bg-[#F7F7F7] flex-shrink-0 overflow-hidden mb-2">
                {profile?.avatar_url ? (
                  <Image src={profile.avatar_url} alt={profile.full_name ?? 'Profil'} fill sizes="56px" className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User size={20} className="text-[#222222]/25" />
                  </div>
                )}
              </div>
              <p className="text-[10px] font-semibold text-[#222222]/35 uppercase tracking-wider mb-0.5">Rider Profil</p>
              <p className="text-xs font-semibold text-[#222222] truncate max-w-full text-center">
                {profile?.full_name ?? 'Profil bearbeiten'}
              </p>
            </Link>

            {/* Meine Garage */}
            <Link href="/dashboard/meine-garage" className="bg-white border border-[#222222]/6 hover:border-[#222222]/15 rounded-2xl overflow-hidden flex flex-col aspect-square transition-colors group">
              <div className="relative flex-1 bg-[#F3F3F3]">
                {bikes?.[0]?.bike_images?.[0]?.url ? (
                  <Image src={bikes[0].bike_images[0].url} alt={bikes[0].title} fill sizes="(max-width: 640px) 50vw, 320px" className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Bike size={24} className="text-[#222222]/10" />
                  </div>
                )}
              </div>
              <div className="p-3">
                <p className="text-[10px] font-semibold text-[#222222]/35 uppercase tracking-wider mb-0.5">Meine Garage</p>
                <p className="text-xs font-semibold text-[#222222] truncate">
                  {bikes?.[0]?.title ?? 'Noch kein Bike'}
                </p>
              </div>
            </Link>

            {/* Merkliste */}
            <Link href="/dashboard/merkliste" className="bg-white border border-[#222222]/6 hover:border-[#222222]/15 rounded-2xl p-4 flex flex-col items-center justify-center aspect-square transition-colors group">
              <div className="w-12 h-12 rounded-xl bg-[#F7F7F7] flex items-center justify-center mb-2">
                <Star size={20} className="text-[#222222]/25" />
              </div>
              <p className="text-[10px] font-semibold text-[#222222]/35 uppercase tracking-wider mb-0.5">Merkliste</p>
              <p className="text-xs font-semibold text-[#222222]">
                {(savedBikesCount ?? 0) + (savedBuildersCount ?? 0)} gespeichert
              </p>
            </Link>

            {/* Einstellungen */}
            <Link href="/dashboard/account" className="bg-white border border-[#222222]/6 hover:border-[#222222]/15 rounded-2xl p-4 flex flex-col items-center justify-center aspect-square transition-colors group">
              <div className="w-12 h-12 rounded-xl bg-[#F7F7F7] flex items-center justify-center mb-2">
                <Settings size={20} className="text-[#222222]/25" />
              </div>
              <p className="text-[10px] font-semibold text-[#222222]/35 uppercase tracking-wider mb-0.5">Einstellungen</p>
              <p className="text-xs font-semibold text-[#222222]">Kontoeinstellungen</p>
            </Link>


          </div>

        ) : !isSuperAdmin ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            {[
              { label: 'Aktive Inserate', value: activeCount,                   icon: <TrendingUp size={16}/> },
              { label: 'Gesamte Aufrufe', value: totalViews,                    icon: <Eye size={16}/> },
              { label: 'Nachrichten',     value: conversations?.length ?? 0,    icon: <MessageCircle size={16}/> },
              { label: 'Inserate gesamt', value: bikes?.length ?? 0,            icon: <Plus size={16}/> },
            ].map(s => (
              <div key={s.label} className="bg-white border border-[#222222]/6 rounded-2xl p-4">
                <div className="flex items-center gap-2 text-[#222222]/40 mb-2">{s.icon}<span className="text-xs">{s.label}</span></div>
                <p className="text-2xl font-bold text-[#222222]">{s.value}</p>
              </div>
            ))}
          </div>
        ) : null}

        {!isRider && !isSuperAdmin && <div className="flex flex-col gap-5 mt-0">

            {/* Builder profile card — only for builders, not superadmin (uses /admin/custom-werkstatt) */}
            {isBuilder && !isSuperAdmin && (
              <div className="bg-white border border-[#DDDDDD]/20 rounded-2xl p-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 pointer-events-none"
                  style={{ background: 'radial-gradient(circle, rgba(42,171,171,0.08) 0%, transparent 65%)', transform: 'translate(30%,-30%)' }} />
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 relative">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#222222]/12 border border-[#DDDDDD]/20 flex items-center justify-center flex-shrink-0">
                      <User size={20} className="text-[#717171]" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#222222] mb-0.5">Custom Werkstatt Profil</p>
                      {profile?.bio ? (
                        <p className="text-xs text-[#222222]/40 leading-relaxed max-w-xs line-clamp-2">{profile.bio}</p>
                      ) : (
                        <p className="text-xs text-[#222222]/30">Noch keine Bio — füge eine hinzu, damit Rider dich finden</p>
                      )}
                      {(profile?.city || profile?.specialty) && (
                        <p className="text-xs text-[#222222]/35 mt-1">
                          {[profile.city, profile.specialty].filter(Boolean).join(' · ')}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-row sm:flex-col gap-2 flex-shrink-0">
                    <Link
                      href="/dashboard/profile"
                      className="flex items-center gap-1.5 text-xs bg-[#06a5a5] text-white font-semibold px-4 py-2 rounded-full hover:bg-[#058f8f] transition-all whitespace-nowrap"
                    >
                      Profil bearbeiten
                    </Link>
                    <Link
                      href={profile?.slug ? `/custom-werkstatt/${profile.slug}` : '/custom-werkstatt'}
                      className="flex items-center gap-1.5 text-xs text-[#222222]/40 border border-[#222222]/10 px-4 py-2 rounded-full hover:text-[#222222] hover:border-[#222222]/25 transition-all justify-center"
                    >
                      <ExternalLink size={11} /> Vorschau
                    </Link>
                  </div>
                </div>

                {/* Profile completeness */}
                <div className="mt-4 pt-4 border-t border-[#222222]/5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-[#222222]/30">Profil-Vollständigkeit</span>
                    <span className="text-xs font-semibold text-[#717171]">
                      {[profile?.bio, profile?.city, profile?.specialty, profile?.is_verified].filter(Boolean).length * 25}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-[#222222]/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#06a5a5] rounded-full transition-all"
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
                          ? 'bg-[#222222]/10 text-[#717171] border border-[#DDDDDD]/20'
                          : 'bg-[#222222]/5 text-[#222222]/25 border border-[#222222]/8'
                      }`}>
                        {item.done ? '✓ ' : ''}{item.label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Listings */}
            {!isSuperAdmin && !isRider && <div className="bg-white border border-[#222222]/6 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#222222]/5">
                <h2 className="text-sm font-semibold text-[#222222]">Meine Custom-Bikes</h2>
                <span className="text-xs text-[#222222]/35">{bikes?.length ?? 0} total</span>
              </div>
              <div className="divide-y divide-[#222222]/5">
                {bikes?.map(bike => (
                  <div key={bike.id} className="flex items-center gap-4 px-5 py-3.5">
                    <div className="w-12 h-9 rounded-lg bg-white border border-[#222222]/8 flex-shrink-0 overflow-hidden relative">
                      {bike.bike_images?.[0]?.url ? (
                        <Image src={bike.bike_images[0].url} alt={bike.title} fill sizes="48px" className="object-cover" />
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
                      <p className="text-sm font-medium text-[#222222] truncate">{bike.title}</p>
                      <p className="text-xs text-[#222222]/35">{formatPrice(bike.price)} · {bike.view_count ?? 0} Aufrufe</p>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${
                      bike.status === 'active' ? 'bg-green-500/10 text-green-400'
                      : bike.status === 'sold'   ? 'bg-[#222222]/5 text-[#222222]/30'
                      : 'bg-amber-500/10 text-amber-400'
                    }`}>
                      {bike.status === 'active' ? 'Aktiv' : bike.status === 'sold' ? 'Verkauft' : 'Entwurf'}
                    </span>
                    <Link href={`/bikes/${bike.id}/edit`} className="text-xs text-[#222222]/30 hover:text-[#222222] transition-colors flex-shrink-0">
                      Bearbeiten
                    </Link>
                  </div>
                ))}
                {!bikes?.length && (
                  <div className="px-5 py-10 text-center">
                    <p className="text-sm text-[#222222]/30 mb-3">Noch keine Custom-Bikes</p>
                    <Link href="/bikes/new" className="text-sm text-[#717171] hover:text-[#06a5a5] transition-colors">
                      Custom-Bike erstellen →
                    </Link>
                  </div>
                )}
              </div>
            </div>}

            {/* Nachrichten */}
            {!isSuperAdmin && !isRider && <div className="bg-white border border-[#222222]/6 rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-[#222222]/5">
                <h2 className="text-sm font-semibold text-[#222222]">Nachrichten</h2>
              </div>
              <div className="divide-y divide-[#222222]/5">
                {conversations?.map((conv) => (
                  <Link
                    key={conv.id}
                    href={`/dashboard?conversation=${conv.id}`}
                    className="flex items-start gap-3 px-4 py-3 hover:bg-[#F7F7F7] transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#222222]/15 border border-[#DDDDDD]/20 flex items-center justify-center text-xs font-bold text-[#717171] flex-shrink-0 mt-0.5">
                      {(conv.profiles?.full_name ?? conv.profiles?.username ?? '?').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#222222]">
                        {conv.profiles?.full_name ?? conv.profiles?.username}
                      </p>
                      <p className="text-xs text-[#222222]/35 truncate">{conv.bikes?.title}</p>
                    </div>
                    <ChevronRight size={14} className="text-[#222222]/20 flex-shrink-0 mt-1" />
                  </Link>
                ))}
                {!conversations?.length && (
                  <p className="px-5 py-8 text-sm text-[#222222]/30 text-center">Keine Nachrichten</p>
                )}
              </div>
            </div>}

        </div>}
    </div>
  )
}
