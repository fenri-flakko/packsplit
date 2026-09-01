import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { BottomNav } from './BottomNav'

interface AppShellProps {
  showNav?: boolean
  showSettings?: boolean
  title?: string
}

export function AppShell({
  showNav = true,
  showSettings = true,
  title,
}: AppShellProps) {
  return (
    <div className="flex min-h-dvh flex-col bg-bg">
      <Header title={title} showSettings={showSettings} />
      <main className={`mx-auto w-full max-w-lg flex-1 px-4 ${showNav ? 'pb-20 pt-4' : 'py-4'}`}>
        <Outlet />
      </main>
      {showNav && <BottomNav />}
    </div>
  )
}
