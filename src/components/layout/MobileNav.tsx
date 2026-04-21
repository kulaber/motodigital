'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Link, usePathname } from '@/i18n/navigation'
import LanguageSwitcher from '@/components/i18n/LanguageSwitcher'
import {
  LogOut, ChevronRight, BookOpen, CalendarDays, Tag, Info, Search,
  Users, Settings, UserPen, MessageCircle, Bike, Grid3X3,
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

export default function MobileNav({
  open, onClose, user, fullName, avatarUrl, role,
  unreadCount, onLogout, activePage,
}: Props) {
  const t = useTranslations('Nav')
  const pathname = usePathname()

  useEffect(() => {
    onClose()
  }, [pathname]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  const isActive = (page: string) => activePage === page

  type NavHref = Parameters<typeof Link>[0]['href']
  const navItem = (href: NavHref, icon: React.ReactNode, label: string, active: boolean, badge?: number) => (
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
      style={{ top: 48 }}
    >
      <div className="flex-1 overflow-y-auto">

        {user && (
          <div className="px-5 py-5 border-b border-[#E5E5E5]">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full flex-shrink-0 overflow-hidden">
                {avatarUrl ? (
                  <Image src={avatarUrl} alt="Avatar" width={48} height={48} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-[#2AABAB] flex items-center justify-center p-2.5">
                    <Image src="/pin-logo.svg" alt="MotoDigital" width={32} height={32} className="w-full h-full object-contain" />
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

        {user && role !== 'rider' && (
          <div className="px-3 pt-5 pb-2">
            <p className="px-4 pb-2 text-[10px] font-bold uppercase tracking-widest text-[#6B6B6B]">
              {t('myArea')}
            </p>
            {navItem('/dashboard', <Grid3X3 size={20} />, t('dashboard'), pathname === '/dashboard')}
            {navItem('/dashboard/messages', <MessageCircle size={20} />, t('messages'), pathname === '/dashboard/messages', unreadCount)}
            {navItem('/dashboard/profile', <UserPen size={20} />, t('editProfile'), pathname === '/dashboard/profile')}
            {navItem('/dashboard/account', <Settings size={20} />, t('accountSettings'), pathname === '/dashboard/account')}

            <div className="h-px bg-[#E5E5E5] mx-4 my-3" />
          </div>
        )}

        {!(user && role === 'rider') && (
          <div className="px-3 pt-4 pb-2">
            <p className="px-4 pb-2 text-[10px] font-bold uppercase tracking-widest text-[#6B6B6B]">
              {t('discover')}
            </p>
            {navItem('/explore', <Users size={20} />, t('explore'), isActive('explore'))}
            {navItem('/bikes', <Bike size={20} />, t('bikes'), isActive('bikes'))}
            {navItem('/search', <Search size={20} />, t('search'), pathname === '/search')}
            {navItem('/rider', <Users size={20} />, t('rider'), isActive('rider'))}
          </div>
        )}

        <div className="px-3 pb-2">
          <p className="px-4 pb-2 text-[10px] font-bold uppercase tracking-widest text-[#6B6B6B]">
            {t('more')}
          </p>
          {navItem('/magazine', <BookOpen size={20} />, t('magazine'), isActive('magazine'))}
          {navItem('/events', <CalendarDays size={20} />, t('events'), isActive('events'))}
          {navItem('/marken', <Tag size={20} />, t('brands'), false)}
          {navItem('/ueber-motodigital', <Info size={20} />, t('aboutMotoDigital'), false)}
        </div>

        {/* Language switcher */}
        <div className="px-5 pt-2 pb-5">
          <LanguageSwitcher variant="mobile" />
        </div>
      </div>

      {user && (
        <div className="flex-shrink-0 border-t border-[#E5E5E5] px-5 py-4">
          <button
            onClick={() => { onLogout(); onClose() }}
            className="flex items-center gap-3 w-full min-h-[48px] px-4 py-3 rounded-xl text-[15px] font-medium text-[#EF4444] active:bg-red-50 transition-colors"
          >
            <LogOut size={20} />
            {t('logout')}
          </button>
        </div>
      )}
    </div>
  )
}
