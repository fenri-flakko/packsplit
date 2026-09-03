import type { WorkspaceSession } from '@/types'

export interface SavedSpace extends WorkspaceSession {
  name: string
}

const STORAGE_KEY = 'packsplit_saved_spaces'

export function getSavedSpaces(): SavedSpace[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as SavedSpace[]
    if (!Array.isArray(parsed)) return []
    return parsed.filter((space) => space.workspaceId && space.shareCode)
  } catch {
    return []
  }
}

export function saveSavedSpace(space: SavedSpace): void {
  const name = space.name.trim() || space.shareCode
  const next = getSavedSpaces().filter(
    (item) => item.shareCode !== space.shareCode,
  )
  next.unshift({ ...space, name })
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
}

export function removeSavedSpace(shareCode: string): void {
  const next = getSavedSpaces().filter((item) => item.shareCode !== shareCode)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
}
