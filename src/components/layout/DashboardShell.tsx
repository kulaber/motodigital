import Header from './Header'
import DashboardNav from '@/app/dashboard/DashboardNav'

interface Props {
  children: React.ReactNode
  role: string | null
  userName: string | null
  avatarUrl: string | null
  slug?: string | null
}

export default function DashboardShell({ children, role, userName, avatarUrl, slug }: Props) {
  return (
    <div className="h-dvh flex flex-col bg-[#F7F7F7] overflow-hidden">
      <Header />
      <div className="flex flex-1 min-h-0 justify-center bg-[#F7F7F7]">
        <div className="flex flex-1 min-h-0 w-full max-w-7xl">
          <div className="hidden lg:block">
            <DashboardNav role={role} userName={userName} avatarUrl={avatarUrl} slug={slug} />
          </div>
          <main className="flex-1 min-w-0 min-h-0 overflow-y-auto overflow-x-hidden">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
