import Header from './Header'
import DashboardNav from '@/app/dashboard/DashboardNav'

interface Props {
  children: React.ReactNode
  role: string | null
  userName: string | null
  avatarUrl: string | null
}

export default function DashboardShell({ children, role, userName, avatarUrl }: Props) {
  return (
    <div className="min-h-dvh flex flex-col bg-[#F7F7F7]">
      <Header />
      <div className="flex flex-1 justify-center bg-[#F7F7F7]">
        <div className="flex flex-1 w-full max-w-7xl">
          <div className="hidden lg:block">
            <DashboardNav role={role} userName={userName} avatarUrl={avatarUrl} />
          </div>
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
