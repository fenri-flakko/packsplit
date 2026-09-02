import { Card } from '@/components/ui/Card'
import { useCurrentDate } from '@/hooks/useCurrentDate'
import { useAppSettings } from '@/hooks/useAppSettings'
import {
  getWeekStart,
  getWeekEnd,
  formatWeekRange,
  formatShortDate,
  formatCurrency,
} from '@/lib/dates'
import { DAY_NAMES } from '@/types'

const MOCK_PACKAGES = [50, 60, 40, 50, 70, 60, 0]

export function WeekPage() {
  const today = useCurrentDate()
  const { person1Name, person2Name, pricePerPackage } = useAppSettings()
  const weekStart = getWeekStart(today)
  const weekEnd = getWeekEnd(today)

  const activeDays = DAY_NAMES.slice(0, 6)
  const totalPackages = MOCK_PACKAGES.slice(0, 6).reduce((a, b) => a + b, 0)
  const totalGenerated = totalPackages * pricePerPackage

  return (
    <div className="space-y-5">
      <div className="text-center">
        <p className="text-sm text-text-muted">
          {formatWeekRange(weekStart, weekEnd)}
        </p>
      </div>

      <div className="space-y-2">
        {activeDays.map((day, i) => (
          <Card key={day} padding="sm" className="flex items-center justify-between">
            <div>
              <span className="font-medium text-text">{day}</span>
              <span className="ml-2 text-xs text-text-muted">
                {formatShortDate(new Date(weekStart.getTime() + i * 86400000))}
              </span>
            </div>
            <div className="text-right">
              <span className="font-semibold text-text">
                {MOCK_PACKAGES[i]} pkg
              </span>
              <span className="ml-2 text-sm text-text-muted">
                {formatCurrency(MOCK_PACKAGES[i] * pricePerPackage)}
              </span>
            </div>
          </Card>
        ))}
      </div>

      <Card padding="lg" className="bg-accent-soft border-accent/20">
        <h3 className="mb-4 text-sm font-semibold text-accent uppercase tracking-wide">
          Resumen semanal
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-muted">📦 Total paquetes</span>
            <span className="font-bold text-text">{totalPackages}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-muted">💰 Total generado</span>
            <span className="text-lg font-bold text-text">
              {formatCurrency(totalGenerated)}
            </span>
          </div>
          <div className="h-px bg-accent/20" />
          <div className="flex items-center justify-between">
            <span className="font-medium text-text">{person1Name}</span>
            <span className="font-semibold text-text">
              {formatCurrency(totalGenerated / 2)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium text-text">{person2Name}</span>
            <span className="font-semibold text-text">
              {formatCurrency(totalGenerated / 2)}
            </span>
          </div>
        </div>
      </Card>
    </div>
  )
}
