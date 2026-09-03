import { supabase } from '@/lib/supabase'
import type { WorkspaceSession } from '@/types'

interface WorkspaceRpcResult {
  workspace_id: string
  share_code: string
}

interface DailyRecordResult {
  id: string | null
  record_date: string
  packages_count: number
}

export async function createWorkspaceRpc(): Promise<WorkspaceSession> {
  const { data, error } = await supabase.rpc('create_workspace')
  if (error) throw new Error(error.message)

  const result = data as WorkspaceRpcResult
  return {
    workspaceId: result.workspace_id,
    shareCode: result.share_code,
  }
}

export async function joinWorkspaceRpc(
  shareCode: string,
): Promise<WorkspaceSession | null> {
  const { data, error } = await supabase.rpc('join_workspace', {
    p_share_code: shareCode,
  })

  if (error) throw new Error(error.message)
  if (!data) return null

  const result = data as WorkspaceRpcResult
  return {
    workspaceId: result.workspace_id,
    shareCode: result.share_code,
  }
}

export async function getDailyRecordRpc(
  shareCode: string,
  date: string,
): Promise<number> {
  const { data, error } = await supabase.rpc('get_daily_record', {
    p_share_code: shareCode,
    p_date: date,
  })

  if (error) throw new Error(error.message)
  const result = data as DailyRecordResult
  return result?.packages_count ?? 0
}

export async function upsertDailyRecordRpc(
  shareCode: string,
  date: string,
  packages: number,
): Promise<void> {
  const { error } = await supabase.rpc('upsert_daily_record', {
    p_share_code: shareCode,
    p_date: date,
    p_packages: packages,
  })

  if (error) throw new Error(error.message)
}
