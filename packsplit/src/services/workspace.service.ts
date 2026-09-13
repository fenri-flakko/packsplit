import { supabase } from '@/lib/supabase'
import type { WorkspaceSession } from '@/types'
import type { DailyRecordData } from '@/lib/calculations'

interface WorkspaceRpcResult {
  workspace_id: string
  share_code: string
}

interface DailyRecordResult {
  id: string | null
  record_date: string
  packages_count: number
  person1_worked?: boolean
  person2_worked?: boolean
}

interface WeekHistoryRow {
  week_start: string
  week_end: string
  total_packages: number
}

function mapDailyRecord(row: DailyRecordResult): DailyRecordData {
  return {
    recordDate: row.record_date,
    packagesCount: row.packages_count ?? 0,
    person1Worked: row.person1_worked ?? true,
    person2Worked: row.person2_worked ?? true,
  }
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
): Promise<DailyRecordData> {
  const { data, error } = await supabase.rpc('get_daily_record', {
    p_share_code: shareCode,
    p_date: date,
  })

  if (error) throw new Error(error.message)
  return mapDailyRecord(data as DailyRecordResult)
}

export async function upsertDailyRecordRpc(
  shareCode: string,
  date: string,
  packages: number,
  person1Worked: boolean,
  person2Worked: boolean,
): Promise<void> {
  const { error } = await supabase.rpc('upsert_daily_record', {
    p_share_code: shareCode,
    p_date: date,
    p_packages: packages,
    p_person1_worked: person1Worked,
    p_person2_worked: person2Worked,
  })

  if (error) throw new Error(error.message)
}

export async function getWeekRecordsRpc(
  shareCode: string,
  weekStart: string,
): Promise<DailyRecordData[]> {
  const { data, error } = await supabase.rpc('get_week_records', {
    p_share_code: shareCode,
    p_week_start: weekStart,
  })

  if (error) throw new Error(error.message)
  return ((data as DailyRecordResult[]) ?? []).map(mapDailyRecord)
}

export async function getWeeksHistoryRpc(shareCode: string): Promise<
  Array<{ weekStart: string; weekEnd: string; totalPackages: number }>
> {
  const { data, error } = await supabase.rpc('get_weeks_history', {
    p_share_code: shareCode,
  })

  if (error) throw new Error(error.message)
  return ((data as WeekHistoryRow[]) ?? []).map((row) => ({
    weekStart: row.week_start,
    weekEnd: row.week_end,
    totalPackages: row.total_packages,
  }))
}

export async function getMonthRecordsRpc(
  shareCode: string,
  year: number,
  month: number,
): Promise<DailyRecordData[]> {
  const { data, error } = await supabase.rpc('get_month_records', {
    p_share_code: shareCode,
    p_year: year,
    p_month: month,
  })

  if (error) throw new Error(error.message)
  return ((data as DailyRecordResult[]) ?? []).map(mapDailyRecord)
}
