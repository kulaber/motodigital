/**
 * Rider route group layout.
 * Auth guards and DashboardShell are handled by dashboard/layout.tsx.
 * Bottom navigation (RiderNavBar) is handled by AppBottomNav in the root layout.
 */
export default function RiderLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
