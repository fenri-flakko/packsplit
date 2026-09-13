export interface LocalAppSettings {
  person1Name: string
  person2Name: string
  pricePerPackage: number
  /** ISO day of week 1=Lunes … 7=Domingo */
  workDays: Record<number, boolean>
}

const STORAGE_KEY = 'packsplit_settings'

export const DEFAULT_WORK_DAYS: Record<number, boolean> = {
  1: true,
  2: true,
  3: true,
  4: true,
  5: true,
  6: true,
  7: false,
}

export const DEFAULT_APP_SETTINGS: LocalAppSettings = {
  person1Name: 'Persona 1',
  person2Name: 'Persona 2',
  pricePerPackage: 1.2,
  workDays: { ...DEFAULT_WORK_DAYS },
}

function normalizeWorkDays(
  value: Partial<Record<number | string, boolean>> | undefined,
): Record<number, boolean> {
  const next = { ...DEFAULT_WORK_DAYS }
  if (!value) return next
  for (let day = 1; day <= 7; day += 1) {
    const raw = value[day] ?? value[String(day)]
    if (typeof raw === 'boolean') next[day] = raw
  }
  return next
}

export function getAppSettings(): LocalAppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_APP_SETTINGS, workDays: { ...DEFAULT_WORK_DAYS } }

    const parsed = JSON.parse(raw) as Partial<LocalAppSettings>
    return {
      person1Name: parsed.person1Name?.trim() || DEFAULT_APP_SETTINGS.person1Name,
      person2Name: parsed.person2Name?.trim() || DEFAULT_APP_SETTINGS.person2Name,
      pricePerPackage:
        typeof parsed.pricePerPackage === 'number' && parsed.pricePerPackage >= 0
          ? parsed.pricePerPackage
          : DEFAULT_APP_SETTINGS.pricePerPackage,
      workDays: normalizeWorkDays(parsed.workDays),
    }
  } catch {
    return { ...DEFAULT_APP_SETTINGS, workDays: { ...DEFAULT_WORK_DAYS } }
  }
}

export function saveAppSettings(settings: LocalAppSettings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
}

export function parsePriceInput(value: string): number {
  const normalized = value.trim().replace(',', '.')
  if (!normalized) return 0

  const parsed = Number(normalized)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0
}

export function formatPriceForInput(price: number): string {
  return String(price).replace('.', ',')
}
