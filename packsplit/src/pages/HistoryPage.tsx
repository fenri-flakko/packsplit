import { Card } from '@/components/ui/Card'
import { formatCurrency } from '@/lib/dates'
import { ChevronRight } from 'lucide-react'

const MOCK_HISTORY = [
  {
    label: 'Semana del 24 al 30 de agosto de 2026',
    packages: 310,
    total: 372,
  },
  {
    label: 'Semana del 17 al 23 de agosto de 2026',
    packages: 285,
    total: 342,
  },
  {
    label: 'Semana del 10 al 16 de agosto de 2026',
    packages: 295,
    total: 354,
  },
]

export function HistoryPage() {
  return (
    <div className="space-y-3">
      <p className="text-sm text-text-muted">
        Consulta semanas anteriores
      </p>

      {MOCK_HISTORY.map((week) => (
        <Card
          key={week.label}
          padding="sm"
          className="flex items-center justify-between cursor-pointer transition-colors hover:bg-bg active:scale-[0.99]"
        >
          <div>
            <p className="text-sm font-medium text-text">{week.label}</p>
            <p className="text-xs text-text-muted mt-0.5">
              {week.packages} paquetes · {formatCurrency(week.total)}
            </p>
          </div>
          <ChevronRight className="h-4 w-4 text-text-muted" />
        </Card>
      ))}
    </div>
  )
}
