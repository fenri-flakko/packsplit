import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react'
import { addDays, format, isBefore, parseISO, subDays } from 'date-fns'
import { Card } from '@/components/ui/Card'
import { useCurrentDate } from '@/hooks/useCurrentDate'
import { useAppSettings } from '@/hooks/useAppSettings'
import { useWorkspace } from '@/hooks/useWorkspace'
import {
  getDayName,
  formatFullDate,
  isToday,
  formatCurrency,
  getIsoDayOfWeek,
} from '@/lib/dates'
import { calcDayShares, DATA_START_DATE } from '@/lib/calculations'
import {
  getDailyRecordRpc,
  upsertDailyRecordRpc,
} from '@/services/workspace.service'

function findActiveDate(
  from: Date,
  direction: 1 | -1,
  workDays: Record<number, boolean>,
  maxSteps = 14,
): Date {
  let current = from
  for (let i = 0; i < maxSteps; i += 1) {
    current = direction === 1 ? addDays(current, 1) : subDays(current, 1)
    if (workDays[getIsoDayOfWeek(current)]) return current
  }
  return from
}

export function TodayPage() {
  const today = useCurrentDate()
  const { person1Name, person2Name, pricePerPackage, workDays } = useAppSettings()
  const { session } = useWorkspace()

  const initialDate = workDays[getIsoDayOfWeek(today)]
    ? today
    : findActiveDate(today, -1, workDays)

  const [selectedDate, setSelectedDate] = useState(initialDate)
  const [packages, setPackages] = useState(0)
  const [person1Worked, setPerson1Worked] = useState(true)
  const [person2Worked, setPerson2Worked] = useState(true)
  const [loaded, setLoaded] = useState(false)

  const isSelectedToday = isToday(selectedDate)
  const dateKey = format(selectedDate, 'yyyy-MM-dd')
  const shareCode = session?.shareCode
  const isActiveDay = workDays[getIsoDayOfWeek(selectedDate)] ?? false
  const shares = calcDayShares(
    packages,
    pricePerPackage,
    person1Worked,
    person2Worked,
  )
  const dataStart = parseISO(DATA_START_DATE)

  useEffect(() => {
    if (!workDays[getIsoDayOfWeek(selectedDate)]) {
      setSelectedDate(findActiveDate(selectedDate, -1, workDays))
    }
  }, [workDays, selectedDate])

  useEffect(() => {
    if (!shareCode || !isActiveDay) return

    let cancelled = false
    setLoaded(false)

    getDailyRecordRpc(shareCode, dateKey)
      .then((record) => {
        if (cancelled) return
        setPackages(record.packagesCount)
        setPerson1Worked(record.person1Worked)
        setPerson2Worked(record.person2Worked)
      })
      .catch(() => {
        if (cancelled) return
        setPackages(0)
        setPerson1Worked(true)
        setPerson2Worked(true)
      })
      .finally(() => {
        if (!cancelled) setLoaded(true)
      })

    return () => {
      cancelled = true
    }
  }, [shareCode, dateKey, isActiveDay])

  useEffect(() => {
    if (!loaded || !shareCode || !isActiveDay) return

    const timeout = setTimeout(() => {
      upsertDailyRecordRpc(
        shareCode,
        dateKey,
        packages,
        person1Worked,
        person2Worked,
      ).catch(() => undefined)
    }, 500)

    return () => clearTimeout(timeout)
  }, [
    packages,
    person1Worked,
    person2Worked,
    loaded,
    shareCode,
    dateKey,
    isActiveDay,
  ])

  const goToPrevious = () => {
    const next = findActiveDate(selectedDate, -1, workDays)
    if (!isBefore(next, dataStart)) setSelectedDate(next)
  }

  const goToNext = () => setSelectedDate(findActiveDate(selectedDate, 1, workDays))
  const goToToday = () => {
    if (workDays[getIsoDayOfWeek(today)]) setSelectedDate(today)
    else setSelectedDate(findActiveDate(today, -1, workDays))
  }

  return (
    <div className="space-y-5">
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

      {!isActiveDay ? (
        <Card padding="lg" className="text-center">
          <p className="text-sm text-text-muted">
            Este día está desactivado. Actívalo en Ajustes si quieres registrar paquetes.
          </p>
        </Card>
      ) : (
        <>
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
                  {formatCurrency(shares.total)}
                </span>
              </div>
            </div>
          </Card>

          <Card>
            <div className="space-y-3">
              <PersonAttendanceRow
                name={person1Name}
                worked={person1Worked}
                amount={shares.person1}
                onToggle={() => setPerson1Worked((v) => !v)}
              />
              <div className="h-px bg-border" />
              <PersonAttendanceRow
                name={person2Name}
                worked={person2Worked}
                amount={shares.person2}
                onToggle={() => setPerson2Worked((v) => !v)}
              />
            </div>
          </Card>
        </>
      )}
    </div>
  )
}

function PersonAttendanceRow({
  name,
  worked,
  amount,
  onToggle,
}: {
  name: string
  worked: boolean
  amount: number
  onToggle: () => void
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-text">{name}</p>
        <button
          type="button"
          onClick={onToggle}
          className={`
            mt-1 rounded-full px-3 py-1 text-xs font-medium transition-colors
            ${
              worked
                ? 'bg-success/15 text-success'
                : 'bg-border/60 text-text-muted'
            }
          `}
        >
          {worked ? 'Ha ido' : 'No ha ido'}
        </button>
      </div>
      <span className="shrink-0 font-semibold text-text">
        {formatCurrency(amount)}
      </span>
    </div>
  )
}
