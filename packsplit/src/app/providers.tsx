import { RouterProvider } from 'react-router-dom'
import { WorkspaceProvider } from '@/hooks/useWorkspace'
import { router } from './router'

export function AppProviders() {
  return (
    <WorkspaceProvider>
      <RouterProvider router={router} />
    </WorkspaceProvider>
  )
}
