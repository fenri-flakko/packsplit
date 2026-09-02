import { RouterProvider } from 'react-router-dom'
import { WorkspaceProvider } from '@/hooks/useWorkspace'
import { AppSettingsProvider } from '@/hooks/useAppSettings'
import { router } from './router'

export function AppProviders() {
  return (
    <WorkspaceProvider>
      <AppSettingsProvider>
        <RouterProvider router={router} />
      </AppSettingsProvider>
    </WorkspaceProvider>
  )
}
