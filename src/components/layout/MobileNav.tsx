// Light Mode only — no dark: classes
'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
// Image still used for user avatar
import {
  LogOut, ChevronRight, BookOpen, CalendarDays, Tag, Info,
  Users, MapPin, Settings, UserPen, MessageCircle, Bike, Grid3X3,
} from 'lucide-react'

type UserRole = 'rider' | 'custom-werkstatt' | 'superadmin' | null

interface Props {
  open: boolean
  onClose: () => void
  user: { id: string; email?: string } | null
  fullName: string | null
  avatarUrl: string | null
  role: UserRole
  unreadCount: number
  onLogout: () => void
  activePage?: string
}

const ROLE_LABELS: Record<string, string> = {
  rider: 'Rider',
  'custom-werkstatt': 'Custom Werkstatt',
  superadmin: 'Superadmin',
}

function getInitials(name: string | null, email?: string): string {
  if (name) {
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  }
  return (email?.[0] ?? '?').toUpperCase()
}

export default function MobileNav({
  open, onClose, user, fullName, avatarUrl, role,
  unreadCount, onLogout, activePage,
}: Props) {
  const pathname = usePathname()

  // Close on route change
  useEffect(() => {
    onClose()
  }, [pathname]) // eslint-disable-line react-hooks/exhaustive-deps

  // Lock body scroll
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  const isActive = (page: string) => activePage === page

  const navItem = (href: string, icon: React.ReactNode, label: string, active: boolean, badge?: number) => (
    <Link
      href={href}
      onClick={onClose}
      className={`flex items-center gap-3 w-full min-h-[48px] px-4 py-3 rounded-xl text-[15px] font-medium transition-colors ${
        active
          ? 'bg-[#F0F0F0] text-[#1A1A1A]'
          : 'text-[#1A1A1A] active:bg-[#F9F8F5]'
      }`}
    >
      <span className={active ? 'text-[#1A1A1A]' : 'text-[#6B6B6B]'}>{icon}</span>
      <span className="flex-1">{label}</span>
      {badge != null && badge > 0 && (
        <span className="min-w-[20px] h-[20px] px-1.5 bg-[#EF4444] text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
          {badge > 9 ? '9+' : badge}
        </span>
      )}
      <ChevronRight size={16} className={active ? 'text-[#1A1A1A]' : 'text-[#E5E5E5]'} />
    </Link>
  )

  return (
    <div
      className={`fixed left-0 right-0 bottom-0 z-[80] bg-white flex flex-col transition-transform duration-300 ease-in-out lg:hidden ${
        open ? 'translate-x-0' : 'translate-x-full'
      }`}
      style={{ top: 64 }}
    >
      {/* ── Scrollable content (below site header) ── */}
      <div className="flex-1 overflow-y-auto">

        {/* ── 1. User Block (logged in only) ── */}
        {user && (
          <div className="px-5 py-5 border-b border-[#E5E5E5]">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full flex-shrink-0 overflow-hidden">
                {avatarUrl ? (
                  <Image src={avatarUrl} alt="Avatar" width={48} height={48} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-[#2AABAB] flex items-center justify-center text-white text-sm font-bold">
                    {getInitials(fullName, user.email)}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-[15px] font-bold text-[#1A1A1A] truncate">
                  {fullName || user.email || 'User'}
                </p>
                {role && ROLE_LABELS[role] && (
                  <span className="inline-block mt-1 text-[11px] font-semibold text-[#2AABAB] bg-[#F0EDE4] px-2.5 py-0.5 rounded-full">
                    {ROLE_LABELS[role]}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── 2. User Actions (logged in only) ── */}
        {user && (
          <div className="px-3 pt-5 pb-2">
            <p className="px-4 pb-2 text-[10px] font-bold uppercase tracking-widest text-[#6B6B6B]">
              Mein Bereich
            </p>
            {navItem('/dashboard', <Grid3X3 size={20} />, 'Dashboard', pathname === '/dashboard')}
            {navItem('/dashboard/messages', <MessageCircle size={20} />, 'Nachrichten', pathname === '/dashboard/messages', unreadCount)}
            {navItem('/dashboard/profile', <UserPen size={20} />, 'Profil bearbeiten', pathname === '/dashboard/profile')}
            {navItem('/dashboard/account', <Settings size={20} />, 'Konto-Einstellungen', pathname === '/dashboard/account')}

            <div className="h-px bg-[#E5E5E5] mx-4 my-3" />
          </div>
        )}

        {/* ── 3. Navigation ── */}
        <div className="px-3 pt-4 pb-2">
          <p className="px-4 pb-2 text-[10px] font-bold uppercase tracking-widest text-[#6B6B6B]">
            Entdecken
          </p>
          {navItem('/explore', <Users size={20} />, 'Explore', isActive('explore'))}
          {navItem('/bikes', <Bike size={20} />, 'Custom Bikes', isActive('bikes'))}
          {navItem('/custom-werkstatt', <MapPin size={20} />, 'Werkstattsuche', isActive('custom-werkstatt'))}
        </div>

        {/* ── 4. More links ── */}
        <div className="px-3 pb-2">
          <p className="px-4 pb-2 text-[10px] font-bold uppercase tracking-widest text-[#6B6B6B]">
            Mehr
          </p>
          {navItem('/magazine', <BookOpen size={20} />, 'Magazin', isActive('magazine'))}
          {navItem('/events', <CalendarDays size={20} />, 'Events', isActive('events'))}
          {navItem('/marken', <Tag size={20} />, 'Marken', false)}
          {navItem('/ueber-motodigital', <Info size={20} />, 'Über MotoDigital', false)}
        </div>
      </div>

      {/* ── 5. Logout (sticky bottom) ── */}
      {user && (
        <div className="flex-shrink-0 border-t border-[#E5E5E5] px-5 py-4">
          <button
            onClick={() => { onLogout(); onClose() }}
            className="flex items-center gap-3 w-full min-h-[48px] px-4 py-3 rounded-xl text-[15px] font-medium text-[#EF4444] active:bg-red-50 transition-colors"
          >
            <LogOut size={20} />
            Abmelden
          </button>
        </div>
      )}
    </div>
  )
}
