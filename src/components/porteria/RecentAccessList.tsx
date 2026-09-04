import type { RegistroAccesoConSocio } from '../../lib/types'

function formatHora(fechaHora: string): string {
  return new Date(fechaHora).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
}

export function RecentAccessList({ registros }: { registros: RegistroAccesoConSocio[] }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wider text-white/70">Últimos ingresos</h3>
        <span className="flex items-center gap-1 text-[11px] font-semibold text-ivy-300">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ivy-300" />
          Registro en vivo
        </span>
      </div>

      {registros.length === 0 ? (
        <p className="py-2 text-sm text-white/40">Todavía no hay accesos registrados hoy.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-white/10">
          {registros.map((r) => (
            <li key={r.id} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">
                  {r.socio ? `${r.socio.nombre} ${r.socio.apellido}` : 'Socio eliminado'}
                </p>
                <p className="truncate text-xs text-white/50">
                  {r.socio ? `Socio N° ${r.socio.numero_socio}${r.socio.categoria ? ` · ${r.socio.categoria}` : ''}` : ''}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <span className="text-xs font-semibold text-white/60">{formatHora(r.fecha_hora)}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                    r.resultado === 'PERMITIDO' ? 'bg-ivy-500/20 text-ivy-200' : 'bg-wine-bg/20 text-wine-border'
                  }`}
                >
                  {r.excepcion ? 'Excepción' : r.resultado === 'PERMITIDO' ? 'Permitido' : 'Denegado'}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
