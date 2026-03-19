'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Bike, MessageCircle, Bookmark,
  User, Settings, Wrench, Users, BookOpen, Calendar, LogOut,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
}

interface Props {
  role: string | null
  userName: string | null
  avatarUrl: string | null
}

export default function DashboardNav({ role, userName, avatarUrl }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

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
    { label: 'Übersicht', href: '/dashboard', icon: <LayoutDashboard size={15} /> },
    ...(role === 'rider' || role === 'custom-werkstatt'
      ? [{ label: role === 'rider' ? 'Mein Bike' : 'Custom Bikes', href: '/dashboard/meine-custom-bikes', icon: <Bike size={15} /> }]
      : []),
    ...(role !== 'superadmin'
      ? [
          { label: 'Nachrichten', href: '/dashboard/messages', icon: <MessageCircle size={15} /> },
          { label: 'Merkliste', href: '/dashboard/merkliste', icon: <Bookmark size={15} /> },
        ]
      : []),
  ]

  const adminItems: NavItem[] = role === 'superadmin'
    ? [
        { label: 'Werkstätten', href: '/admin/custom-werkstatt', icon: <Wrench size={15} /> },
        { label: 'Rider', href: '/admin/riders', icon: <Users size={15} /> },
        { label: 'Magazin', href: '/admin/magazine', icon: <BookOpen size={15} /> },
        { label: 'Events', href: '/admin/events', icon: <Calendar size={15} /> },
      ]
    : []

  const accountItems: NavItem[] = [
    ...(role !== 'superadmin'
      ? [{ label: 'Profil', href: '/dashboard/profile', icon: <User size={15} /> }]
      : []),
    { label: 'Einstellungen', href: '/dashboard/account', icon: <Settings size={15} /> },
  ]

  const initials = userName?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?'
  const roleLabel =
    role === 'custom-werkstatt' ? 'Custom Werkstatt'
    : role === 'superadmin' ? 'Admin'
    : 'Rider'

  return (
    <aside className="w-80 flex-shrink-0 flex flex-col gap-3 pt-3 pb-3 pl-4 sm:pl-5 lg:pl-8 pr-3 sticky top-16 h-[calc(100dvh-4rem)] overflow-y-auto">

      {/* Card 1 — User identity */}
      <div className="bg-white rounded-2xl border border-[#222222]/6 p-4 flex items-center gap-3">
        <div className="w-12 h-12 rounded-full flex-shrink-0 overflow-hidden bg-[#F7F7F7] border border-[#222222]/8">
          {avatarUrl ? (
            <Image src={avatarUrl} alt={userName ?? ''} width={48} height={48} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#F7F7F7] p-2">
              <Image src="/logo-dark.svg" alt="MotoDigital" width={40} height={40} className="w-full h-full object-contain opacity-30" />
            </div>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-[#222222] truncate leading-tight mb-1.5">{userName ?? '—'}</p>
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
      </div>

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

      {/* Card 3 — Account + Logout */}
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
          Abmelden
        </button>
      </div>

    </aside>
  )
}
