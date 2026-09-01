import type { WorkspaceSession } from '@/types'

const STORAGE_KEY = 'packsplit_workspace'

export function getWorkspaceSession(): WorkspaceSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as WorkspaceSession
    if (!parsed.workspaceId || !parsed.shareCode) return null
    return parsed
  } catch {
    return null
  }
}

export function saveWorkspaceSession(session: WorkspaceSession): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
}

export function clearWorkspaceSession(): void {
  localStorage.removeItem(STORAGE_KEY)
}

export function normalizeShareCode(code: string): string {
  return code.trim().toUpperCase().replace(/[^A-Z0-9]/g, '')
}
