"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";

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
        <circle cx="5.5" cy="17.5" r="3.5" />
        <circle cx="18.5" cy="17.5" r="3.5" />
        <path d="M15 6h2l3 5.5" />
        <path d="M5.5 17.5L9 8h4l2.5 5.5H18.5" />
        <path d="M9 8L7.5 12" />
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

export default function MobileBottomNav() {
  const { user, role, slug, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [optimistic, setOptimistic] = useState({ index: -1, href: null });
  const [unreadCount, setUnreadCount] = useState(0);
  const supabase = createClient();
  const fetchUnreadRef = useRef(() => {});

  // Fetch unread count + realtime subscription
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!user) { setUnreadCount(0); return; }
    const uid = user.id;

    async function fetchUnread() {
      const { data: convs } = await supabase
        .from("conversations")
        .select("id")
        .or(`seller_id.eq.${uid},buyer_id.eq.${uid}`);
      if (!convs?.length) { setUnreadCount(0); return; }
      const ids = convs.map((c) => c.id);
      const { count } = await supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .in("conversation_id", ids)
        .neq("sender_id", uid)
        .is("read_at", null);
      setUnreadCount(count ?? 0);
    }

    fetchUnreadRef.current = fetchUnread;
    fetchUnread();

    const stableListener = () => fetchUnreadRef.current();
    window.addEventListener("messages-read", stableListener);

    const channel = supabase
      .channel("mobile-unread-badge")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, stableListener)
      .subscribe();

    return () => {
      window.removeEventListener("messages-read", stableListener);
      supabase.removeChannel(channel);
    };
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

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

  const handleTap = (index, href) => {
    setOptimistic({ index, href });
    router.push(href);
  };

  if (loading || !user) return null;

  return (
    <>
      {/* Spacer so page content isn't hidden (skip on viewport-locked pages) */}
      {!pathname.startsWith("/dashboard/messages") && (
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
              const showBadge = item.id === "nachrichten" && unreadCount > 0;

              return (
                <a
                  key={item.id}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    handleTap(index, item.href);
                  }}
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
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </span>
                </a>
              );
            })}
          </div>
        </nav>
      </div>
    </>
  );
}
