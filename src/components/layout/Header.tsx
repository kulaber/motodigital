'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X, LayoutDashboard, LogOut } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Props {
  activePage?: 'builds' | 'builder' | 'map' | 'landing'
}

const NAV_LINKS = [
  { href: '/builds',  label: 'Builds'  },
  { href: '/builder', label: 'Builder' },
  { href: '/map',     label: 'Karte'   },
]

export default function Header({ activePage }: Props) {
  const [open, setOpen] = useState(false)
  const { user, role, loading } = useAuth()

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
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-[#F0EDE4]/5 bg-[#141414]/95 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-5 lg:px-8 flex items-center justify-between h-16">

        {/* Logo */}
        <Link href="/" onClick={() => setOpen(false)}>
          <Image src="/logo.svg" alt="MotoDigital" width={180} height={68} className="h-9 w-auto" priority />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className={`text-sm transition-colors ${
                activePage === l.label.toLowerCase()
                  ? 'text-[#F0EDE4] font-semibold'
                  : 'text-[#F0EDE4]/50 hover:text-[#F0EDE4]'
              }`}
            >
              {l.label}
            </Link>
          ))}
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
              <Link href="/dashboard" className="flex items-center gap-2 text-sm text-[#F0EDE4]/60 hover:text-[#F0EDE4] transition-colors px-3 py-2">
                <LayoutDashboard size={15} />
                Dashboard
              </Link>
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
            {NAV_LINKS.map(l => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={`py-3 px-2 text-base rounded-xl transition-colors ${
                  activePage === l.label.toLowerCase()
                    ? 'text-[#F0EDE4] font-semibold bg-[#F0EDE4]/5'
                    : 'text-[#F0EDE4]/60 hover:text-[#F0EDE4] hover:bg-[#F0EDE4]/5'
                }`}
              >
                {l.label}
              </Link>
            ))}
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
