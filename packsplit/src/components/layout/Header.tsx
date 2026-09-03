import { Settings, ChevronLeft, Home } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface HeaderProps {
  title?: string
  showSettings?: boolean
  showBack?: boolean
  showHome?: boolean
  onHome?: () => void
}

export function Header({
  title = 'PackSplit',
  showSettings = true,
  showBack = false,
  showHome = false,
  onHome,
}: HeaderProps) {
  const navigate = useNavigate()

  return (
    <header className="safe-top sticky top-0 z-40 border-b border-border/60 bg-surface/80 backdrop-blur-lg">
      <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-4">
        <div className="flex min-w-16 items-center">
          {showBack && (
            <button
              onClick={() => navigate('/')}
              className="
                flex h-9 w-9 items-center justify-center rounded-full
                text-text-muted transition-colors duration-150
                hover:bg-bg hover:text-text active:scale-95
              "
              aria-label="Volver al día actual"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}
        </div>
        <h1 className="text-lg font-semibold tracking-tight text-text">
          {title}
        </h1>
        <div className="flex min-w-16 items-center justify-end">
          {showHome && (
            <button
              onClick={() => {
                onHome?.()
                navigate('/bienvenida')
              }}
              className="
                flex h-9 w-9 items-center justify-center rounded-full
                text-text-muted transition-colors duration-150
                hover:bg-bg hover:text-text active:scale-95
              "
              aria-label="Ir a inicio"
            >
              <Home className="h-5 w-5" />
            </button>
          )}
          {showSettings && (
            <button
              onClick={() => navigate('/ajustes')}
              className="
                flex h-9 w-9 items-center justify-center rounded-full
                text-text-muted transition-colors duration-150
                hover:bg-bg hover:text-text active:scale-95
              "
              aria-label="Ajustes"
            >
              <Settings className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
