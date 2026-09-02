import { useState } from 'react'
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react'
import { addDays, subDays } from 'date-fns'
import { Card } from '@/components/ui/Card'
import { useCurrentDate } from '@/hooks/useCurrentDate'
import { useAppSettings } from '@/hooks/useAppSettings'
import {
  getDayName,
  formatFullDate,
  isToday,
  formatCurrency,
} from '@/lib/dates'

export function TodayPage() {
  const today = useCurrentDate()
  const [selectedDate, setSelectedDate] = useState(today)
  const [packages, setPackages] = useState(0)
  const { person1Name, person2Name, pricePerPackage } = useAppSettings()

  const isSelectedToday = isToday(selectedDate)
  const totalGenerated = packages * pricePerPackage
  const sharePerPerson = totalGenerated / 2

  const goToPrevious = () => setSelectedDate((d) => subDays(d, 1))
  const goToNext = () => setSelectedDate((d) => addDays(d, 1))
  const goToToday = () => setSelectedDate(today)

  return (
    <div className="space-y-5">
      {/* Navegación de día */}
      <div className="flex items-center justify-between">
        <button
          onClick={goToPrevious}
          className="flex h-10 w-10 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-surface hover:text-text active:scale-95"
          aria-label="Día anterior"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <div className="text-center">
          <h2 className="text-xl font-bold tracking-tight text-text">
            {getDayName(selectedDate)}
          </h2>
          <p className="text-sm text-text-muted">
            {formatFullDate(selectedDate)}
          </p>
        </div>

        <button
          onClick={goToNext}
          className="flex h-10 w-10 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-surface hover:text-text active:scale-95"
          aria-label="Día siguiente"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {!isSelectedToday && (
        <button
          onClick={goToToday}
          className="mx-auto flex items-center gap-1.5 rounded-full bg-accent-soft px-4 py-1.5 text-xs font-medium text-accent transition-colors hover:bg-accent/15 active:scale-95"
        >
          <RotateCcw className="h-3 w-3" />
          Volver a hoy
        </button>
      )}

      {/* Input de paquetes */}
      <Card padding="lg" className="text-center">
        <label className="mb-3 block text-sm font-medium text-text-muted">
          Paquetes repartidos
        </label>
        <input
          type="number"
          inputMode="numeric"
          min={0}
          step={1}
          value={packages || ''}
          onChange={(e) => {
            const val = parseInt(e.target.value, 10)
            setPackages(isNaN(val) || val < 0 ? 0 : val)
          }}
          placeholder="0"
          className="
            w-full bg-transparent text-center text-5xl font-bold
            text-text outline-none placeholder:text-text-muted/30
          "
        />
      </Card>

      {/* Resumen del día */}
      <Card>
        <h3 className="mb-4 text-sm font-semibold text-text-muted uppercase tracking-wide">
          Resumen del día
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-muted">📦 Paquetes</span>
            <span className="font-semibold text-text">{packages}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-muted">💰 Total generado</span>
            <span className="text-lg font-bold text-text">
              {formatCurrency(totalGenerated)}
            </span>
          </div>
        </div>
      </Card>

      {/* Reparto por persona (placeholder) */}
      <Card>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-medium text-text">{person1Name}</span>
            <span className="font-semibold text-text">
              {formatCurrency(sharePerPerson)}
            </span>
          </div>
          <div className="h-px bg-border" />
          <div className="flex items-center justify-between">
            <span className="font-medium text-text">{person2Name}</span>
            <span className="font-semibold text-text">
              {formatCurrency(sharePerPerson)}
            </span>
          </div>
        </div>
      </Card>
    </div>
  )
}
