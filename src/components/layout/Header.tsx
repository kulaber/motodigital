// Light Mode only — no dark: classes
'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  LayoutDashboard, LogOut, ChevronDown,
  Users, Shield, BookOpen, CalendarDays, Settings, User, Bike, ExternalLink, MessageCircle, Star, Wrench,
} from 'lucide-react'
import dynamic from 'next/dynamic'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import MobileNav from './MobileNav'
import { NotificationDropdownSection } from '@/components/notifications/NotificationDropdownSection'

const LoginModal = dynamic(() => import('@/components/ui/LoginModal').then(m => m.LoginModal), { ssr: false })

interface Props {
  activePage?: 'bikes' | 'custom-werkstatt' | 'map' | 'landing' | 'magazine' | 'events' | 'sell' | 'builds' | 'explore'
}

const ROLE_BADGE: Record<string, { label: string; color: string }> = {
  superadmin: { label: 'Superadmin', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  'custom-werkstatt': { label: 'Custom Werkstatt', color: 'bg-[#F7F7F7] text-[#717171] border-[#DDDDDD]' },
  rider:      { label: 'Rider',      color: 'bg-[#F7F7F7] text-[#717171] border-[#DDDDDD]' },
}

export default function Header({ activePage }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dashDropdown, setDashDropdown] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [loginMode, setLoginMode] = useState<'login' | 'register'>('login')

  const dropdownRef = useRef<HTMLDivElement>(null)
  const { user, role, slug, avatarUrl, fullName, loading, unreadCount, unreadNotificationCount } = useAuth()
  const totalBadge = unreadCount + unreadNotificationCount
  const router  = useRouter()
  const supabase = createClient()

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDashDropdown(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // ── Update last_seen_at while logged in ──
  useEffect(() => {
    if (!user) return
    const update = () => fetch('/api/presence', { method: 'POST' })
    update()
    const interval = setInterval(update, 60_000)
    return () => clearInterval(interval)
  }, [user])

  async function handleLogout() {
    await supabase.auth.signOut()
    setMobileOpen(false)
    router.push('/')
    router.refresh()
  }

  return (
    <>
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-[#222222]/5 bg-white/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-8 flex items-center h-12 md:h-16 relative">

        {/* Logo — mobile: zentriert wenn eingeloggt, linksbündig wenn nicht */}
        <div className={`${loading || user ? 'absolute left-1/2 -translate-x-1/2' : ''} lg:static lg:translate-x-0 lg:flex-1 min-w-0 flex items-center`}>
          <Link href={user && (role === 'rider' || role === 'custom-werkstatt') ? '/explore' : '/'} className="inline-flex items-center">
            <Image src="/logo-dark.svg" alt="MotoDigital" width={320} height={121} className="h-5 md:h-7 w-auto" priority />
          </Link>
        </div>

        {/* ── Desktop nav ── */}
        <nav className="hidden lg:flex items-center gap-1">
          <Link href="/explore"
            className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-all ${
              activePage === 'explore'
                ? 'text-[#222222] font-semibold bg-[#222222]/8'
                : 'text-[#717171] hover:text-[#222222] hover:bg-[#222222]/5'
            }`}>
            Explore
          </Link>
          <Link href="/bikes"
            className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-all ${
              activePage === 'bikes'
                ? 'text-[#222222] font-semibold bg-[#222222]/8'
                : 'text-[#717171] hover:text-[#222222] hover:bg-[#222222]/5'
            }`}>
            Custom Bikes
          </Link>
          <Link href="/custom-werkstatt"
            className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-all ${
              activePage === 'custom-werkstatt'
                ? 'text-[#222222] font-semibold bg-[#222222]/8'
                : 'text-[#717171] hover:text-[#222222] hover:bg-[#222222]/5'
            }`}>
            Werkstattsuche
          </Link>
        </nav>

        {/* ── Desktop auth ── */}
        <div className="hidden lg:flex flex-1 items-center gap-2 justify-end pl-8">
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="h-8 w-20 rounded-full bg-[#222222]/5 animate-pulse" />
              <div className="h-8 w-24 rounded-full bg-[#222222]/5 animate-pulse" />
            </div>
          ) : user ? (
            <>
              {role && ROLE_BADGE[role] && (
                <span className={`text-[10px] font-semibold uppercase tracking-widest px-2.5 py-1 rounded-full border ${ROLE_BADGE[role].color}`}>
                  {ROLE_BADGE[role].label}
                </span>
              )}

              {/* Dashboard dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button onClick={() => setDashDropdown(d => !d)}
                  className="flex items-center gap-1 text-[#222222]/60 hover:text-[#222222] transition-colors px-2.5 py-2 rounded-xl hover:bg-[#222222]/5">
                  <span className="relative">
                    {avatarUrl ? (
                      <span className="block w-[34px] h-[34px] rounded-full overflow-hidden border border-[#222222]/10 flex-shrink-0">
                        <Image src={avatarUrl} alt="Avatar" width={34} height={34} className="w-full h-full object-cover" />
                      </span>
                    ) : (
                      <span className="flex w-[34px] h-[34px] rounded-full overflow-hidden bg-[#2AABAB] items-center justify-center p-1.5">
                        <Image src="/pin-logo.svg" alt="MotoDigital" width={20} height={20} className="w-full h-full object-contain" />
                      </span>
                    )}
                    {totalBadge > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-0.5 bg-[#06a5a5] text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none border-2 border-[#06a5a5]">
                        {totalBadge > 9 ? '9+' : totalBadge}
                      </span>
                    )}
                  </span>
                  <ChevronDown size={12} className={`transition-transform ${dashDropdown ? 'rotate-180' : ''}`} />
                </button>
                {dashDropdown && (
                  <div className="absolute top-full right-0 mt-1 w-72 bg-white border border-[#222222]/10 rounded-xl shadow-xl overflow-hidden z-50 animate-scale-in">
                    <NotificationDropdownSection userId={user.id} onClose={() => setDashDropdown(false)} />
                    <Link href="/dashboard" onClick={() => setDashDropdown(false)}
                      className="flex items-center gap-2.5 px-4 py-3 text-sm text-[#222222]/60 hover:text-[#222222] hover:bg-[#222222]/5 transition-colors">
                      <LayoutDashboard size={14} /> Dashboard
                    </Link>
                    <Link href="/dashboard/messages" onClick={() => setDashDropdown(false)}
                      className="flex items-center gap-2.5 px-4 py-3 text-sm text-[#222222]/60 hover:text-[#222222] hover:bg-[#222222]/5 transition-colors border-t border-[#222222]/5">
                      <MessageCircle size={14} /> Nachrichten
                      {unreadCount > 0 && (
                        <span className="ml-auto min-w-[18px] h-[18px] px-1 bg-[#06a5a5] text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </Link>
                    {role === 'rider' && (
                      <>
                        <Link href="/dashboard/profile" onClick={() => setDashDropdown(false)}
                          className="flex items-center gap-2.5 px-4 py-3 text-sm text-[#222222]/60 hover:text-[#222222] hover:bg-[#222222]/5 transition-colors border-t border-[#222222]/5">
                          <User size={14} /> Profil
                        </Link>
                        <Link href="/dashboard/meine-garage" onClick={() => setDashDropdown(false)}
                          className="flex items-center gap-2.5 px-4 py-3 text-sm text-[#222222]/60 hover:text-[#222222] hover:bg-[#222222]/5 transition-colors border-t border-[#222222]/5">
                          <Bike size={14} /> Meine Garage
                        </Link>
                        <Link href="/dashboard/merkliste" onClick={() => setDashDropdown(false)}
                          className="flex items-center gap-2.5 px-4 py-3 text-sm text-[#222222]/60 hover:text-[#222222] hover:bg-[#222222]/5 transition-colors border-t border-[#222222]/5">
                          <Star size={14} /> Merkliste
                        </Link>
                      </>
                    )}
                    {role === 'custom-werkstatt' && (
                      <>
                        <Link href="/dashboard/profile" onClick={() => setDashDropdown(false)}
                          className="flex items-center gap-2.5 px-4 py-3 text-sm text-[#222222]/60 hover:text-[#222222] hover:bg-[#222222]/5 transition-colors border-t border-[#222222]/5">
                          <User size={14} /> Profil bearbeiten
                        </Link>
                        <Link href="/dashboard/meine-garage" onClick={() => setDashDropdown(false)}
                          className="flex items-center gap-2.5 px-4 py-3 text-sm text-[#222222]/60 hover:text-[#222222] hover:bg-[#222222]/5 transition-colors border-t border-[#222222]/5">
                          <Wrench size={14} /> Custom Bikes
                        </Link>
                      </>
                    )}
                    {role === 'custom-werkstatt' && slug && (
                      <a href={`/custom-werkstatt/${slug}`} target="_blank" rel="noopener noreferrer" onClick={() => setDashDropdown(false)}
                        className="flex items-center gap-2.5 px-4 py-3 text-sm text-[#222222]/60 hover:text-[#222222] hover:bg-[#222222]/5 transition-colors border-t border-[#222222]/5">
                        <ExternalLink size={14} /> Werkstatt-Ansicht
                      </a>
                    )}
                    {role === 'rider' && slug && (
                      <a href={`/rider/${slug}`} target="_blank" rel="noopener noreferrer" onClick={() => setDashDropdown(false)}
                        className="flex items-center gap-2.5 px-4 py-3 text-sm text-[#222222]/60 hover:text-[#222222] hover:bg-[#222222]/5 transition-colors border-t border-[#222222]/5">
                        <ExternalLink size={14} /> Rider-Profil
                      </a>
                    )}
                    {role === 'superadmin' && (
                      <>
                        <div className="h-px bg-[#222222]/6 mx-3 my-1" />
                        <p className="px-4 pt-1 pb-1 text-[9px] font-bold uppercase tracking-widest text-amber-400/60 flex items-center gap-1">
                          <Shield size={9} /> Superadmin
                        </p>
                        <Link href="/admin/custom-werkstatt" onClick={() => setDashDropdown(false)}
                          className="flex items-center gap-2.5 px-4 py-3 text-sm text-[#222222]/60 hover:text-[#222222] hover:bg-[#222222]/5 transition-colors">
                          <Users size={14} /> Custom Werkstätte
                        </Link>
                        <Link href="/admin/riders" onClick={() => setDashDropdown(false)}
                          className="flex items-center gap-2.5 px-4 py-3 text-sm text-[#222222]/60 hover:text-[#222222] hover:bg-[#222222]/5 transition-colors border-t border-[#222222]/5">
                          <Users size={14} /> Rider
                        </Link>
                        <Link href="/admin/magazine" onClick={() => setDashDropdown(false)}
                          className="flex items-center gap-2.5 px-4 py-3 text-sm text-[#222222]/60 hover:text-[#222222] hover:bg-[#222222]/5 transition-colors">
                          <BookOpen size={14} /> Magazin
                        </Link>
                        <Link href="/admin/events" onClick={() => setDashDropdown(false)}
                          className="flex items-center gap-2.5 px-4 py-3 text-sm text-[#222222]/60 hover:text-[#222222] hover:bg-[#222222]/5 transition-colors">
                          <CalendarDays size={14} /> Events
                        </Link>
                      </>
                    )}
                    <div className="h-px bg-[#222222]/6 mx-3 my-1" />
                    <Link href="/dashboard/account" onClick={() => setDashDropdown(false)}
                      className="flex items-center gap-2.5 px-4 py-3 text-sm text-[#222222]/60 hover:text-[#222222] hover:bg-[#222222]/5 transition-colors">
                      <Settings size={14} /> Konto-Einstellungen
                    </Link>
                    <div className="h-px bg-[#222222]/6 mx-3 my-1" />
                    <button onClick={handleLogout}
                      className="flex items-center gap-2.5 w-full px-4 py-3 text-sm text-red-400/80 hover:text-red-500 hover:bg-red-50 transition-colors">
                      <LogOut size={14} /> Abmelden
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <button onClick={() => { setLoginMode('login'); setShowLogin(true) }} className="text-sm text-[#222222]/60 hover:text-[#222222] transition-colors px-4 py-2">
                Login
              </button>
              <button onClick={() => { setLoginMode('register'); setShowLogin(true) }} className="bg-[#06a5a5] text-white text-sm font-semibold px-5 py-2 rounded-full hover:bg-[#058f8f] transition-all">
                Registrieren
              </button>
            </>
          )}
        </div>

        {/* ── Mobile: Auth shortcuts + Hamburger ── */}
        <div className="lg:hidden flex items-center gap-2 ml-auto">
          {!loading && !user && (
            <>
              <button onClick={() => { setMobileOpen(false); setLoginMode('login'); setShowLogin(true) }}
                className="text-[13px] font-medium text-[#222222]/60 hover:text-[#222222] transition-colors px-3 py-2">
                Login
              </button>
              <button onClick={() => { setMobileOpen(false); setLoginMode('register'); setShowLogin(true) }}
                className="bg-[#06a5a5] text-white text-[13px] font-semibold px-4 py-2 rounded-full hover:bg-[#058f8f] transition-all">
                Registrieren
              </button>
              <button
                className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-[#F0F0F0] transition-colors active:bg-[#E5E5E5]"
                onClick={() => setMobileOpen(o => !o)}
                aria-label="Menü"
              >
                <div className="relative w-[18px] h-[7px]">
                  <span
                    className="absolute left-0 w-full h-[2px] rounded-full bg-[#222222] transition-all duration-300 ease-in-out"
                    style={{
                      top: mobileOpen ? '2.5px' : '0px',
                      transform: mobileOpen ? 'rotate(45deg)' : 'rotate(0)',
                    }}
                  />
                  <span
                    className="absolute left-0 w-full h-[2px] rounded-full bg-[#222222] transition-all duration-300 ease-in-out"
                    style={{
                      top: mobileOpen ? '2.5px' : '5px',
                      transform: mobileOpen ? 'rotate(-45deg)' : 'rotate(0)',
                    }}
                  />
                </div>
              </button>
            </>
          )}
        </div>

      </div>
    </header>
    {/* Spacer to offset content below fixed header */}
    <div className="h-12 md:h-16" />

    <LoginModal
      isOpen={showLogin}
      onClose={() => setShowLogin(false)}
      initialMode={loginMode}
    />

    {/* ── Mobile Nav Panel (outside header to avoid stacking context) ── */}
    <MobileNav
      open={mobileOpen}
      onClose={() => setMobileOpen(false)}
      user={user}
      fullName={fullName}
      avatarUrl={avatarUrl}
      role={role}
      unreadCount={unreadCount}
      onLogout={handleLogout}
      activePage={activePage}
    />
    </>
  )
}
