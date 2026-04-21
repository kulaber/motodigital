'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import Image from 'next/image'
import { usePathname } from '@/i18n/navigation'
import {
  LayoutDashboard, Bike, MessageCircle, Star, Bell,
  User, Settings, Wrench, Users, BookOpen, Calendar, LogOut, Eye,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from '@/i18n/navigation'

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
}

interface Props {
  role: string | null
  userName: string | null
  avatarUrl: string | null
  slug?: string | null
}

export default function DashboardNav({ role, userName: initialUserName, avatarUrl: initialAvatarUrl, slug }: Props) {
  const t = useTranslations('Nav')
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [liveAvatarUrl, setLiveAvatarUrl] = useState(initialAvatarUrl)
  const [liveUserName, setLiveUserName] = useState(initialUserName)

  useEffect(() => {
    function handleProfileUpdated(e: Event) {
      const detail = (e as CustomEvent<{ avatarUrl?: string | null; fullName?: string | null }>).detail
      if (detail.avatarUrl !== undefined) setLiveAvatarUrl(detail.avatarUrl || null)
      if (detail.fullName !== undefined) setLiveUserName(detail.fullName || null)
    }
    window.addEventListener('profile-updated', handleProfileUpdated)
    return () => window.removeEventListener('profile-updated', handleProfileUpdated)
  }, [])

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
  }

  function isActive(href: string) {
    return href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href)
  }

  const itemClass = (href: string) =>
    `flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
      isActive(href)
        ? 'bg-[#06a5a5]/10 text-[#06a5a5]'
        : 'text-[#222222]/50 hover:text-[#222222] hover:bg-[#222222]/5'
    }`

  const iconClass = (href: string) =>
    isActive(href) ? 'text-[#06a5a5]' : 'text-[#222222]/30'

  const mainItems: NavItem[] = [
    ...(role !== 'rider' ? [{ label: t('overview'), href: '/dashboard', icon: <LayoutDashboard size={15} /> }] : []),
    ...(role === 'rider'
      ? [{ label: t('editProfile'), href: '/dashboard/profile', icon: <User size={15} /> }]
      : []),
    { label: t('messages'), href: '/dashboard/messages', icon: <MessageCircle size={15} /> },
    ...(role === 'rider' || role === 'custom-werkstatt'
      ? [{ label: role === 'rider' ? t('myGarage') : t('myBikes'), href: '/dashboard/meine-garage', icon: <Bike size={15} /> }]
      : []),
    ...(role !== 'superadmin'
      ? [
          ...(role !== 'rider' ? [{ label: t('notifications'), href: '/dashboard/notifications', icon: <Bell size={15} /> }] : []),
          { label: t('watchlist'), href: '/dashboard/merkliste', icon: <Star size={15} /> },
        ]
      : []),
  ]

  const adminItems: NavItem[] = role === 'superadmin'
    ? [
        { label: t('superadminWorkshops'), href: '/admin/custom-werkstatt', icon: <Wrench size={15} /> },
        { label: t('superadminBikes'),     href: '/admin/custom-bikes',     icon: <Bike size={15} /> },
        { label: t('superadminRider'),     href: '/admin/riders',           icon: <Users size={15} /> },
        { label: t('superadminMagazine'),  href: '/admin/magazine',         icon: <BookOpen size={15} /> },
        { label: t('superadminEvents'),    href: '/admin/events',           icon: <Calendar size={15} /> },
      ]
    : []

  const workshopProfileItems: NavItem[] = role === 'custom-werkstatt'
    ? [
        { label: t('editWorkshopProfile'), href: '/dashboard/profile', icon: <User size={15} /> },
        ...(slug ? [{ label: t('profileView'), href: `/custom-werkstatt/${slug}`, icon: <Eye size={15} /> }] : []),
      ]
    : []

  const accountItems: NavItem[] = [
    { label: t('accountSettings'), href: '/dashboard/account', icon: <Settings size={15} /> },
  ]

  const roleLabel =
    role === 'custom-werkstatt' ? 'Custom Werkstatt'
    : role === 'superadmin' ? 'Admin'
    : t('rider')

  return (
    <aside className="w-80 flex-shrink-0 flex flex-col gap-3 pt-3 pb-3 pl-4 sm:pl-5 lg:pl-8 pr-3 sticky top-16 h-[calc(100dvh-4rem)] overflow-y-auto">

      {/* Card 1 — User identity */}
      <Link href={role === 'rider' && slug ? `/rider/${slug}` : role === 'custom-werkstatt' && slug ? `/custom-werkstatt/${slug}` : '/dashboard/profile'} className="bg-white rounded-2xl border border-[#222222]/6 hover:border-[#222222]/15 p-4 flex items-center gap-3 transition-colors">
        <div className="w-12 h-12 rounded-full flex-shrink-0 overflow-hidden border border-[#222222]/8">
          {liveAvatarUrl ? (
            <Image src={liveAvatarUrl} alt={liveUserName ?? ''} width={48} height={48} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#2AABAB] p-2.5">
              <Image src="/pin-logo.svg" alt="MotoDigital" width={32} height={32} className="w-full h-full object-contain" />
            </div>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-[#222222] truncate leading-tight mb-1.5">{liveUserName ?? '—'}</p>
          <span className={`inline-flex items-center text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${
            role === 'custom-werkstatt'
              ? 'bg-[#06a5a5]/10 text-[#06a5a5] border-[#06a5a5]/20'
              : role === 'superadmin'
              ? 'bg-amber-400/10 text-amber-500 border-amber-400/20'
              : 'bg-[#222222]/6 text-[#222222]/50 border-[#222222]/10'
          }`}>
            {roleLabel}
          </span>
        </div>
      </Link>

      {/* Card 2 — Main navigation */}
      <div className="bg-white rounded-2xl border border-[#222222]/6 p-2 flex flex-col gap-0.5">
        {mainItems.map(item => (
          <Link key={item.href} href={item.href} className={itemClass(item.href)}>
            <span className={iconClass(item.href)}>{item.icon}</span>
            {item.label}
          </Link>
        ))}

        {adminItems.length > 0 && (
          <>
            <p className="text-[9px] font-bold uppercase tracking-widest text-amber-400/60 px-3 pt-3 pb-1">Admin</p>
            {adminItems.map(item => (
              <Link key={item.href} href={item.href} className={itemClass(item.href)}>
                <span className={iconClass(item.href)}>{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </>
        )}
      </div>

      {/* Card 3 — Workshop profile (workshop role only) */}
      {workshopProfileItems.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#222222]/6 p-2 flex flex-col gap-0.5">
          {workshopProfileItems.map(item => (
            <Link key={item.href} href={item.href} className={itemClass(item.href)}>
              <span className={iconClass(item.href)}>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>
      )}

      {/* Card 4 — Account + Logout */}
      <div className="bg-white rounded-2xl border border-[#222222]/6 p-2 flex flex-col gap-0.5">
        {accountItems.map(item => (
          <Link key={item.href} href={item.href} className={itemClass(item.href)}>
            <span className={iconClass(item.href)}>{item.icon}</span>
            {item.label}
          </Link>
        ))}
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium w-full text-[#222222]/35 hover:text-red-400 hover:bg-red-50 transition-all"
        >
          <LogOut size={15} className="text-[#222222]/25" />
          {t('logout')}
        </button>
      </div>

    </aside>
  )
}
