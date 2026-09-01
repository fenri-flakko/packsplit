import { NavLink } from 'react-router-dom'
import { Calendar, CalendarDays, History, BarChart3 } from 'lucide-react'

const navItems = [
  { to: '/', label: 'Hoy', icon: Calendar },
  { to: '/semana', label: 'Semana', icon: CalendarDays },
  { to: '/historial', label: 'Hist', icon: History },
  { to: '/mes', label: 'Mes', icon: BarChart3 },
] as const

export function BottomNav() {
  return (
    <nav className="safe-bottom fixed bottom-0 left-0 right-0 z-40 border-t border-border/60 bg-surface/90 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-lg items-stretch px-2">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `
              flex flex-1 flex-col items-center justify-center gap-0.5
              text-xs font-medium transition-colors duration-150
              ${isActive ? 'text-accent' : 'text-text-muted hover:text-text'}
            `}
          >
            {({ isActive }) => (
              <>
                <div
                  className={`
                    flex h-8 w-8 items-center justify-center rounded-xl
                    transition-all duration-150
                    ${isActive ? 'bg-accent-soft' : ''}
                  `}
                >
                  <Icon className="h-5 w-5" strokeWidth={isActive ? 2.25 : 1.75} />
                </div>
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
