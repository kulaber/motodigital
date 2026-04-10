import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/utils'
import Link from 'next/link'
import { Plus, Eye, ExternalLink, ChevronRight, Users, Wrench, Radio, BarChart3, Shield, Settings, Star, Bike, User } from 'lucide-react'
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
  const coverImage = builderMedia?.find(m => m.title === 'cover') ?? null
  const galleryCount = builderMedia?.filter(m => m.title !== 'cover').length ?? 0
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

        {!isRider && !isSuperAdmin && <div className="flex flex-col gap-5 mt-0">

            {/* Builder profile card — only for builders, not superadmin (uses /admin/custom-werkstatt) */}
            {isBuilder && !isSuperAdmin && (() => {
              const completenessItems = [
                { label: 'Logo', done: !!profile?.avatar_url },
                { label: 'Titelbild', done: !!coverImage },
                { label: 'Name', done: !!profile?.full_name },
                { label: 'Über die Werkstatt', done: !!profile?.bio_long },
                { label: 'Leistungen', done: (profile?.tags?.length ?? 0) > 0 },
                { label: 'Umbaustile', done: !!profile?.specialty },
                { label: 'Adresse', done: !!profile?.address && !!profile?.lat && !!profile?.lng },
                { label: 'Social Media', done: !!(profile?.instagram_url || profile?.tiktok_url || profile?.website_url || profile?.youtube_url) },
                { label: 'Galerie', done: galleryCount > 0 },
              ]
              const completenessPercent = Math.round(completenessItems.filter(i => i.done).length / completenessItems.length * 100)

              return (
                <div className="bg-white border border-[#DDDDDD]/20 rounded-2xl overflow-hidden">
                  {/* Cover image banner */}
                  <div className="relative aspect-[3/1] w-full overflow-hidden">
                    <Image src={coverImage?.url ?? '/images/workshop-default.png'} alt="Titelbild" fill sizes="(max-width: 640px) 100vw, 720px" className="object-cover" />
                  </div>

                  <div className="px-5 pb-5">
                    {/* Avatar overlapping cover */}
                    <div className="relative -mt-8 mb-3 z-10">
                      <div className="relative w-16 h-16 rounded-2xl border-4 border-white bg-[#06a5a5] flex items-center justify-center flex-shrink-0 overflow-hidden shadow-sm">
                        {profile?.avatar_url ? (
                          <Image src={profile.avatar_url} alt={profile.full_name ?? 'Logo'} fill sizes="64px" className="object-cover" />
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2834.6 2834.6" width="28" height="28">
                            <path fill="white" d="M1417,167L298.8,627.4L430.3,1943l657.8,723.6v-592l328.9,197.3l328.9-197.3v592l657.8-723.6l131.6-1315.6L1417,167z M2191.2,1611.1l-773.9,451.4v0v0l0,0v0l-773.9-451.4V834.4L1185.2,615v537.7l232.2,135.4l232.2-135.4V615l541.7,219.4V1611.1z" />
                          </svg>
                        )}
                      </div>
                    </div>

                    {/* Profile info */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-[#222222] mb-0.5">Mein Custom Werkstatt Profil</p>
                        {(profile?.bio_long || profile?.bio) ? (
                          <p className="text-xs text-[#222222]/40 leading-relaxed max-w-xs line-clamp-2">{profile?.bio_long ?? profile?.bio}</p>
                        ) : (
                          <p className="text-xs text-[#222222]/30">Noch keine Beschreibung — füge eine hinzu, damit Rider dich finden</p>
                        )}
                        {(profile?.city || profile?.specialty) && (
                          <p className="text-xs text-[#222222]/35 mt-1">
                            {[profile.city, profile.specialty].filter(Boolean).join(' · ')}
                          </p>
                        )}
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

                    {/* Profile completeness — hidden when 100% */}
                    {completenessPercent < 100 && (
                    <div className="mt-4 pt-4 border-t border-[#222222]/5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-[#222222]/30">Profil-Vollständigkeit</span>
                        <span className="text-xs font-semibold text-[#717171]">{completenessPercent}%</span>
                      </div>
                      <div className="h-1.5 bg-[#222222]/5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#06a5a5] rounded-full transition-all"
                          style={{ width: `${completenessPercent}%` }}
                        />
                      </div>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {completenessItems.map(item => (
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
                    )}
                  </div>
                </div>
              )
            })()}

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


        </div>}

    </div>
  )
}
