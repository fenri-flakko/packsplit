import { useEffect, useMemo, useState } from 'react'
import { format } from 'date-fns'
import { Card } from '@/components/ui/Card'
import { useCurrentDate } from '@/hooks/useCurrentDate'
import { useAppSettings } from '@/hooks/useAppSettings'
import { useWorkspace } from '@/hooks/useWorkspace'
import {
  getWeekStart,
  getWeekEnd,
  formatWeekRange,
  formatShortDate,
  formatCurrency,
  getIsoDayOfWeek,
  getWeekDays,
  getDayName,
} from '@/lib/dates'
import { sumRecords, type DailyRecordData, DATA_START_DATE } from '@/lib/calculations'
import { getWeekRecordsRpc } from '@/services/workspace.service'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { addWeeks, subWeeks, isBefore, parseISO } from 'date-fns'

export function WeekPage() {
  const today = useCurrentDate()
  const { person1Name, person2Name, pricePerPackage, workDays } = useAppSettings()
  const { session } = useWorkspace()
  const [weekAnchor, setWeekAnchor] = useState(today)
  const [records, setRecords] = useState<DailyRecordData[]>([])
  const [loading, setLoading] = useState(true)

  const weekStart = getWeekStart(weekAnchor)
  const weekEnd = getWeekEnd(weekAnchor)
  const weekStartKey = format(weekStart, 'yyyy-MM-dd')
  const shareCode = session?.shareCode
  const dataStart = parseISO(DATA_START_DATE)

  useEffect(() => {
    if (!shareCode) return

    let cancelled = false
    setLoading(true)

    getWeekRecordsRpc(shareCode, weekStartKey)
      .then((data) => {
        if (!cancelled) setRecords(data)
      })
      .catch(() => {
        if (!cancelled) setRecords([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [shareCode, weekStartKey])

  const recordsByDate = useMemo(() => {
    const map = new Map<string, DailyRecordData>()
    for (const record of records) map.set(record.recordDate, record)
    return map
  }, [records])

  const activeDays = getWeekDays(weekStart).filter(
    (day) => workDays[getIsoDayOfWeek(day)],
  )

  const summary = sumRecords(records, pricePerPackage)

  const goPrevWeek = () => {
    const prev = subWeeks(weekAnchor, 1)
    if (!isBefore(getWeekEnd(prev), dataStart)) setWeekAnchor(prev)
  }

  const goNextWeek = () => setWeekAnchor(addWeeks(weekAnchor, 1))

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={goPrevWeek}
          className="flex h-10 w-10 items-center justify-center rounded-full text-text-muted hover:bg-surface hover:text-text active:scale-95"
          aria-label="Semana anterior"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <p className="flex-1 text-center text-sm text-text-muted">
          {formatWeekRange(weekStart, weekEnd)}
        </p>
        <button
          onClick={goNextWeek}
          className="flex h-10 w-10 items-center justify-center rounded-full text-text-muted hover:bg-surface hover:text-text active:scale-95"
          aria-label="Semana siguiente"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-2">
        {activeDays.map((day) => {
          const key = format(day, 'yyyy-MM-dd')
          const record = recordsByDate.get(key)
          const packages = record?.packagesCount ?? 0

          return (
            <Card key={key} padding="sm" className="flex items-center justify-between">
              <div>
                <span className="font-medium text-text">{getDayName(day)}</span>
                <span className="ml-2 text-xs text-text-muted">
                  {formatShortDate(day)}
                </span>
              </div>
              <div className="text-right">
                <span className="font-semibold text-text">{packages} pkg</span>
                <span className="ml-2 text-sm text-text-muted">
                  {formatCurrency(packages * pricePerPackage)}
                </span>
              </div>
            </Card>
          )
        })}
      </div>

      <Card padding="lg" className="bg-accent-soft border-accent/20">
        <h3 className="mb-4 text-sm font-semibold text-accent uppercase tracking-wide">
          Resumen semanal
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
            <div className="h-px bg-accent/20" />
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
