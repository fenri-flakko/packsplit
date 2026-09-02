export interface LocalAppSettings {
  person1Name: string
  person2Name: string
  pricePerPackage: number
}

const STORAGE_KEY = 'packsplit_settings'

export const DEFAULT_APP_SETTINGS: LocalAppSettings = {
  person1Name: 'Persona 1',
  person2Name: 'Persona 2',
  pricePerPackage: 1.2,
}

export function getAppSettings(): LocalAppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_APP_SETTINGS }

    const parsed = JSON.parse(raw) as Partial<LocalAppSettings>
    return {
      person1Name: parsed.person1Name?.trim() || DEFAULT_APP_SETTINGS.person1Name,
      person2Name: parsed.person2Name?.trim() || DEFAULT_APP_SETTINGS.person2Name,
      pricePerPackage:
        typeof parsed.pricePerPackage === 'number' && parsed.pricePerPackage >= 0
          ? parsed.pricePerPackage
          : DEFAULT_APP_SETTINGS.pricePerPackage,
    }
  } catch {
    return { ...DEFAULT_APP_SETTINGS }
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
