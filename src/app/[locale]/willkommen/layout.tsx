export const metadata = {
  title: 'Willkommen bei MotoDigital',
}

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="h-[100dvh] bg-[#111111] flex flex-col overflow-hidden">
      {children}
    </div>
  )
}
