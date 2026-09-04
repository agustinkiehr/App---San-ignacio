import type { EstadoCuota } from '../lib/types'
import { ESTADO_LABEL } from '../lib/types'

const STYLES: Record<EstadoCuota, string> = {
  AL_DIA: 'bg-[#EBF3E9] border border-[#A7D1A9]/60 text-ivy-700',
  PENDIENTE: 'bg-ochre-bg border border-ochre-border text-ochre',
  INACTIVO: 'bg-wine-bg border border-wine-border text-wine',
}

const DOT_STYLES: Record<EstadoCuota, string> = {
  AL_DIA: 'bg-ivy-500',
  PENDIENTE: 'bg-ochre',
  INACTIVO: 'bg-wine',
}

export function StatusBadge({ estado, className = '' }: { estado: EstadoCuota; className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${STYLES[estado]} ${className}`}
    >
      <span className={`h-2 w-2 rounded-full ${DOT_STYLES[estado]}`} />
      {ESTADO_LABEL[estado]}
    </span>
  )
}
