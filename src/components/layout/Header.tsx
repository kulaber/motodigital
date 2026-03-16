'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X, LayoutDashboard, LogOut, ChevronDown, Users, Shield, BookOpen, CalendarDays } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Props {
  activePage?: 'bikes' | 'builder' | 'map' | 'landing' | 'magazine' | 'events' | 'sell' | 'builds'
}

const BIKE_STYLES = [
  { href: '/bikes',             label: 'Alle Bikes'  },
  { href: '/bikes/cafe-racer',  label: 'Cafe Racer'  },
  { href: '/bikes/bobber',      label: 'Bobber'       },
  { href: '/bikes/scrambler',   label: 'Scrambler'    },
  { href: '/bikes/tracker',     label: 'Tracker'      },
  { href: '/bikes/chopper',     label: 'Chopper'      },
]

export default function Header({ activePage }: Props) {
  const [open, setOpen] = useState(false)
  const [dashDropdown, setDashDropdown] = useState(false)
  const [bikesDropdown, setBikesDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const bikesRef = useRef<HTMLDivElement>(null)
  const { user, role, loading } = useAuth()

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDashDropdown(false)
      }
      if (bikesRef.current && !bikesRef.current.contains(e.target as Node)) {
        setBikesDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const ROLE_BADGE: Record<string, { label: string; color: string }> = {
    superadmin: { label: 'Superadmin', color: 'bg-amber-400/15 text-amber-400 border-amber-400/25' },
    builder:    { label: 'Builder',    color: 'bg-[#2AABAB]/12 text-[#2AABAB] border-[#2AABAB]/25' },
    rider:      { label: 'Rider',      color: 'bg-[#F0EDE4]/8 text-[#F0EDE4]/50 border-[#F0EDE4]/12' },
  }
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    setOpen(false)
    router.push('/')
    router.refresh()
  }

  return (
    <header className="sticky top-0 left-0 right-0 z-50 border-b border-[#F0EDE4]/5 bg-[#141414]/95 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-5 lg:px-8 flex items-center justify-between h-16">

        {/* Logo */}
        <Link href="/" onClick={() => setOpen(false)} className="cursor-pointer">
          <div className="transition-transform duration-200 hover:scale-[1.02]">
            <Image src="/logo.svg" alt="MotoDigital" width={320} height={121} className="h-16 w-auto" priority />
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">

          {/* Bikes with dropdown */}
          <div className="relative" ref={bikesRef}>
            <button
              onClick={() => setBikesDropdown(d => !d)}
              className={`relative flex items-center gap-1 text-sm font-medium transition-colors duration-200 pb-0.5 ${
                activePage === 'bikes'
                  ? 'text-[#2aabab]'
                  : 'text-[#F0EDE4]/55 hover:text-[#F0EDE4]'
              }`}
            >
              Bikes
              <ChevronDown size={13} className={`transition-transform ${bikesDropdown ? 'rotate-180' : ''}`} />
              {activePage === 'bikes' && (
                <span className="absolute -bottom-0.5 left-0 right-0 h-px bg-[#2aabab] rounded-full" />
              )}
            </button>
            {bikesDropdown && (
              <div className="absolute top-full left-0 mt-2 w-44 bg-[#1C1C1C] border border-[#F0EDE4]/10 rounded-xl shadow-xl overflow-hidden z-50">
                {BIKE_STYLES.map(s => (
                  <Link
                    key={s.href}
                    href={s.href}
                    onClick={() => setBikesDropdown(false)}
                    className="block px-4 py-2.5 text-sm text-[#F0EDE4]/60 hover:text-[#F0EDE4] hover:bg-[#F0EDE4]/5 transition-colors border-b border-[#F0EDE4]/5 last:border-0"
                  >
                    {s.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link
            href="/builder"
            className={`relative text-sm font-medium transition-colors duration-200 pb-0.5 ${
              activePage === 'builder'
                ? 'text-[#2aabab]'
                : 'text-[#F0EDE4]/55 hover:text-[#F0EDE4]'
            }`}
          >
            Builder
            {activePage === 'builder' && (
              <span className="absolute -bottom-0.5 left-0 right-0 h-px bg-[#2aabab] rounded-full" />
            )}
          </Link>

          <Link
            href="/magazine"
            className={`relative text-sm font-medium transition-colors duration-200 pb-0.5 ${
              activePage === 'magazine'
                ? 'text-[#2aabab]'
                : 'text-[#F0EDE4]/55 hover:text-[#F0EDE4]'
            }`}
          >
            Magazin
            {activePage === 'magazine' && (
              <span className="absolute -bottom-0.5 left-0 right-0 h-px bg-[#2aabab] rounded-full" />
            )}
          </Link>

          <Link
            href="/events"
            className={`relative text-sm font-medium transition-colors duration-200 pb-0.5 ${
              activePage === 'events'
                ? 'text-[#2aabab]'
                : 'text-[#F0EDE4]/55 hover:text-[#F0EDE4]'
            }`}
          >
            Events
            {activePage === 'events' && (
              <span className="absolute -bottom-0.5 left-0 right-0 h-px bg-[#2aabab] rounded-full" />
            )}
          </Link>

        </nav>

        {/* Desktop auth */}
        <div className="hidden md:flex items-center gap-2">
          {!loading && user ? (
            <>
              {role && ROLE_BADGE[role] && (
                <span className={`text-[10px] font-semibold uppercase tracking-widest px-2.5 py-1 rounded-full border ${ROLE_BADGE[role].color}`}>
                  {ROLE_BADGE[role].label}
                </span>
              )}
              {role === 'superadmin' ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDashDropdown(d => !d)}
                    className="flex items-center gap-1.5 text-sm text-[#F0EDE4]/60 hover:text-[#F0EDE4] transition-colors px-3 py-2"
                  >
                    <LayoutDashboard size={15} />
                    Dashboard
                    <ChevronDown size={13} className={`transition-transform ${dashDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  {dashDropdown && (
                    <div className="absolute top-full right-0 mt-1 w-48 bg-[#1C1C1C] border border-[#F0EDE4]/10 rounded-xl shadow-xl overflow-hidden z-50 animate-scale-in">
                      <Link href="/dashboard" onClick={() => setDashDropdown(false)}
                        className="flex items-center gap-2.5 px-4 py-3 text-sm text-[#F0EDE4]/60 hover:text-[#F0EDE4] hover:bg-[#F0EDE4]/5 transition-colors">
                        <LayoutDashboard size={14} /> Dashboard
                      </Link>
                      <div className="h-px bg-[#F0EDE4]/6 mx-3" />
                      <p className="px-4 pt-2 pb-1 text-[9px] font-bold uppercase tracking-widest text-amber-400/60 flex items-center gap-1">
                        <Shield size={9} /> Admin
                      </p>
                      <Link href="/admin/builder" onClick={() => setDashDropdown(false)}
                        className="flex items-center gap-2.5 px-4 py-3 text-sm text-[#F0EDE4]/60 hover:text-[#F0EDE4] hover:bg-[#F0EDE4]/5 transition-colors">
                        <Users size={14} /> Builder
                      </Link>
                      <Link href="/admin/magazine" onClick={() => setDashDropdown(false)}
                        className="flex items-center gap-2.5 px-4 py-3 text-sm text-[#F0EDE4]/60 hover:text-[#F0EDE4] hover:bg-[#F0EDE4]/5 transition-colors">
                        <BookOpen size={14} /> Magazin
                      </Link>
                      <Link href="/admin/events" onClick={() => setDashDropdown(false)}
                        className="flex items-center gap-2.5 px-4 py-3 text-sm text-[#F0EDE4]/60 hover:text-[#F0EDE4] hover:bg-[#F0EDE4]/5 transition-colors">
                        <CalendarDays size={14} /> Events
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <Link href="/dashboard" className="flex items-center gap-2 text-sm text-[#F0EDE4]/60 hover:text-[#F0EDE4] transition-colors px-3 py-2">
                  <LayoutDashboard size={15} />
                  Dashboard
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-sm text-[#F0EDE4]/50 hover:text-[#F0EDE4] border border-[#F0EDE4]/12 hover:border-[#F0EDE4]/25 px-4 py-2 rounded-full transition-all"
              >
                <LogOut size={14} />
                Abmelden
              </button>
            </>
          ) : !loading ? (
            <>
              <Link href="/auth/login" className="text-sm text-[#F0EDE4]/60 hover:text-[#F0EDE4] transition-colors px-4 py-2">
                Anmelden
              </Link>
              <Link href="/auth/register" className="bg-[#2AABAB] text-[#141414] text-sm font-semibold px-5 py-2 rounded-full hover:bg-[#3DBFBF] transition-all">
                Registrieren
              </Link>
            </>
          ) : null}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 text-[#F0EDE4]/60 hover:text-[#F0EDE4] transition-colors"
          onClick={() => setOpen(o => !o)}
          aria-label="Menü"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-[#F0EDE4]/5 bg-[#141414]/98 backdrop-blur-md">
          <div className="max-w-6xl mx-auto px-5 py-4 flex flex-col gap-1">

            <Link
              href="/bikes"
              onClick={() => setOpen(false)}
              className={`py-3 px-2 text-base rounded-xl transition-colors ${
                activePage === 'bikes'
                  ? 'text-[#F0EDE4] font-semibold bg-[#F0EDE4]/5'
                  : 'text-[#F0EDE4]/60 hover:text-[#F0EDE4] hover:bg-[#F0EDE4]/5'
              }`}
            >
              Bikes
            </Link>

            {/* Style sub-links on mobile */}
            <div className="pl-4 flex flex-col gap-0.5">
              {BIKE_STYLES.slice(1).map(s => (
                <Link
                  key={s.href}
                  href={s.href}
                  onClick={() => setOpen(false)}
                  className="py-2 px-2 text-sm text-[#F0EDE4]/40 hover:text-[#2aabab] rounded-lg transition-colors"
                >
                  {s.label}
                </Link>
              ))}
            </div>

            <Link
              href="/builder"
              onClick={() => setOpen(false)}
              className={`py-3 px-2 text-base rounded-xl transition-colors ${
                activePage === 'builder'
                  ? 'text-[#F0EDE4] font-semibold bg-[#F0EDE4]/5'
                  : 'text-[#F0EDE4]/60 hover:text-[#F0EDE4] hover:bg-[#F0EDE4]/5'
              }`}
            >
              Builder
            </Link>

            <Link
              href="/magazine"
              onClick={() => setOpen(false)}
              className={`py-3 px-2 text-base rounded-xl transition-colors ${
                activePage === 'magazine'
                  ? 'text-[#F0EDE4] font-semibold bg-[#F0EDE4]/5'
                  : 'text-[#F0EDE4]/60 hover:text-[#F0EDE4] hover:bg-[#F0EDE4]/5'
              }`}
            >
              Magazin
            </Link>

            <Link
              href="/events"
              onClick={() => setOpen(false)}
              className={`py-3 px-2 text-base rounded-xl transition-colors ${
                activePage === 'events'
                  ? 'text-[#F0EDE4] font-semibold bg-[#F0EDE4]/5'
                  : 'text-[#F0EDE4]/60 hover:text-[#F0EDE4] hover:bg-[#F0EDE4]/5'
              }`}
            >
              Events
            </Link>

            <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-[#F0EDE4]/8">
              {!loading && user ? (
                <>
                  {role && ROLE_BADGE[role] && (
                    <div className="flex justify-center py-1">
                      <span className={`text-[10px] font-semibold uppercase tracking-widest px-2.5 py-1 rounded-full border ${ROLE_BADGE[role].color}`}>
                        {ROLE_BADGE[role].label}
                      </span>
                    </div>
                  )}
                  <Link
                    href="/dashboard"
                    onClick={() => setOpen(false)}
                    className="py-3 text-center text-sm font-medium text-[#F0EDE4]/60 border border-[#F0EDE4]/12 rounded-full hover:text-[#F0EDE4] hover:border-[#F0EDE4]/25 transition-all flex items-center justify-center gap-2"
                  >
                    <LayoutDashboard size={15} /> Dashboard
                  </Link>
                  {role === 'superadmin' && (
                    <>
                      <Link href="/admin/builder" onClick={() => setOpen(false)}
                        className="py-3 text-center text-sm font-medium text-amber-400/70 border border-amber-400/20 rounded-full hover:text-amber-400 hover:border-amber-400/40 transition-all flex items-center justify-center gap-2">
                        <Users size={14} /> Builder
                      </Link>
                      <Link href="/admin/magazine" onClick={() => setOpen(false)}
                        className="py-3 text-center text-sm font-medium text-amber-400/70 border border-amber-400/20 rounded-full hover:text-amber-400 hover:border-amber-400/40 transition-all flex items-center justify-center gap-2">
                        <BookOpen size={14} /> Magazin
                      </Link>
                      <Link href="/admin/events" onClick={() => setOpen(false)}
                        className="py-3 text-center text-sm font-medium text-amber-400/70 border border-amber-400/20 rounded-full hover:text-amber-400 hover:border-amber-400/40 transition-all flex items-center justify-center gap-2">
                        <CalendarDays size={14} /> Events
                      </Link>
                    </>
                  )}
                  <button
                    onClick={handleLogout}
                    className="py-3 text-center text-sm font-medium text-[#F0EDE4]/60 border border-[#F0EDE4]/12 rounded-full hover:text-[#F0EDE4] hover:border-[#F0EDE4]/25 transition-all flex items-center justify-center gap-2"
                  >
                    <LogOut size={14} /> Abmelden
                  </button>
                </>
              ) : !loading ? (
                <>
                  <Link
                    href="/auth/login"
                    onClick={() => setOpen(false)}
                    className="py-3 text-center text-sm font-medium text-[#F0EDE4]/60 border border-[#F0EDE4]/12 rounded-full hover:text-[#F0EDE4] hover:border-[#F0EDE4]/25 transition-all"
                  >
                    Anmelden
                  </Link>
                  <Link
                    href="/auth/register"
                    onClick={() => setOpen(false)}
                    className="py-3 text-center text-sm font-semibold bg-[#2AABAB] text-[#141414] rounded-full hover:bg-[#3DBFBF] transition-all"
                  >
                    Registrieren
                  </Link>
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
