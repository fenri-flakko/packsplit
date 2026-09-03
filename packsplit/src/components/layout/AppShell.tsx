import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { BottomNav } from './BottomNav'
import { useWorkspace } from '@/hooks/useWorkspace'

interface AppShellProps {
  showNav?: boolean
  showSettings?: boolean
  showBack?: boolean
  showHome?: boolean
  title?: string
}

export function AppShell({
  showNav = true,
  showSettings = true,
  showBack = false,
  showHome = false,
  title,
}: AppShellProps) {
  const { leaveWorkspace } = useWorkspace()

  return (
    <div className="flex min-h-dvh flex-col bg-bg">
      <Header
        title={title}
        showSettings={showSettings}
        showBack={showBack}
        showHome={showHome}
        onHome={showHome ? leaveWorkspace : undefined}
      />
      <main className={`mx-auto w-full max-w-lg flex-1 px-4 ${showNav ? 'pb-20 pt-4' : 'py-4'}`}>
        <Outlet />
      </main>
      {showNav && <BottomNav />}
    </div>
  )
}
