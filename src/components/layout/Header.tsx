'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Menu, X, LayoutDashboard, LogOut, ChevronDown,
  Users, Shield, BookOpen, CalendarDays, Settings, User, Bike, CircleUserRound, ExternalLink, MessageCircle, Star, Wrench,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Props {
  activePage?: 'bikes' | 'custom-werkstatt' | 'map' | 'landing' | 'magazine' | 'events' | 'sell' | 'builds' | 'riders'
}

const BIKE_STYLES = [
  { href: '/bikes',            label: 'Alle Bikes'  },
  { href: '/bikes/cafe-racer', label: 'Cafe Racer'  },
  { href: '/bikes/bobber',     label: 'Bobber'      },
  { href: '/bikes/scrambler',  label: 'Scrambler'   },
  { href: '/bikes/tracker',    label: 'Tracker'     },
  { href: '/bikes/chopper',    label: 'Chopper'     },
]

const ROLE_BADGE: Record<string, { label: string; color: string }> = {
  superadmin: { label: 'Superadmin', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  'custom-werkstatt': { label: 'Custom Werkstatt', color: 'bg-[#F7F7F7] text-[#717171] border-[#DDDDDD]' },
  rider:      { label: 'Rider',      color: 'bg-[#F7F7F7] text-[#717171] border-[#DDDDDD]' },
}

export default function Header({ activePage }: Props) {
  const [open, setOpen]               = useState(false)
  const [dashDropdown, setDashDropdown] = useState(false)
  const [mobileBikesOpen, setMobileBikesOpen] = useState(false)
  const [mobileDashOpen,  setMobileDashOpen]  = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  const dropdownRef = useRef<HTMLDivElement>(null)
  const { user, role, slug, avatarUrl, loading } = useAuth()
  const router  = useRouter()
  const supabase = createClient()

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDashDropdown(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Stabiler Ref damit der Event-Listener immer die aktuellste fetchUnread-Version aufruft
  const fetchUnreadRef = useRef<() => void>(() => {})

  // ── Update last_seen_at while logged in ──
  useEffect(() => {
    if (!user) return
    const update = () => fetch('/api/presence', { method: 'POST' })
    update()
    const interval = setInterval(update, 60_000)
    return () => clearInterval(interval)
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!user) { setUnreadCount(0); return }
    const uid = user.id

    async function fetchUnread() {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: convs } = await (supabase.from('conversations') as any)
        .select('id')
        .or(`seller_id.eq.${uid},buyer_id.eq.${uid}`)
      if (!convs?.length) { setUnreadCount(0); return }
      const ids = convs.map((c: { id: string }) => c.id)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { count } = await (supabase.from('messages') as any)
        .select('id', { count: 'exact', head: true })
        .in('conversation_id', ids)
        .neq('sender_id', uid)
        .is('read_at', null)
      setUnreadCount(count ?? 0)
    }

    fetchUnreadRef.current = fetchUnread
    fetchUnread()

    const stableListener = () => fetchUnreadRef.current()
    window.addEventListener('messages-read', stableListener)

    const channel = supabase
      .channel('unread-badge')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, stableListener)
      .subscribe()

    return () => {
      window.removeEventListener('messages-read', stableListener)
      supabase.removeChannel(channel)
    }
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  // Close mobile menu on route change
  function close() { setOpen(false); setMobileBikesOpen(false); setMobileDashOpen(false) }

  async function handleLogout() {
    await supabase.auth.signOut()
    close()
    router.push('/')
    router.refresh()
  }

  /* ── shared class helpers ── */
  const mobileNavLink = (active: boolean) =>
    `flex items-center justify-between w-full px-3 py-3.5 rounded-xl text-base font-medium transition-colors ${
      active ? 'text-[#222222] bg-[#222222]/6' : 'text-[#222222]/65 active:bg-[#222222]/5'
    }`

  const mobileSubLink = 'flex items-center w-full px-3 py-2.5 rounded-lg text-sm text-[#222222]/50 transition-colors active:text-[#717171] active:bg-[#222222]/6'

  const mobileDashLink = 'flex items-center gap-3 w-full px-3 py-3 rounded-xl text-sm font-medium text-[#222222]/65 transition-colors active:bg-[#222222]/5 active:text-[#222222]'

  return (
    <>
    {/* Mobile overlay */}
    {open && (
      <div
        className="fixed inset-0 bg-black/40 z-40 md:hidden"
        onClick={close}
      />
    )}
    <header className="sticky top-0 left-0 right-0 z-50 border-b border-[#222222]/5 bg-white/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-8 flex items-center h-16">

        {/* Logo */}
        <div className="flex-1 min-w-0">
          <Link href="/" onClick={close} className="inline-block">
            <Image src="/logo-dark.svg" alt="MotoDigital" width={320} height={121} className="h-14 w-auto" priority />
          </Link>
        </div>

        {/* ── Desktop nav ── */}
        <nav className="hidden md:flex items-center gap-1">

          <Link href="/custom-werkstatt"
            className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-all ${
              activePage === 'custom-werkstatt'
                ? 'text-[#222222] font-semibold bg-[#222222]/8'
                : 'text-[#717171] hover:text-[#222222] hover:bg-[#222222]/5'
            }`}>
            Custom Werkstatt
          </Link>

          <Link href="/bikes"
            className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-all ${
              activePage === 'bikes'
                ? 'text-[#222222] font-semibold bg-[#222222]/8'
                : 'text-[#717171] hover:text-[#222222] hover:bg-[#222222]/5'
            }`}>
            Custom Bikes
          </Link>

          <Link href="/riders"
            className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-all ${
              activePage === 'riders'
                ? 'text-[#222222] font-semibold bg-[#222222]/8'
                : 'text-[#717171] hover:text-[#222222] hover:bg-[#222222]/5'
            }`}>
            Rider
          </Link>

        </nav>

        {/* ── Desktop auth ── */}
        <div className="hidden md:flex flex-1 items-center gap-2 justify-end pl-8">
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

              {/* Messages button */}
              <Link href="/dashboard/messages"
                className="relative flex items-center text-[#222222]/60 hover:text-[#222222] transition-colors px-2.5 py-2 rounded-xl hover:bg-[#222222]/5">
                <MessageCircle size={19} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>

              {/* Dashboard dropdown — icon only */}
              <div className="relative" ref={dropdownRef}>
                <button onClick={() => setDashDropdown(d => !d)}
                  className="flex items-center gap-1 text-[#222222]/60 hover:text-[#222222] transition-colors px-2.5 py-2 rounded-xl hover:bg-[#222222]/5">
                  <span className="relative">
                    {avatarUrl ? (
                      <span className="block w-[34px] h-[34px] rounded-full overflow-hidden border border-[#222222]/10 flex-shrink-0">
                        <Image src={avatarUrl} alt="Avatar" width={34} height={34} className="w-full h-full object-cover" />
                      </span>
                    ) : (
                      <CircleUserRound size={19} />
                    )}
                  </span>
                  <ChevronDown size={12} className={`transition-transform ${dashDropdown ? 'rotate-180' : ''}`} />
                </button>
                {dashDropdown && (
                  <div className="absolute top-full right-0 mt-1 w-52 bg-white border border-[#222222]/10 rounded-xl shadow-xl overflow-hidden z-50 animate-scale-in">
                    <Link href="/dashboard" onClick={() => setDashDropdown(false)}
                      className="flex items-center gap-2.5 px-4 py-3 text-sm text-[#222222]/60 hover:text-[#222222] hover:bg-[#222222]/5 transition-colors">
                      <LayoutDashboard size={14} /> Dashboard
                    </Link>
                    <Link href="/dashboard/messages" onClick={() => setDashDropdown(false)}
                      className="flex items-center gap-2.5 px-4 py-3 text-sm text-[#222222]/60 hover:text-[#222222] hover:bg-[#222222]/5 transition-colors border-t border-[#222222]/5">
                      <MessageCircle size={14} /> Nachrichten
                      {unreadCount > 0 && (
                        <span className="ml-auto min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </Link>
                    {role === 'rider' && (
                      <>
                        <Link href="/dashboard/meine-custom-bikes" onClick={() => setDashDropdown(false)}
                          className="flex items-center gap-2.5 px-4 py-3 text-sm text-[#222222]/60 hover:text-[#222222] hover:bg-[#222222]/5 transition-colors border-t border-[#222222]/5">
                          <Bike size={14} /> Mein Bike
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
                        <Link href="/dashboard/meine-custom-bikes" onClick={() => setDashDropdown(false)}
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
              <Link href="/auth/login" className="text-sm text-[#222222]/60 hover:text-[#222222] transition-colors px-4 py-2">
                Anmelden
              </Link>
              <Link href="/auth/register" className="bg-[#06a5a5] text-white text-sm font-semibold px-5 py-2 rounded-full hover:bg-[#058f8f] transition-all">
                Registrieren
              </Link>
            </>
          )}
        </div>

        {/* ── Mobile hamburger ── */}
        <button
          className="md:hidden ml-3 flex-shrink-0 w-11 h-11 flex items-center justify-center text-[#222222]/60 hover:text-[#222222] transition-colors rounded-xl"
          onClick={() => setOpen(o => !o)}
          aria-label="Menü"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>

      </div>

      {/* ── Mobile menu ── */}
      {open && (
        <div className="md:hidden border-t border-[#222222]/5 bg-white overflow-hidden">
          <div className="px-4 py-3 flex flex-col gap-0.5">

            {/* ── Auth section first (when logged in) ── */}
            {!loading && user ? (
              <>
                {/* Role badge */}
                {role && ROLE_BADGE[role] && (
                  <div className="px-3 py-2">
                    <span className={`text-[10px] font-semibold uppercase tracking-widest px-2.5 py-1 rounded-full border ${ROLE_BADGE[role].color}`}>
                      {ROLE_BADGE[role].label}
                    </span>
                  </div>
                )}

                {/* Dashboard accordion */}
                <button
                  onClick={() => setMobileDashOpen(v => !v)}
                  className={mobileNavLink(false)}
                >
                  <span className="flex items-center gap-2.5">
                    <LayoutDashboard size={17} className="text-[#222222]/30 flex-shrink-0" />
                    Dashboard
                  </span>
                  <ChevronDown size={16} className={`text-[#222222]/30 flex-shrink-0 transition-transform ${mobileDashOpen ? 'rotate-180' : ''}`} />
                </button>

                {mobileDashOpen && (
                  <div className="pl-9 flex flex-col gap-0.5 mb-1">
                    <Link href="/dashboard" onClick={close} className={mobileDashLink}>
                      <LayoutDashboard size={15} className="text-[#222222]/25 flex-shrink-0" /> Übersicht
                    </Link>
                    <Link href="/dashboard/messages" onClick={close} className={mobileDashLink}>
                      <MessageCircle size={15} className="text-[#222222]/25 flex-shrink-0" /> Nachrichten
                      {unreadCount > 0 && (
                        <span className="ml-auto min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </Link>
                    {role === 'rider' && (
                      <>
                        <Link href="/dashboard/meine-custom-bikes" onClick={close} className={mobileDashLink}>
                          <Bike size={15} className="text-[#222222]/25 flex-shrink-0" /> Mein Bike
                        </Link>
                        <Link href="/dashboard/merkliste" onClick={close} className={mobileDashLink}>
                          <Star size={15} className="text-[#222222]/25 flex-shrink-0" /> Merkliste
                        </Link>
                      </>
                    )}
                    {role === 'custom-werkstatt' && (
                      <>
                        <Link href="/dashboard/profile" onClick={close} className={mobileDashLink}>
                          <User size={15} className="text-[#222222]/25 flex-shrink-0" /> Profil bearbeiten
                        </Link>
                        <Link href="/dashboard/meine-custom-bikes" onClick={close} className={mobileDashLink}>
                          <Wrench size={15} className="text-[#222222]/25 flex-shrink-0" /> Custom Bikes
                        </Link>
                      </>
                    )}
                    {role === 'custom-werkstatt' && slug && (
                      <a href={`/custom-werkstatt/${slug}`} target="_blank" rel="noopener noreferrer" onClick={close} className={mobileDashLink}>
                        <ExternalLink size={15} className="text-[#222222]/25 flex-shrink-0" /> Werkstatt-Ansicht
                      </a>
                    )}
                    {role === 'superadmin' && (
                      <>
                        <p className="px-3 pt-2 pb-1 text-[9px] font-bold uppercase tracking-widest text-amber-400/50 flex items-center gap-1">
                          <Shield size={9} /> Superadmin
                        </p>
                        <Link href="/admin/custom-werkstatt" onClick={close} className={mobileDashLink}>
                          <Users size={15} className="text-[#222222]/25 flex-shrink-0" /> Custom Werkstätte
                        </Link>
                        <Link href="/admin/riders" onClick={close} className={mobileDashLink}>
                          <Users size={15} className="text-[#222222]/25 flex-shrink-0" /> Rider
                        </Link>
                        <Link href="/admin/magazine" onClick={close} className={mobileDashLink}>
                          <BookOpen size={15} className="text-[#222222]/25 flex-shrink-0" /> Magazin
                        </Link>
                        <Link href="/admin/events" onClick={close} className={mobileDashLink}>
                          <CalendarDays size={15} className="text-[#222222]/25 flex-shrink-0" /> Events
                        </Link>
                      </>
                    )}
                    <Link href="/dashboard/account" onClick={close} className={mobileDashLink}>
                      <Settings size={15} className="text-[#222222]/25 flex-shrink-0" /> Konto-Einstellungen
                    </Link>
                    <div className="h-px bg-[#222222]/6 mx-1 my-1" />
                    <button onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-3 py-3 rounded-xl text-sm font-medium text-red-400/80 transition-colors active:bg-red-500/8 active:text-red-500">
                      <LogOut size={15} className="flex-shrink-0" /> Abmelden
                    </button>
                  </div>
                )}

                <div className="h-px bg-[#222222]/8 mx-1 my-2" />
              </>
            ) : null}

            {/* ── Custom Werkstatt ── */}
            <Link href="/custom-werkstatt" onClick={close} className={mobileNavLink(activePage === 'custom-werkstatt')}>
              Custom Werkstatt
            </Link>

            {/* ── Custom Bikes accordion ── */}
            <button
              onClick={() => setMobileBikesOpen(v => !v)}
              className={mobileNavLink(activePage === 'bikes')}
            >
              <span className="flex items-center gap-2.5">
                Custom Bikes
              </span>
              <ChevronDown size={16} className={`text-[#222222]/30 flex-shrink-0 transition-transform ${mobileBikesOpen ? 'rotate-180' : ''}`} />
            </button>
            {mobileBikesOpen && (
              <div className="pl-9 flex flex-col gap-0.5 mb-1">
                {BIKE_STYLES.map(s => (
                  <Link key={s.href} href={s.href} onClick={close} className={mobileSubLink}>
                    {s.label}
                  </Link>
                ))}
              </div>
            )}

            {/* ── Rider ── */}
            <Link href="/riders" onClick={close} className={mobileNavLink(activePage === 'riders')}>
              Rider
            </Link>


            {/* ── Login/Register (not logged in) ── */}
            {!loading && !user && (
              <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-[#222222]/8">
                <Link href="/auth/login" onClick={close}
                  className="w-full py-3 text-center text-sm font-medium text-[#222222]/70 border border-[#222222]/12 rounded-xl hover:text-[#222222] hover:border-[#222222]/25 transition-all">
                  Anmelden
                </Link>
                <Link href="/auth/register" onClick={close}
                  className="w-full py-3 text-center text-sm font-semibold bg-[#06a5a5] text-white rounded-xl hover:bg-[#058f8f] transition-all">
                  Registrieren
                </Link>
              </div>
            )}

          </div>
        </div>
      )}
    </header>
    </>
  )
}
