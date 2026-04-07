/**
 * Public layout — passthrough.
 * Public pages handle their own <Header /> individually.
 * Bottom navigation is handled by AppBottomNav in the root layout.
 */
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
