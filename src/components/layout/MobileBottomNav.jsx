"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

const NAV_ITEMS = [
  {
    id: "werkstatt",
    label: "Suche",
    href: "/custom-werkstatt",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
        <circle cx="11" cy="11" r="3" />
      </svg>
    ),
  },
  {
    id: "bikes",
    label: "Custom Bikes",
    href: "/bikes",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="4.5" cy="16.5" r="3" />
        <circle cx="19.5" cy="16.5" r="3" />
        <path d="M7.5 16.5l2-4.5h5l1.5 2L19.5 16.5" />
        <path d="M9.5 12l2-4.5h2" />
        <path d="M16 14l3-6.5" />
      </svg>
    ),
  },
  {
    id: "explore",
    label: "Explore",
    href: "/explore",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
      </svg>
    ),
  },
  {
    id: "nachrichten",
    label: "Nachrichten",
    href: "/dashboard/messages",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
      </svg>
    ),
  },
  {
    id: "profil",
    label: "Profil",
    href: "/dashboard",
    dynamicHref: true,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

const ITEM_COUNT = NAV_ITEMS.length;
const INACTIVE_ICON = "#B0B0B8";

/* Gate — only mounts the inner nav when user is logged in */
export default function MobileBottomNav() {
  const { user, loading } = useAuth();
  if (loading || !user) return null;
  return <MobileBottomNavInner />;
}

function MobileBottomNavInner() {
  const { role, slug, unreadCount, unreadNotificationCount } = useAuth();
  const pathname = usePathname();
  const [optimistic, setOptimistic] = useState({ index: -1, href: null });

  // Resolve dynamic profile href for riders
  const riderProfileHref = role === "rider" && slug ? `/rider/${slug}` : null;
  const navItems = NAV_ITEMS.map((item) => {
    if (item.dynamicHref && riderProfileHref) {
      return { ...item, href: riderProfileHref };
    }
    return item;
  });

  const routeIndex = navItems.findIndex((item) => {
    if (pathname === item.href || pathname.startsWith(item.href + "/")) return true;
    // Bikes: also match /custom-bike/* detail pages
    if (item.id === "bikes" && pathname.startsWith("/custom-bike/")) return true;
    // Profil: match all /dashboard/* pages except /dashboard/messages
    if (item.dynamicHref && pathname.startsWith("/dashboard") && !pathname.startsWith("/dashboard/messages")) return true;
    return false;
  });

  // Show optimistic index until pathname reaches the target href
  const arrivedAtTarget =
    optimistic.href &&
    (pathname === optimistic.href || pathname.startsWith(optimistic.href + "/"));
  const activeIndex =
    optimistic.index >= 0 && !arrivedAtTarget ? optimistic.index : routeIndex;

  // Hide nav when any modal/overlay opens
  const [navHidden, setNavHidden] = useState(false);
  const modalCountRef = useRef(0);
  useEffect(() => {
    const hide = () => {
      modalCountRef.current += 1;
      setNavHidden(true);
    };
    const show = () => {
      modalCountRef.current = Math.max(0, modalCountRef.current - 1);
      if (modalCountRef.current === 0) setNavHidden(false);
    };
    window.addEventListener("modal-open", hide);
    window.addEventListener("modal-close", show);
    window.addEventListener("gallery-modal-open", hide);
    window.addEventListener("gallery-modal-close", show);
    window.addEventListener("keyboard-open", hide);
    window.addEventListener("keyboard-close", show);
    return () => {
      window.removeEventListener("modal-open", hide);
      window.removeEventListener("modal-close", show);
      window.removeEventListener("gallery-modal-open", hide);
      window.removeEventListener("gallery-modal-close", show);
      window.removeEventListener("keyboard-open", hide);
      window.removeEventListener("keyboard-close", show);
    };
  }, []);

  return (
    <>
      {/* Spacer so page content isn't hidden (skip on all dashboard pages — they manage own layout) */}
      {!pathname.startsWith("/dashboard") && (
        <div className="block md:hidden" style={{ height: 96 }} />
      )}

      {/* Docked nav wrapper */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 md:hidden flex justify-center"
        style={{
          paddingBottom: "calc(12px + env(safe-area-inset-bottom, 0px))",
          paddingLeft: 16,
          paddingRight: 16,
          pointerEvents: "none",
          transform: navHidden ? "translateY(120%)" : "translateY(0)",
          transition: "transform 300ms cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <nav
          style={{
            pointerEvents: "auto",
            width: "100%",
            maxWidth: 400,
            background: "rgba(250, 250, 250, 0.92)",
            backdropFilter: "saturate(180%) blur(24px)",
            WebkitBackdropFilter: "saturate(180%) blur(24px)",
            borderRadius: 28,
            boxShadow: "0 4px 24px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)",
            border: "1px solid rgba(0,0,0,0.05)",
          }}
        >
          <div
            className="relative flex items-center justify-evenly"
            style={{ height: 68, padding: "0 4px" }}
          >
            {/* Sliding pill — pure CSS positioning, no DOM measurement */}
            {activeIndex >= 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "50%",
                  left: `calc(4px + ${activeIndex} * (100% - 8px) / ${ITEM_COUNT})`,
                  width: `calc((100% - 8px) / ${ITEM_COUNT})`,
                  height: 54,
                  transform: "translateY(-50%)",
                  borderRadius: 24,
                  background: "#111111",
                  transition: "none",
                  zIndex: 0,
                }}
              />
            )}

            {navItems.map((item, index) => {
              const isActive = activeIndex === index;
              const showBadge = (item.id === "nachrichten" && unreadCount > 0) || (item.id === "explore" && unreadNotificationCount > 0);

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  prefetch={true}
                  onClick={() => setOptimistic({ index, href: item.href })}
                  className="relative flex items-center justify-center"
                  style={{
                    flex: 1,
                    height: 54,
                    borderRadius: 16,
                    WebkitTapHighlightColor: "transparent",
                    zIndex: 1,
                  }}
                  aria-label={item.label}
                >
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      stroke: isActive ? "#FFFFFF" : INACTIVE_ICON,
                      position: "relative",
                    }}
                  >
                    {item.icon}
                    {showBadge && (
                      <span
                        style={{
                          position: "absolute",
                          top: -5,
                          right: -9,
                          minWidth: 18,
                          height: 18,
                          padding: "0 4px",
                          background: "#06a5a5",
                          color: "#FFFFFF",
                          fontSize: 9,
                          fontWeight: 700,
                          borderRadius: 999,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          lineHeight: 1,
                          border: "2px solid #06a5a5",
                        }}
                      >
                        {(() => {
                          const count = item.id === "explore" ? unreadNotificationCount : unreadCount;
                          return count > 9 ? "9+" : count;
                        })()}
                      </span>
                    )}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </>
  );
}
