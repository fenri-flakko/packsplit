import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useWorkspace } from '@/hooks/useWorkspace'
import { useNavigate } from 'react-router-dom'
import { Copy, Link, RefreshCw, LogOut } from 'lucide-react'
import { useState } from 'react'

export function SettingsPage() {
  const { session, leaveWorkspace } = useWorkspace()
  const navigate = useNavigate()
  const [copied, setCopied] = useState<'code' | 'link' | null>(null)

  const shareCode = session?.shareCode ?? '—'
  const shareLink = `${window.location.origin}/join/${shareCode}`

  const copyToClipboard = async (text: string, type: 'code' | 'link') => {
    await navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleLeave = () => {
    leaveWorkspace()
    navigate('/bienvenida', { replace: true })
  }

  return (
    <div className="space-y-4">
      {/* Compartir espacio */}
      <Card>
        <h3 className="mb-3 text-sm font-semibold text-text-muted uppercase tracking-wide">
          Compartir espacio
        </h3>
        <div className="mb-4 rounded-[var(--radius-button)] bg-bg p-4 text-center">
          <p className="text-xs text-text-muted mb-1">Código</p>
          <p className="text-2xl font-bold font-mono tracking-widest text-text">
            {shareCode}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            className="flex-1 text-xs"
            onClick={() => copyToClipboard(shareCode, 'code')}
          >
            <Copy className="h-3.5 w-3.5" />
            {copied === 'code' ? '¡Copiado!' : 'Copiar código'}
          </Button>
          <Button
            variant="secondary"
            className="flex-1 text-xs"
            onClick={() => copyToClipboard(shareLink, 'link')}
          >
            <Link className="h-3.5 w-3.5" />
            {copied === 'link' ? '¡Copiado!' : 'Copiar enlace'}
          </Button>
        </div>
        <Button variant="ghost" className="mt-2 w-full text-xs" disabled>
          <RefreshCw className="h-3.5 w-3.5" />
          Regenerar código (Fase 2)
        </Button>
      </Card>

      {/* Precio por paquete */}
      <Card>
        <h3 className="mb-3 text-sm font-semibold text-text-muted uppercase tracking-wide">
          Precio por paquete
        </h3>
        <div className="flex items-center gap-2">
          <input
            type="text"
            defaultValue="1,20"
            disabled
            className="flex-1 rounded-[var(--radius-button)] border border-border bg-bg px-4 py-3 text-text opacity-60"
          />
          <span className="text-text-muted">€</span>
        </div>
      </Card>

      {/* Personas y reparto */}
      <Card>
        <h3 className="mb-3 text-sm font-semibold text-text-muted uppercase tracking-wide">
          Personas y reparto
        </h3>
        <div className="space-y-2 text-sm text-text-muted">
          <p>Persona 1 — 50%</p>
          <p>Persona 2 — 50%</p>
          <p className="text-xs pt-2">Configuración completa en Fase 3</p>
        </div>
      </Card>

      {/* Días de trabajo */}
      <Card>
        <h3 className="mb-3 text-sm font-semibold text-text-muted uppercase tracking-wide">
          Días de trabajo
        </h3>
        <div className="space-y-2 text-sm text-text-muted">
          <p>Lun – Sáb: Activos</p>
          <p>Domingo: Desactivado</p>
          <p className="text-xs pt-2">Configuración completa en Fase 3</p>
        </div>
      </Card>

      {/* Salir del espacio */}
      <Button variant="danger" fullWidth onClick={handleLeave}>
        <LogOut className="h-4 w-4" />
        Salir del espacio
      </Button>
    </div>
  )
}
