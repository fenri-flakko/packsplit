export interface Database {
  public: {
    Tables: Record<string, never>
    Views: Record<string, never>
    Functions: {
      create_workspace: {
        Args: Record<string, never>
        Returns: Json
      }
      join_workspace: {
        Args: { p_share_code: string }
        Returns: Json
      }
      get_workspace_data: {
        Args: { p_share_code: string }
        Returns: Json
      }
      regenerate_share_code: {
        Args: { p_share_code: string }
        Returns: Json
      }
      get_or_create_week: {
        Args: { p_share_code: string; p_date: string }
        Returns: Json
      }
      get_daily_record: {
        Args: { p_share_code: string; p_date: string }
        Returns: Json
      }
      upsert_daily_record: {
        Args: {
          p_share_code: string
          p_date: string
          p_packages: number
        }
        Returns: Json
      }
    }
    Enums: Record<string, never>
  }
}

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface WorkspaceRpcResult {
  workspace_id: string
  share_code: string
}

export interface WorkspaceDataResult {
  workspace_id: string
  share_code: string
  settings: {
    price_per_package: number
    split_mode: 'equal' | 'custom'
  }
  persons: Array<{
    id: string
    name: string
    percentage: number
    sort_order: number
    is_active: boolean
  }>
  work_days: Array<{
    day_of_week: number
    is_active: boolean
  }>
}

export interface DailyRecordResult {
  id: string | null
  record_date: string
  packages_count: number
}
