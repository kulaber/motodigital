'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Home, Search, MessageCircle, User, Plus } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

interface RiderNavBarProps {
  className?: string
}

const ACCENT = '#2AABAB'

export function RiderNavBar({ className }: RiderNavBarProps) {
  const pathname = usePathname()
  const { slug, avatarUrl, unreadCount, unreadNotificationCount } = useAuth()
  const [navHidden, setNavHidden] = useState(false)
  const modalCountRef = useRef(0)

  // Dynamic profile href — rider public profile or dashboard fallback
  const profileHref = slug ? `/rider/${slug}` : '/dashboard'

  // Hide nav when modals/overlays/keyboard open
  useEffect(() => {
    const hide = () => {
      modalCountRef.current += 1
      setNavHidden(true)
    }
    const show = () => {
      modalCountRef.current = Math.max(0, modalCountRef.current - 1)
      if (modalCountRef.current === 0) setNavHidden(false)
    }
    window.addEventListener('modal-open', hide)
    window.addEventListener('modal-close', show)
    window.addEventListener('gallery-modal-open', hide)
    window.addEventListener('gallery-modal-close', show)
    window.addEventListener('keyboard-open', hide)
    window.addEventListener('keyboard-close', show)
    return () => {
      window.removeEventListener('modal-open', hide)
      window.removeEventListener('modal-close', show)
      window.removeEventListener('gallery-modal-open', hide)
      window.removeEventListener('gallery-modal-close', show)
      window.removeEventListener('keyboard-open', hide)
      window.removeEventListener('keyboard-close', show)
    }
  }, [])

  function isActive(href: string, id: string) {
    if (id === 'feed') return pathname === '/explore'
    if (id === 'entdecken') {
      return pathname === '/search' || pathname.startsWith('/search/')
        || pathname === '/custom-werkstatt' || pathname.startsWith('/custom-werkstatt/')
        || pathname === '/bikes' || pathname.startsWith('/bikes/')
        || pathname.startsWith('/custom-bike/')
    }
    if (id === 'nachrichten') return pathname.startsWith('/dashboard/messages')
    if (id === 'profil') {
      return pathname.startsWith('/rider/' + slug)
        || (pathname.startsWith('/dashboard') && !pathname.startsWith('/dashboard/messages'))
    }
    return pathname === href || pathname.startsWith(href + '/')
  }

  const tabs = [
    { id: 'feed',        href: '/explore',            icon: Home,           label: 'Feed',        badge: unreadNotificationCount },
    { id: 'entdecken',   href: '/search',             icon: Search,         label: 'Entdecken',   badge: 0 },
    // FAB placeholder — rendered separately
    { id: 'nachrichten', href: '/dashboard/messages',  icon: MessageCircle,  label: 'Nachrichten', badge: unreadCount },
    { id: 'profil',      href: profileHref,            icon: User,           label: 'Profil',      badge: 0 },
  ]

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 md:hidden flex justify-center ${className ?? ''}`}
      style={{
        paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 0px))',
        paddingLeft: 16,
        paddingRight: 16,
        pointerEvents: 'none',
        transform: navHidden ? 'translateY(120%)' : 'translateY(0)',
        transition: 'transform 300ms cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <nav
        style={{
          pointerEvents: 'auto',
          width: '100%',
          maxWidth: 400,
          background: 'rgba(250, 250, 250, 0.92)',
          backdropFilter: 'saturate(180%) blur(24px)',
          WebkitBackdropFilter: 'saturate(180%) blur(24px)',
          borderRadius: 28,
          boxShadow: '0 4px 24px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)',
          border: '1px solid rgba(0,0,0,0.05)',
        }}
      >
        <div
          className="relative flex items-center justify-evenly"
          style={{ height: 68, padding: '0 4px' }}
        >
          {/* Sliding pill behind active tab (skip FAB center at index 2) */}
          {(() => {
            const activeIdx = tabs.findIndex(t => isActive(t.href, t.id))
            // Map tab index to visual slot (0,1 stay; 2,3 → 3,4 because FAB is slot 2)
            const slot = activeIdx >= 0 ? (activeIdx >= 2 ? activeIdx + 1 : activeIdx) : -1
            if (slot < 0) return null
            return (
              <span
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: `calc(4px + ${slot} * (100% - 8px) / 5)`,
                  width: 'calc((100% - 8px) / 5)',
                  height: 54,
                  transform: 'translateY(-50%)',
                  borderRadius: 24,
                  background: '#111111',
                  transition: 'none',
                  zIndex: 0,
                }}
              />
            )
          })()}

          {/* Tab 1: Feed */}
          <NavTab
            href={tabs[0].href}
            icon={tabs[0].icon}
            active={isActive(tabs[0].href, tabs[0].id)}
            badge={tabs[0].badge}
          />

          {/* Tab 2: Entdecken */}
          <NavTab
            href={tabs[1].href}
            icon={tabs[1].icon}
            active={isActive(tabs[1].href, tabs[1].id)}
            badge={tabs[1].badge}
          />

          {/* FAB — center */}
          <div className="relative flex items-center justify-center" style={{ flex: 1, zIndex: 2 }}>
            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event('open-post-composer'))}
              className="flex items-center justify-center active:scale-95 transition-transform"
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: ACCENT,
                boxShadow: `0 4px 16px rgba(42, 171, 171, 0.3)`,
                WebkitTapHighlightColor: 'transparent',
                marginTop: -4,
                border: 'none',
                cursor: 'pointer',
              }}
              aria-label="Neuen Beitrag erstellen"
            >
              <Plus className="w-5 h-5 text-white" strokeWidth={2.5} />
            </button>
          </div>

          {/* Tab 3: Nachrichten */}
          <NavTab
            href={tabs[2].href}
            icon={tabs[2].icon}
            active={isActive(tabs[2].href, tabs[2].id)}
            badge={tabs[2].badge}
          />

          {/* Tab 4: Profil */}
          <NavTab
            href={tabs[3].href}
            icon={tabs[3].icon}
            active={isActive(tabs[3].href, tabs[3].id)}
            badge={tabs[3].badge}
            avatarUrl={avatarUrl}
          />
        </div>
      </nav>
    </div>
  )
}

/* ── NavTab subcomponent ── */
interface NavTabProps {
  href: string
  icon: React.ElementType
  active: boolean
  badge: number
  avatarUrl?: string | null
}

function NavTab({ href, icon: Icon, active, badge, avatarUrl }: NavTabProps) {
  return (
    <Link
      href={href}
      prefetch
      className="relative flex items-center justify-center"
      style={{
        flex: 1,
        height: 54,
        borderRadius: 16,
        WebkitTapHighlightColor: 'transparent',
        zIndex: 1,
      }}
    >
      <span className="relative flex items-center justify-center">
        {avatarUrl ? (
          <div
            className={`w-6 h-6 rounded-full overflow-hidden border-2 transition-all ${
              active ? 'border-white' : 'border-transparent'
            }`}
          >
            <Image
              src={avatarUrl}
              alt=""
              width={24}
              height={24}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <Icon
            className="w-[22px] h-[22px] transition-colors"
            style={{ color: active ? '#FFFFFF' : '#B0B0B8' }}
            strokeWidth={active ? 2.2 : 1.8}
          />
        )}
        {badge > 0 && (
          <span
            style={{
              position: 'absolute',
              top: -5,
              right: -9,
              minWidth: 18,
              height: 18,
              padding: '0 4px',
              background: '#06a5a5',
              color: '#FFFFFF',
              fontSize: 9,
              fontWeight: 700,
              borderRadius: 999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: 1,
              border: '2px solid #06a5a5',
            }}
          >
            {badge > 9 ? '9+' : badge}
          </span>
        )}
      </span>
    </Link>
  )
}
