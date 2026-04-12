"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

const INACTIVE_ICON = "#B0B0B8";

interface NavItem {
  id: string;
  label: string;
  href: string;
  dynamicHref?: boolean;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    href: "/dashboard",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
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
    id: "anfragen",
    label: "Nachrichten",
    href: "/dashboard/messages",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
      </svg>
    ),
  },
  {
    id: "builds",
    label: "Custom Bikes",
    href: "/dashboard/meine-garage",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="18.5" cy="17.5" r="3.5" />
        <circle cx="5.5" cy="17.5" r="3.5" />
        <path d="M15 6h1a2 2 0 012 2v1" />
        <path d="M9 17.5h6" />
        <path d="M5.5 14l3-8h4l3 4h3" />
      </svg>
    ),
  },
  {
    id: "profil",
    label: "Profil",
    href: "/custom-werkstatt",
    dynamicHref: true,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="10" r="3" />
        <path d="M6.168 18.849A4 4 0 0110 16h4a4 4 0 013.834 2.855" />
      </svg>
    ),
  },
];

const ITEM_COUNT = NAV_ITEMS.length;

export default function WerkstattMobileNav() {
  const { user, loading, role } = useAuth();
  const path = usePathname();

  if (loading || !user) return null;
  if (role !== "custom-werkstatt") return null;
  if (path?.startsWith("/willkommen")) return null;

  return <WerkstattMobileNavInner />;
}

function WerkstattMobileNavInner() {
  const { slug, unreadCount } = useAuth();
  const pathname = usePathname();
  const [optimistic, setOptimistic] = useState({ index: -1, href: null as string | null });

  const profileHref = slug ? `/custom-werkstatt/${slug}` : "/dashboard/profile";
  const navItems = NAV_ITEMS.map((item) => {
    if (item.dynamicHref) return { ...item, href: profileHref };
    return item;
  });

  const routeIndex = navItems.findIndex((item) => {
    if (item.id === "dashboard" && pathname === "/dashboard") return true;
    if (item.id === "explore" && (pathname === "/explore" || pathname.startsWith("/custom-bike/") || pathname.startsWith("/bikes"))) return true;
    if (item.id !== "dashboard" && item.id !== "explore" && (pathname === item.href || pathname.startsWith(item.href + "/"))) return true;
    return false;
  });

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
      {/* Docked nav wrapper */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 md:hidden flex justify-center"
        style={{
          bottom: 0,
          paddingLeft: 16,
          paddingRight: 16,
          paddingBottom: 8,
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
            {/* Sliding pill */}
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
              const hasUnread = item.id === "anfragen" && unreadCount > 0;

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
                    {hasUnread && (
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
                        {unreadCount > 9 ? "9+" : unreadCount}
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
