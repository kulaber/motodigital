import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import Header from '@/components/layout/Header'

export const metadata: Metadata = {
  title: 'Werkstatt Dashboard — MotoDigital',
}

export default async function WerkstattDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // Werkstatt profile data
  const { data: profile } = await (supabase.from('profiles') as any)
    .select('id, full_name, slug, avatar_url')
    .eq('id', user.id)
    .maybeSingle()

  // Parallel: unread messages + page views for this werkstatt profile
  const [{ count: unreadMessages }, { count: profileViews }] = await Promise.all([
    (supabase.from('messages') as any)
      .select('id', { count: 'exact', head: true })
      .in(
        'conversation_id',
        (supabase.from('conversations') as any)
          .select('id')
          .or(`seller_id.eq.${user.id},buyer_id.eq.${user.id}`)
      )
      .neq('sender_id', user.id)
      .is('read_at', null),
    (supabase.from('page_views') as any)
      .select('id', { count: 'exact', head: true })
      .eq('path', `/custom-werkstatt/${profile?.slug}`),
  ])

  // Greeting based on time of day
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Guten Morgen' : hour < 18 ? 'Guten Tag' : 'Guten Abend'

  return (
    <div className="min-h-dvh bg-[#F7F7F7]">
      <Header />
      <div className="px-4 pt-6 pb-28 flex flex-col gap-5 max-w-lg mx-auto">
        {/* Greeting */}
        <div>
          <p className="text-xs text-[#222222]/40 mb-1">{greeting} 👋</p>
          <h1 className="text-2xl font-bold tracking-tight text-[#222222]">
            Dashboard
          </h1>
        </div>

        {/* Time filter — basis, wird in Session 05 voll implementiert */}
        <div className="flex gap-2 bg-white rounded-xl p-1 border border-[#222222]/6">
          {['Alle', '30 Tage', '7 Tage', 'Heute'].map((label, i) => (
            <button
              key={label}
              className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${
                i === 1
                  ? 'bg-[#E8A829]/10 text-[#E8A829] border border-[#E8A829]/30'
                  : 'text-[#222222]/40'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-2 gap-3">
          <KpiCard label="Profilbesuche" value={profileViews ?? 0} color="#E8A829" />
          <KpiCard label="Neue Anfragen" value={unreadMessages ?? 0} color="#222222" />
        </div>

        {/* Quick Access */}
        <div className="flex flex-col gap-2">
          <p className="text-[10px] text-[#222222]/30 uppercase tracking-widest">
            Schnellzugriff
          </p>
          <QuickLink
            href="/werkstatt/anfragen"
            icon="📩"
            title="Anfragen bearbeiten"
            subtitle="Alle eingehenden Nachrichten"
          />
          <QuickLink
            href="/werkstatt/bikes"
            icon="🏍"
            title="Meine Bikes"
            subtitle="Portfolio verwalten"
          />
          {profile?.slug && (
            <QuickLink
              href={`/custom-werkstatt/${profile.slug}`}
              icon="👁"
              title="Profilansicht"
              subtitle="So sehen Besucher dein Profil"
            />
          )}
        </div>
      </div>
    </div>
  )
}

function KpiCard({
  label,
  value,
  color,
}: {
  label: string
  value: number
  color: string
}) {
  return (
    <div className="bg-white border border-[#222222]/6 rounded-2xl p-4">
      <p className="text-[10px] text-[#222222]/40 uppercase tracking-wider mb-2">
        {label}
      </p>
      <p className="text-4xl font-bold leading-none" style={{ color }}>
        {value.toLocaleString('de-DE')}
      </p>
    </div>
  )
}

function QuickLink({
  href,
  icon,
  title,
  subtitle,
}: {
  href: string
  icon: string
  title: string
  subtitle: string
}) {
  return (
    <a
      href={href}
      className="flex items-center gap-3 p-3.5 rounded-2xl
                 bg-white border border-[#222222]/6
                 hover:border-[#222222]/15 transition-colors"
    >
      <span className="text-xl">{icon}</span>
      <div>
        <div className="text-sm font-medium text-[#222222]">{title}</div>
        <div className="text-xs text-[#222222]/40">{subtitle}</div>
      </div>
      <span className="ml-auto text-[#222222]/25 text-sm">›</span>
    </a>
  )
}
