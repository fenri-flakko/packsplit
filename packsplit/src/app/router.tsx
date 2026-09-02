import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { WorkspaceGuard, GuestGuard } from '@/components/layout/WorkspaceGuard'
import { WelcomePage } from '@/pages/WelcomePage'
import { JoinPage } from '@/pages/JoinPage'
import { TodayPage } from '@/pages/TodayPage'
import { WeekPage } from '@/pages/WeekPage'
import { HistoryPage } from '@/pages/HistoryPage'
import { MonthPage } from '@/pages/MonthPage'
import { SettingsPage } from '@/pages/SettingsPage'

export const router = createBrowserRouter(
  [
  {
    path: '/join/:code',
    element: <JoinPage />,
  },
  {
    element: <GuestGuard />,
    children: [
      {
        path: '/bienvenida',
        element: <WelcomePage />,
      },
    ],
  },
  {
    element: <WorkspaceGuard />,
    children: [
      {
        element: <AppShell />,
        children: [
          { index: true, element: <TodayPage /> },
          { path: 'semana', element: <WeekPage /> },
          { path: 'historial', element: <HistoryPage /> },
          { path: 'mes', element: <MonthPage /> },
        ],
      },
      {
        path: '/ajustes',
        element: <AppShell showNav={false} title="Ajustes" />,
        children: [
          { index: true, element: <SettingsPage /> },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
  ],
  { basename: import.meta.env.BASE_URL },
)
