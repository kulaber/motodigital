'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Inbox,
  Bike,
  Building2,
  Settings,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

interface WerkstattNavBarProps {
  className?: string
}

const ACCENT = '#E8A829'
const ITEM_COUNT = 5

const tabs = [
  { href: '/werkstatt/dashboard',     icon: LayoutDashboard, label: 'Dashboard',      id: 'dashboard' },
  { href: '/werkstatt/anfragen',      icon: Inbox,           label: 'Anfragen',       id: 'anfragen' },
  { href: '/werkstatt/bikes',         icon: Bike,            label: 'Meine Bikes',    id: 'bikes' },
  { href: '/werkstatt/profil',        icon: Building2,       label: 'Profil',         id: 'profil' },
  { href: '/werkstatt/einstellungen', icon: Settings,        label: 'Einstellungen',  id: 'einstellungen' },
]

export function WerkstattNavBar({ className }: WerkstattNavBarProps) {
  const pathname = usePathname()
  const { unreadCount } = useAuth()
  const [navHidden, setNavHidden] = useState(false)
  const modalCountRef = useRef(0)

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

  const activeIndex = tabs.findIndex(
    t => pathname === t.href || pathname.startsWith(t.href + '/')
  )

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
          {/* Sliding pill behind active tab */}
          {activeIndex >= 0 && (
            <span
              style={{
                position: 'absolute',
                top: '50%',
                left: `calc(4px + ${activeIndex} * (100% - 8px) / ${ITEM_COUNT})`,
                width: `calc((100% - 8px) / ${ITEM_COUNT})`,
                height: 54,
                transform: 'translateY(-50%)',
                borderRadius: 24,
                background: '#111111',
                transition: 'none',
                zIndex: 0,
              }}
            />
          )}

          {tabs.map(({ href, icon: Icon, id }, index) => {
            const active = activeIndex === index
            const showBadge = id === 'anfragen' && unreadCount > 0
            return (
              <Link
                key={href}
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
                aria-label={tabs[index].label}
              >
                <span className="relative flex items-center justify-center">
                  <Icon
                    className="w-[22px] h-[22px] transition-colors"
                    style={{ color: active ? '#FFFFFF' : '#B0B0B8' }}
                    strokeWidth={active ? 2.2 : 1.8}
                  />
                  {showBadge && (
                    <span
                      style={{
                        position: 'absolute',
                        top: -5,
                        right: -9,
                        minWidth: 18,
                        height: 18,
                        padding: '0 4px',
                        background: ACCENT,
                        color: '#111111',
                        fontSize: 9,
                        fontWeight: 700,
                        borderRadius: 999,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        lineHeight: 1,
                        border: `2px solid ${ACCENT}`,
                      }}
                    >
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
