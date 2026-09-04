import type { Socio } from '../../lib/types'

export type ScanState =
  | { status: 'idle' }
  | { status: 'checking'; query: string }
  | { status: 'not-found'; query: string }
  | { status: 'error'; message: string }
  | { status: 'resuelto'; socio: Socio; excepcion: boolean; hora: string }

function horaActual(): string {
  return new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
}

export function nuevoEstadoResuelto(socio: Socio, excepcion: boolean): ScanState {
  return { status: 'resuelto', socio, excepcion, hora: horaActual() }
}

interface ScanResultCardProps {
  state: ScanState
  onOverride: (socio: Socio) => void
  overriding: boolean
}

export function ScanResultCard({ state, onOverride, overriding }: ScanResultCardProps) {
  if (state.status === 'idle') {
    return (
      <p className="py-6 text-center text-sm text-white/50">
        Escaneá el carnet o usá el ingreso manual para validar el acceso.
      </p>
    )
  }

  if (state.status === 'checking') {
    return (
      <div className="rounded-lg border border-white/10 bg-white/5 px-5 py-4 text-center text-white">
        <p className="font-semibold">Consultando {state.query}…</p>
      </div>
    )
  }

  if (state.status === 'not-found') {
    return (
      <div className="rounded-lg border border-wine-border/40 bg-wine-bg/10 px-5 py-4 text-center">
        <p className="text-lg font-bold text-wine-border">Socio no encontrado</p>
        <p className="mt-1 text-sm text-white/60">"{state.query}" no está registrado en el padrón.</p>
      </div>
    )
  }

  if (state.status === 'error') {
    return (
      <div className="rounded-lg border border-wine-border/40 bg-wine-bg/10 px-5 py-4 text-center text-white">
        <p className="font-semibold">{state.message}</p>
      </div>
    )
  }

  const { socio, excepcion, hora } = state
  const permitido = socio.estado_cuota === 'AL_DIA' || excepcion

  return (
    <div
      className={`rounded-lg border px-5 py-4 ${
        permitido ? 'border-ivy-400/50 bg-ivy-500/10' : 'border-wine-border/50 bg-wine-bg/10'
      }`}
    >
      <div className="flex items-center justify-between">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${
            permitido ? 'bg-ivy-500/20 text-ivy-200' : 'bg-wine-bg/20 text-wine-border'
          }`}
        >
          <span className="material-symbols-outlined text-[14px]">
            {permitido ? 'check_circle' : 'error'}
          </span>
          {permitido ? 'ACCESO PERMITIDO' : 'ACCESO DENEGADO'}
        </span>
        <span className="text-sm font-semibold text-white/70">{hora} hs</span>
      </div>

      {excepcion && (
        <span className="mt-2 inline-block rounded-full bg-ochre-bg/20 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-ochre">
          Excepción de supervisor
        </span>
      )}

      <p className="mt-3 font-serif text-lg font-bold text-white">
        {socio.nombre} {socio.apellido}
      </p>
      <p className="text-sm text-white/60">
        Socio N° {socio.numero_socio}
        {socio.categoria ? ` · ${socio.categoria}` : ''}
      </p>

      {!permitido && (
        <div className="mt-3 flex items-center justify-between gap-3 rounded-md border border-white/10 bg-black/20 px-3 py-2.5">
          <span className="text-sm font-medium text-white/80">
            {socio.estado_cuota === 'INACTIVO' ? 'Socio inactivo' : 'Cuota pendiente'}
          </span>
          <button
            type="button"
            onClick={() => onOverride(socio)}
            disabled={overriding}
            className="shrink-0 rounded-md border border-ochre/60 bg-ochre-bg/10 px-3 py-1.5 text-[12px] font-semibold text-ochre transition-colors hover:bg-ochre-bg/20 disabled:opacity-50"
          >
            {overriding ? 'Registrando…' : 'Permitir de todas formas'}
          </button>
        </div>
      )}
    </div>
  )
}
