import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import { SignOutButton } from '@/components/auth/SignOutButton'

export const metadata: Metadata = {
  title: 'Einstellungen — MotoDigital',
}

export default async function WerkstattEinstellungenPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await (supabase.from('profiles') as any)
    .select('id, full_name, slug')
    .eq('id', user.id)
    .maybeSingle()

  return (
    <div className="min-h-dvh bg-[#F7F7F7]">
      <Header />
      <div className="px-4 pt-6 pb-28 flex flex-col gap-6 max-w-lg mx-auto">
        <h1 className="text-2xl font-bold tracking-tight text-[#222222]">
          Einstellungen
        </h1>

        {/* Werkstatt */}
        <MenuSection title="Werkstatt">
          <MenuItem
            icon="🏭"
            title="Werkstatt-Profil bearbeiten"
            subtitle="Name, Adresse, Spezialisierungen"
            href="/werkstatt/profil"
          />
          {profile?.slug && (
            <MenuItem
              icon="👁"
              title="Profilansicht"
              subtitle="So sehen Besucher dein Profil"
              href={`/custom-werkstatt/${profile.slug}`}
            />
          )}
        </MenuSection>

        {/* Konto */}
        <MenuSection title="Konto">
          <MenuItem
            icon="👤"
            title="Nutzereinstellungen"
            subtitle="E-Mail, Passwort"
            href="/dashboard/account"
          />
          <MenuItem
            icon="🔔"
            title="Benachrichtigungen"
            subtitle="Anfragen, Bewertungen, News"
            href="/dashboard/notifications"
          />
        </MenuSection>

        {/* Danger Zone */}
        <MenuSection title="Konto">
          <SignOutButton />
        </MenuSection>
      </div>
    </div>
  )
}

function MenuSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div>
      <p className="text-[10px] text-[#222222]/30 uppercase tracking-widest mb-2 px-1">
        {title}
      </p>
      <div className="bg-white border border-[#222222]/6 rounded-2xl overflow-hidden">
        {children}
      </div>
    </div>
  )
}

function MenuItem({
  icon,
  title,
  subtitle,
  href,
  badge,
}: {
  icon: string
  title: string
  subtitle?: string
  href: string
  badge?: string
}) {
  return (
    <a
      href={href}
      className="flex items-center gap-3 px-4 py-3.5
                 border-b border-[#222222]/[0.04] last:border-b-0
                 hover:bg-[#222222]/[0.02] transition-colors"
    >
      <span className="text-base w-5 text-center flex-shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-[#222222]">{title}</div>
        {subtitle && (
          <div className="text-xs text-[#222222]/35 mt-0.5">{subtitle}</div>
        )}
      </div>
      {badge && (
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#E8A829] text-white">
          {badge}
        </span>
      )}
      <span className="text-[#222222]/20 text-sm flex-shrink-0">›</span>
    </a>
  )
}
