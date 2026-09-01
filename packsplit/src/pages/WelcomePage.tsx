import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Package, Users } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useWorkspace } from '@/hooks/useWorkspace'
import { normalizeShareCode } from '@/lib/workspace-storage'

export function WelcomePage() {
  const navigate = useNavigate()
  const { createWorkspace, joinByCode } = useWorkspace()
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState<'create' | 'join' | null>(null)

  const handleCreate = async () => {
    setLoading('create')
    setError('')
    try {
      await createWorkspace()
      navigate('/', { replace: true })
    } catch {
      setError('No se pudo crear el espacio. Comprueba la conexión con Supabase.')
    } finally {
      setLoading(null)
    }
  }

  const handleJoin = async () => {
    const normalized = normalizeShareCode(code)
    if (normalized.length < 6) {
      setError('Introduce un código válido')
      return
    }

    setLoading('join')
    setError('')
    try {
      const success = await joinByCode(normalized)
      if (success) {
        navigate('/', { replace: true })
      } else {
        setError('Código no encontrado')
      }
    } catch {
      setError('Error al conectar. Comprueba la conexión con Supabase.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-bg px-6">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-3">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-accent shadow-lg shadow-accent/25">
            <Package className="h-8 w-8 text-white" strokeWidth={1.75} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-text">
            PackSplit
          </h1>
          <p className="text-sm text-text-muted leading-relaxed">
            Gestiona tu reparto diario de paquetes de forma sencilla
          </p>
        </div>

        <div className="space-y-3">
          <Button
            fullWidth
            onClick={handleCreate}
            loading={loading === 'create'}
          >
            <Users className="h-4 w-4" />
            Crear nuevo espacio
          </Button>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-bg px-3 text-xs text-text-muted">
                o unirse a uno existente
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <Input
              placeholder="Código (ej: PK7X4M2N)"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase())
                setError('')
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
              className="text-center font-mono tracking-widest uppercase"
              maxLength={8}
            />
            {error && (
              <p className="text-center text-xs text-danger">{error}</p>
            )}
            <Button
              variant="secondary"
              fullWidth
              onClick={handleJoin}
              loading={loading === 'join'}
              disabled={!code.trim()}
            >
              Unirse con código
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
