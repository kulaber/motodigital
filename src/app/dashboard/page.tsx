import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Eye, ChevronRight, Users, Wrench, Radio, BarChart3, Shield, Settings, Star, Bike, User } from 'lucide-react'
import UpgradeSuccessToast from '@/components/werkstatt/UpgradeSuccessToast'
import { PageViewsChart } from '@/components/dashboard/PageViewsChart'
import { BuilderAnalytics } from '@/components/dashboard/BuilderAnalytics'
import type { Database } from '@/types/database'

/** Extracted outside the component so React compiler doesn't flag Date.now() as impure */
function getCurrentTimestamp() { return Date.now() }

type BikeRow = Database['public']['Tables']['bikes']['Row']
type BikeImageRow = Database['public']['Tables']['bike_images']['Row']

type DashboardBike = Pick<BikeRow, 'id' | 'title' | 'status' | 'price' | 'view_count' | 'created_at'> & { slug?: string | null } & {
  bike_images: Pick<BikeImageRow, 'url' | 'is_cover'>[]
}

export const metadata: Metadata = { title: 'Dashboard' }

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await (supabase.from('profiles') as any)
    .select('full_name, role, city, specialty, bio, bio_long, is_verified, avatar_url, slug, tags, address, lat, lng, instagram_url, tiktok_url, website_url, youtube_url')
    .eq('id', user.id)
    .maybeSingle() as { data: { full_name: string | null; role: string; city: string | null; specialty: string | null; bio: string | null; bio_long: string | null; is_verified: boolean; avatar_url: string | null; slug: string | null; tags: string[] | null; address: string | null; lat: number | null; lng: number | null; instagram_url: string | null; tiktok_url: string | null; website_url: string | null; youtube_url: string | null } | null }

  // Riders don't need the dashboard overview — redirect to garage
  if (profile?.role === 'rider') redirect('/dashboard/meine-garage')

  const [{ data: bikes }, { count: savedBikesCount }, { count: savedBuildersCount }, { data: builderMedia }] = await Promise.all([
    supabase
      .from('bikes')
      .select('id, title, slug, status, price, view_count, created_at, bike_images(url, is_cover, position)')
      .eq('seller_id', user.id)
      .order('created_at', { ascending: false }) as unknown as Promise<{ data: DashboardBike[] | null, error: unknown }>,
    supabase.from('saved_bikes').select('bike_id', { count: 'exact', head: true }).eq('user_id', user.id) as unknown as Promise<{ count: number | null }>,
    supabase.from('saved_builders').select('builder_id', { count: 'exact', head: true }).eq('user_id', user.id) as unknown as Promise<{ count: number | null }>,
    (supabase.from('builder_media') as any)
      .select('id, url, type, title, position')
      .eq('builder_id', user.id)
      .order('position', { ascending: true }) as Promise<{ data: { id: string; url: string; type: string; title: string | null; position: number }[] | null, error: unknown }>,
  ])

  const totalViews = bikes?.reduce((acc, b) => acc + (b.view_count ?? 0), 0) ?? 0
  const activeCount = bikes?.filter(b => b.status === 'active').length ?? 0
  const _coverImage = builderMedia?.find(m => m.title === 'cover') ?? null
  const _galleryCount = builderMedia?.filter(m => m.title !== 'cover').length ?? 0
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
    try {
      const sevenDaysAgo = new Date(getCurrentTimestamp() - 7 * 24 * 60 * 60 * 1000).toISOString()

      const [buildersTotal, buildersLive, ridersTotal, ridersOnlineResult] = await Promise.all([
        (supabase.from('profiles') as any).select('id', { count: 'exact', head: true }).eq('role', 'custom-werkstatt') as Promise<{ count: number | null }>,
        (supabase.from('profiles') as any).select('id', { count: 'exact', head: true }).eq('role', 'custom-werkstatt').eq('is_verified', true) as Promise<{ count: number | null }>,
        (supabase.from('profiles') as any).select('id', { count: 'exact', head: true }).eq('role', 'rider').eq('is_verified', true) as Promise<{ count: number | null }>,
        (supabase.from('profiles') as any).select('id', { count: 'exact', head: true }).gte('last_seen_at', sevenDaysAgo) as Promise<{ count: number | null }>,
      ])

      adminStats = {
        buildersTotal: buildersTotal.count ?? 0,
        buildersLive: buildersLive.count ?? 0,
        ridersTotal: ridersTotal.count ?? 0,
        ridersOnline: ridersOnlineResult.count ?? 0,
      }
    } catch (e) {
      console.error('Failed to load admin stats:', e)
      adminStats = { buildersTotal: 0, buildersLive: 0, ridersTotal: 0, ridersOnline: 0 }
    }
  }

  // Page view analytics (for superadmin) — raw data passed to client component
  let rawPageViews: { path: string; section: string; created_at: string }[] = []

  if (isSuperAdmin) {
    const sevenDaysAgoDate = new Date(getCurrentTimestamp() - 7 * 24 * 60 * 60 * 1000).toISOString()

    const { data: pvData } = await (supabase
      .from('page_views') as any)
      .select('path, section, created_at')
      .gte('created_at', sevenDaysAgoDate)
      .order('created_at', { ascending: true })

    if (pvData?.length) {
      rawPageViews = pvData as { path: string; section: string; created_at: string }[]
    }
  }

  // Builder analytics — profile views, contact clicks, bike views
  type BuilderStats = {
    profileViews: { created_at: string }[]
    contactClicks: { created_at: string }[]
    bikeViews: { path: string; created_at: string }[]
    bikeSlugMap: Record<string, string>
  }
  let builderStats: BuilderStats | null = null

  if (isBuilder && profile?.slug) {
    try {
      const { createClient: createAdminClient } = await import('@supabase/supabase-js')
      const adminClient = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
      )
      const thirtyDaysAgo = new Date(getCurrentTimestamp() - 30 * 24 * 60 * 60 * 1000).toISOString()

      // Build bike slug → title map and path patterns
      const bikeSlugMap: Record<string, string> = {}
      const bikePaths: string[] = []
      for (const b of bikes ?? []) {
        const key = (b as DashboardBike & { slug?: string | null }).slug ?? b.id
        bikeSlugMap[key] = b.title
        bikePaths.push(`/custom-bike/${key}`)
      }

      const [pvProfile, pvContact, pvBikes] = await Promise.all([
        (adminClient.from('page_views') as any)
          .select('created_at')
          .eq('path', `/custom-werkstatt/${profile.slug}`)
          .gte('created_at', thirtyDaysAgo) as Promise<{ data: { created_at: string }[] | null }>,
        (adminClient.from('page_views') as any)
          .select('created_at')
          .eq('path', `/__event/contact-click/${user.id}`)
          .gte('created_at', thirtyDaysAgo) as Promise<{ data: { created_at: string }[] | null }>,
        bikePaths.length > 0
          ? (adminClient.from('page_views') as any)
              .select('path, created_at')
              .in('path', bikePaths)
              .gte('created_at', thirtyDaysAgo) as Promise<{ data: { path: string; created_at: string }[] | null }>
          : Promise.resolve({ data: [] as { path: string; created_at: string }[] }),
      ])

      builderStats = {
        profileViews: pvProfile.data ?? [],
        contactClicks: pvContact.data ?? [],
        bikeViews: pvBikes.data ?? [],
        bikeSlugMap,
      }
    } catch (e) {
      console.error('Failed to load builder analytics:', e)
    }
  }

  return (
    <div className={`max-w-5xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-32 ${isRider ? 'md:h-auto md:overflow-auto h-[calc(100dvh-140px)] overflow-hidden' : ''}`}>
      <Suspense fallback={null}>
        <UpgradeSuccessToast />
      </Suspense>

        {/* Header row */}
        <div className="flex items-center justify-between gap-3 mb-6 sm:mb-8">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#222222]">
              {isBuilder
                ? (profile?.full_name ?? 'Dashboard')
                : profile?.full_name ? `Hallo ${profile.full_name.split(' ')[0]}` : 'Hallo'}
            </h1>
          </div>
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
                  label: 'Custom Werkstätten gesamt',
                  value: adminStats.buildersTotal,
                  sub: 'registriert',
                  icon: <Wrench size={15} />,
                },
                {
                  label: 'Custom Werkstätten LIVE',
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

            {/* Page views chart with filters & drill-down */}
            <PageViewsChart pageViews={rawPageViews} />
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
            <Link href={profile?.slug ? `/rider/${profile.slug}` : '/dashboard/profile'} className="bg-white border border-[#222222]/6 hover:border-[#222222]/15 rounded-2xl p-4 flex flex-col items-center justify-center aspect-square transition-colors group">
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
          <div className="mb-8">
            {builderStats ? (
              <BuilderAnalytics
                profileViews={builderStats.profileViews}
                contactClicks={builderStats.contactClicks}
                bikeViews={builderStats.bikeViews}
                bikeSlugMap={builderStats.bikeSlugMap}
              />
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Aktive Custom Bikes', value: activeCount, icon: <Bike size={16}/> },
                  { label: 'Gesamte Aufrufe',     value: totalViews,  icon: <Eye size={16}/> },
                ].map(s => (
                  <div key={s.label} className="bg-white border border-[#222222]/6 rounded-2xl p-4">
                    <div className="flex items-center gap-2 text-[#222222]/40 mb-2">{s.icon}<span className="text-xs">{s.label}</span></div>
                    <p className="text-2xl font-bold text-[#222222]">{s.value}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : null}

        {/* empty — profile card and bike list removed for workshop dashboard */}

    </div>
  )
}
