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
import {
  createWorkspaceRpc,
  joinWorkspaceRpc,
} from '@/services/workspace.service'

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
    const newSession = await createWorkspaceRpc()
    joinWorkspace(newSession)
  }, [joinWorkspace])

  const joinByCode = useCallback(
    async (shareCode: string): Promise<boolean> => {
      if (shareCode.length < 6) return false

      const newSession = await joinWorkspaceRpc(shareCode)
      if (!newSession) return false

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
