import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useWorkspace } from '@/hooks/useWorkspace'
import { normalizeShareCode } from '@/lib/workspace-storage'

export function JoinPage() {
  const { code } = useParams<{ code: string }>()
  const navigate = useNavigate()
  const { joinByCode } = useWorkspace()

  useEffect(() => {
    if (!code) {
      navigate('/bienvenida', { replace: true })
      return
    }

    const normalized = normalizeShareCode(code)
    joinByCode(normalized).then((success) => {
      navigate(success ? '/' : '/bienvenida', { replace: true })
    })
  }, [code, joinByCode, navigate])

  return (
    <div className="flex min-h-dvh items-center justify-center bg-bg">
      <div className="flex flex-col items-center gap-3">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        <p className="text-sm text-text-muted">Uniéndose al espacio…</p>
      </div>
    </div>
  )
}
