"use client";

import { useRef, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

const NAV_ITEMS = [
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
    id: "werkstatt",
    label: "Werkstatt",
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
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

const TEAL = "#2AABAB";
const TEAL_BG = "rgba(42, 171, 171, 0.13)";
const INACTIVE = "#6B7280";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [ripple, setRipple] = useState(null);
  const rippleTimeout = useRef(null);

  const handleTap = (id, href) => {
    if (rippleTimeout.current) clearTimeout(rippleTimeout.current);
    setRipple(id);
    rippleTimeout.current = setTimeout(() => setRipple(null), 500);
    router.push(href);
  };

  useEffect(() => {
    return () => {
      if (rippleTimeout.current) clearTimeout(rippleTimeout.current);
    };
  }, []);

  return (
    <>
      {/* Spacer so page content isn't hidden */}
      <div className="block md:hidden" style={{ height: 96 }} />

      {/* Floating nav wrapper */}
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
            background: "rgba(243, 243, 243, 0.94)",
            backdropFilter: "saturate(180%) blur(24px)",
            WebkitBackdropFilter: "saturate(180%) blur(24px)",
            borderRadius: 28,
            boxShadow:
              "0 8px 40px rgba(0,0,0,0.08), 0 2px 12px rgba(0,0,0,0.06)",
            border: "1px solid rgba(0,0,0,0.06)",
            width: "100%",
            maxWidth: 400,
          }}
        >
          <div
            className="flex items-center justify-around"
            style={{ height: 62, padding: "0 6px" }}
          >
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              const isRippling = ripple === item.id;

              return (
                <a
                  key={item.id}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    handleTap(item.id, item.href);
                  }}
                  className="relative flex items-center justify-center"
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 18,
                    WebkitTapHighlightColor: "transparent",
                    overflow: "hidden",
                  }}
                  aria-label={item.label}
                >
                  {/* Animated active background */}
                  <span
                    style={{
                      position: "absolute",
                      inset: 0,
                      borderRadius: 18,
                      background: TEAL_BG,
                      transition:
                        "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease",
                      transform: isActive ? "scale(1)" : "scale(0.5)",
                      opacity: isActive ? 1 : 0,
                    }}
                  />

                  {/* Ripple on tap */}
                  {isRippling && (
                    <span
                      style={{
                        position: "absolute",
                        inset: 0,
                        borderRadius: 18,
                        background: "rgba(42, 171, 171, 0.2)",
                        animation: "mdNavRipple 0.5s ease-out forwards",
                      }}
                    />
                  )}

                  {/* Icon with animated color + scale */}
                  <span
                    className="mobileNavIcon"
                    style={{
                      position: "relative",
                      zIndex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      stroke: isActive ? TEAL : INACTIVE,
                      transition:
                        "stroke 0.3s ease, transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
                      transform: isActive ? "scale(1.12)" : "scale(1)",
                    }}
                  >
                    {item.icon}
                  </span>
                </a>
              );
            })}
          </div>
        </nav>
      </div>

      <style>{`
        @keyframes mdNavRipple {
          0% { transform: scale(0.4); opacity: 1; }
          100% { transform: scale(1.2); opacity: 0; }
        }
      `}</style>
    </>
  );
}
