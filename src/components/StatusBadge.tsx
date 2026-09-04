import type { EstadoCuota } from '../lib/types'
import { ESTADO_LABEL } from '../lib/types'

const STYLES: Record<EstadoCuota, string> = {
  AL_DIA: 'bg-ivy-500 text-white',
  PENDIENTE: 'bg-status-pendiente text-white',
  INACTIVO: 'bg-cardinal-500 text-white',
}

export function StatusBadge({ estado, className = '' }: { estado: EstadoCuota; className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold tracking-wide ${STYLES[estado]} ${className}`}
    >
      <span className="h-2 w-2 rounded-full bg-white/90" />
      {ESTADO_LABEL[estado]}
    </span>
  )
}
