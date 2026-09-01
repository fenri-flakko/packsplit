import { supabase } from '@/lib/supabase'
import type {
  WorkspaceRpcResult,
  WorkspaceDataResult,
  DailyRecordResult,
} from '@/types/database'
import type { WorkspaceSession } from '@/types'

function parseRpcResult<T>(data: unknown): T {
  if (data === null || data === undefined) {
    throw new Error('RPC_NO_DATA')
  }
  return data as T
}

export async function createWorkspaceRpc(): Promise<WorkspaceSession> {
  const { data, error } = await supabase.rpc('create_workspace')

  if (error) throw new Error(error.message)

  const result = parseRpcResult<WorkspaceRpcResult>(data)
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

  const result = parseRpcResult<WorkspaceRpcResult>(data)
  return {
    workspaceId: result.workspace_id,
    shareCode: result.share_code,
  }
}

export async function getWorkspaceDataRpc(
  shareCode: string,
): Promise<WorkspaceDataResult> {
  const { data, error } = await supabase.rpc('get_workspace_data', {
    p_share_code: shareCode,
  })

  if (error) throw new Error(error.message)
  return parseRpcResult<WorkspaceDataResult>(data)
}

export async function regenerateShareCodeRpc(
  shareCode: string,
): Promise<WorkspaceSession> {
  const { data, error } = await supabase.rpc('regenerate_share_code', {
    p_share_code: shareCode,
  })

  if (error) throw new Error(error.message)

  const result = parseRpcResult<WorkspaceRpcResult>(data)
  return {
    workspaceId: result.workspace_id,
    shareCode: result.share_code,
  }
}

export async function getDailyRecordRpc(
  shareCode: string,
  date: string,
): Promise<DailyRecordResult> {
  const { data, error } = await supabase.rpc('get_daily_record', {
    p_share_code: shareCode,
    p_date: date,
  })

  if (error) throw new Error(error.message)
  return parseRpcResult<DailyRecordResult>(data)
}

export async function upsertDailyRecordRpc(
  shareCode: string,
  date: string,
  packages: number,
): Promise<DailyRecordResult> {
  const { data, error } = await supabase.rpc('upsert_daily_record', {
    p_share_code: shareCode,
    p_date: date,
    p_packages: packages,
  })

  if (error) throw new Error(error.message)
  return parseRpcResult<DailyRecordResult>(data)
}
