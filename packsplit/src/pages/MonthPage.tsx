import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { formatCurrency } from '@/lib/dates'
import { useAppSettings } from '@/hooks/useAppSettings'
import { useWorkspace } from '@/hooks/useWorkspace'
import { getMonthRecordsRpc } from '@/services/workspace.service'
import { sumRecords } from '@/lib/calculations'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

export function MonthPage() {
  const { person1Name, person2Name, pricePerPackage } = useAppSettings()
  const { session } = useWorkspace()
  const [month, setMonth] = useState(8)
  const [year, setYear] = useState(2026)
  const [summary, setSummary] = useState({
    packages: 0,
    total: 0,
    person1: 0,
    person2: 0,
  })
  const [loading, setLoading] = useState(true)

  const prevMonth = () => {
    if (month === 0) {
      setMonth(11)
      setYear((y) => y - 1)
    } else {
      setMonth((m) => m - 1)
    }
  }

  const nextMonth = () => {
    if (month === 11) {
      setMonth(0)
      setYear((y) => y + 1)
    } else {
      setMonth((m) => m + 1)
    }
  }

  useEffect(() => {
    const shareCode = session?.shareCode
    if (!shareCode) return

    let cancelled = false
    setLoading(true)

    getMonthRecordsRpc(shareCode, year, month + 1)
      .then((records) => {
        if (!cancelled) setSummary(sumRecords(records, pricePerPackage))
      })
      .catch(() => {
        if (!cancelled) {
          setSummary({ packages: 0, total: 0, person1: 0, person2: 0 })
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [session?.shareCode, year, month, pricePerPackage])

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <button
          onClick={prevMonth}
          className="flex h-10 w-10 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-surface hover:text-text active:scale-95"
          aria-label="Mes anterior"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <h2 className="text-lg font-bold text-text">
          {MONTHS[month]} {year}
        </h2>

        <button
          onClick={nextMonth}
          className="flex h-10 w-10 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-surface hover:text-text active:scale-95"
          aria-label="Mes siguiente"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <Card padding="lg">
        <h3 className="mb-4 text-sm font-semibold text-text-muted uppercase tracking-wide">
          Resumen mensual
        </h3>
        {loading ? (
          <p className="text-sm text-text-muted">Cargando…</p>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-muted">📦 Total paquetes</span>
              <span className="font-bold text-text">{summary.packages}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-muted">💰 Total generado</span>
              <span className="text-lg font-bold text-text">
                {formatCurrency(summary.total)}
              </span>
            </div>
            <div className="h-px bg-border" />
            <div className="flex items-center justify-between">
              <span className="font-medium text-text">{person1Name}</span>
              <span className="font-semibold text-text">
                {formatCurrency(summary.person1)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium text-text">{person2Name}</span>
              <span className="font-semibold text-text">
                {formatCurrency(summary.person2)}
              </span>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
