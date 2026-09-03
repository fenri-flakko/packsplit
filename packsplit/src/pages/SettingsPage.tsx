import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useWorkspace } from '@/hooks/useWorkspace'
import { useAppSettings } from '@/hooks/useAppSettings'
import {
  formatPriceForInput,
  parsePriceInput,
} from '@/lib/app-settings-storage'
import { useNavigate } from 'react-router-dom'
import { Copy, Link, RefreshCw, LogOut, Save } from 'lucide-react'
import { useState } from 'react'
import { saveSavedSpace } from '@/lib/saved-spaces'

export function SettingsPage() {
  const { session, leaveWorkspace } = useWorkspace()
  const { person1Name, person2Name, pricePerPackage, updateSettings } =
    useAppSettings()
  const navigate = useNavigate()
  const [copied, setCopied] = useState<'code' | 'link' | null>(null)
  const [spaceName, setSpaceName] = useState(shareCodeLabel(session?.shareCode))
  const [spaceSaved, setSpaceSaved] = useState(false)
  const [priceInput, setPriceInput] = useState(() =>
    formatPriceForInput(pricePerPackage),
  )

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

  const handleSaveSpace = () => {
    if (!session) return
    saveSavedSpace({
      workspaceId: session.workspaceId,
      shareCode: session.shareCode,
      name: spaceName.trim() || `Espacio ${session.shareCode}`,
    })
    setSpaceSaved(true)
    setTimeout(() => setSpaceSaved(false), 2000)
  }

  const handlePriceChange = (value: string) => {
    if (!/^[0-9]*[.,]?[0-9]*$/.test(value) && value !== '') return
    setPriceInput(value)
  }

  const handlePriceBlur = () => {
    const parsed = parsePriceInput(priceInput)
    updateSettings({ pricePerPackage: parsed })
    setPriceInput(formatPriceForInput(parsed))
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
        <div className="mt-3">
        <Input
          label="Nombre del espacio"
          value={spaceName}
          onChange={(e) => setSpaceName(e.target.value)}
        />
        <Button
          variant="secondary"
          className="mt-2 w-full text-xs"
          onClick={handleSaveSpace}
        >
          <Save className="h-3.5 w-3.5" />
          {spaceSaved ? 'Espacio guardado' : 'Guardar este espacio'}
        </Button>
        <Button variant="ghost" className="mt-2 w-full text-xs" disabled>
          <RefreshCw className="h-3.5 w-3.5" />
          Regenerar código
        </Button>
        </div>
      </Card>

      {/* Precio por paquete */}
      <Card>
        <h3 className="mb-3 text-sm font-semibold text-text-muted uppercase tracking-wide">
          Precio por paquete
        </h3>
        <div className="flex items-center gap-2">
          <input
            type="text"
            inputMode="decimal"
            value={priceInput}
            onChange={(e) => handlePriceChange(e.target.value)}
            onBlur={handlePriceBlur}
            className="flex-1 rounded-[var(--radius-button)] border border-border bg-bg px-4 py-3 text-text"
          />
          <span className="text-text-muted">€</span>
        </div>
      </Card>

      {/* Personas y reparto */}
      <Card>
        <h3 className="mb-3 text-sm font-semibold text-text-muted uppercase tracking-wide">
          Personas y reparto
        </h3>
        <div className="space-y-3">
          <Input
            label="Persona 1"
            value={person1Name}
            onChange={(e) => updateSettings({ person1Name: e.target.value })}
          />
          <Input
            label="Persona 2"
            value={person2Name}
            onChange={(e) => updateSettings({ person2Name: e.target.value })}
          />
          <p className="text-xs text-text-muted">Reparto equitativo — 50% / 50%</p>
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

function shareCodeLabel(code?: string) {
  return code ? `Espacio ${code}` : 'Mi espacio'
}
