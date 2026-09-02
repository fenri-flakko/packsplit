import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react'
import {
  type LocalAppSettings,
  getAppSettings,
  saveAppSettings,
} from '@/lib/app-settings-storage'

interface AppSettingsContextValue extends LocalAppSettings {
  updateSettings: (partial: Partial<LocalAppSettings>) => void
}

const AppSettingsContext = createContext<AppSettingsContextValue | null>(null)

export function AppSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<LocalAppSettings>(getAppSettings)

  useEffect(() => {
    saveAppSettings(settings)
  }, [settings])

  const updateSettings = useCallback((partial: Partial<LocalAppSettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }))
  }, [])

  return (
    <AppSettingsContext.Provider value={{ ...settings, updateSettings }}>
      {children}
    </AppSettingsContext.Provider>
  )
}

export function useAppSettings() {
  const ctx = useContext(AppSettingsContext)
  if (!ctx) {
    throw new Error('useAppSettings debe usarse dentro de AppSettingsProvider')
  }
  return ctx
}
