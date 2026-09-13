import { useEffect, useState } from 'react'
import { parseISO } from 'date-fns'
import { Card } from '@/components/ui/Card'
import { formatCurrency, formatWeekRange } from '@/lib/dates'
import { useAppSettings } from '@/hooks/useAppSettings'
import { useWorkspace } from '@/hooks/useWorkspace'
import { getWeeksHistoryRpc, getWeekRecordsRpc } from '@/services/workspace.service'
import { sumRecords } from '@/lib/calculations'

interface HistoryItem {
  weekStart: string
  weekEnd: string
  packages: number
  total: number
  person1: number
  person2: number
}

export function HistoryPage() {
  const { session } = useWorkspace()
  const { person1Name, person2Name, pricePerPackage } = useAppSettings()
  const [items, setItems] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    const shareCode = session?.shareCode
    if (!shareCode) return

    let cancelled = false
    setLoading(true)

    getWeeksHistoryRpc(shareCode)
      .then(async (weeks) => {
        const detailed = await Promise.all(
          weeks.map(async (week) => {
            const records = await getWeekRecordsRpc(shareCode, week.weekStart)
            const summary = sumRecords(records, pricePerPackage)
            return {
              weekStart: week.weekStart,
              weekEnd: week.weekEnd,
              packages: summary.packages,
              total: summary.total,
              person1: summary.person1,
              person2: summary.person2,
            }
          }),
        )
        if (!cancelled) setItems(detailed)
      })
      .catch(() => {
        if (!cancelled) setItems([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [session?.shareCode, pricePerPackage])

  return (
    <div className="space-y-3">
      <p className="text-sm text-text-muted">
        Semanas con datos reales desde el 31 de agosto de 2026
      </p>

      {loading && <p className="text-sm text-text-muted">Cargando…</p>}

      {!loading && items.length === 0 && (
        <Card padding="md">
          <p className="text-sm text-text-muted">
            Todavía no hay semanas guardadas.
          </p>
        </Card>
      )}

      {items.map((week) => {
        const open = expanded === week.weekStart
        return (
          <Card
            key={week.weekStart}
            padding="sm"
            className="cursor-pointer transition-colors hover:bg-bg active:scale-[0.99]"
            onClick={() =>
              setExpanded(open ? null : week.weekStart)
            }
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text">
                  {formatWeekRange(parseISO(week.weekStart), parseISO(week.weekEnd))}
                </p>
                <p className="mt-0.5 text-xs text-text-muted">
                  {week.packages} paquetes · {formatCurrency(week.total)}
                </p>
              </div>
            </div>
            {open && (
              <div className="mt-3 space-y-2 border-t border-border pt-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-muted">{person1Name}</span>
                  <span className="font-medium text-text">
                    {formatCurrency(week.person1)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">{person2Name}</span>
                  <span className="font-medium text-text">
                    {formatCurrency(week.person2)}
                  </span>
                </div>
              </div>
            )}
          </Card>
        )
      })}
    </div>
  )
}
