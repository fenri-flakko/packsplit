import { Navigate, Outlet } from 'react-router-dom'
import { useWorkspace } from '@/hooks/useWorkspace'

export function WorkspaceGuard() {
  const { session, isLoading } = useWorkspace()

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-bg">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/bienvenida" replace />
  }

  return <Outlet />
}

export function GuestGuard() {
  const { session, isLoading } = useWorkspace()

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-bg">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    )
  }

  if (session) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
