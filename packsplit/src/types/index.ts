export interface WorkspaceSession {
  workspaceId: string
  shareCode: string
}

export type SplitMode = 'equal' | 'custom'

export interface Person {
  id: string
  name: string
  percentage: number
  sortOrder: number
  isActive: boolean
}

export interface WorkDay {
  dayOfWeek: number
  isActive: boolean
}

export interface AppSettings {
  pricePerPackage: number
  splitMode: SplitMode
}

export interface DailyRecord {
  id: string
  recordDate: string
  packagesCount: number
}

export interface WeekData {
  weekStart: string
  weekEnd: string
  records: DailyRecord[]
}

export const DAY_NAMES = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
  'Domingo',
] as const

export const DEFAULT_WORK_DAYS: WorkDay[] = [
  { dayOfWeek: 1, isActive: true },
  { dayOfWeek: 2, isActive: true },
  { dayOfWeek: 3, isActive: true },
  { dayOfWeek: 4, isActive: true },
  { dayOfWeek: 5, isActive: true },
  { dayOfWeek: 6, isActive: true },
  { dayOfWeek: 7, isActive: false },
]
