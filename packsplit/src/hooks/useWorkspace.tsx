import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react'
import type { WorkspaceSession } from '@/types'
import {
  getWorkspaceSession,
  saveWorkspaceSession,
  clearWorkspaceSession,
} from '@/lib/workspace-storage'

interface WorkspaceContextValue {
  session: WorkspaceSession | null
  isLoading: boolean
  joinWorkspace: (session: WorkspaceSession) => void
  createWorkspace: () => Promise<void>
  joinByCode: (shareCode: string) => Promise<boolean>
  leaveWorkspace: () => void
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null)

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<WorkspaceSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const stored = getWorkspaceSession()
    setSession(stored)
    setIsLoading(false)
  }, [])

  const joinWorkspace = useCallback((newSession: WorkspaceSession) => {
    saveWorkspaceSession(newSession)
    setSession(newSession)
  }, [])

  const createWorkspace = useCallback(async () => {
    const newSession: WorkspaceSession = {
      workspaceId: crypto.randomUUID(),
      shareCode: generateShareCode(),
    }
    joinWorkspace(newSession)
  }, [joinWorkspace])

  const joinByCode = useCallback(
    async (shareCode: string): Promise<boolean> => {
      if (shareCode.length < 6) return false

      const newSession: WorkspaceSession = {
        workspaceId: crypto.randomUUID(),
        shareCode,
      }
      joinWorkspace(newSession)
      return true
    },
    [joinWorkspace],
  )

  const leaveWorkspace = useCallback(() => {
    clearWorkspaceSession()
    setSession(null)
  }, [])

  return (
    <WorkspaceContext.Provider
      value={{
        session,
        isLoading,
        joinWorkspace,
        createWorkspace,
        joinByCode,
        leaveWorkspace,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  )
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext)
  if (!ctx) {
    throw new Error('useWorkspace debe usarse dentro de WorkspaceProvider')
  }
  return ctx
}

function generateShareCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 8 }, () =>
    chars[Math.floor(Math.random() * chars.length)],
  ).join('')
}
