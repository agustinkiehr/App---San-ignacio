import { QRCodeSVG } from 'qrcode.react'
import type { Socio } from '../lib/types'
import { useWakeLock } from '../lib/useWakeLock'
import { SocioAvatar } from './SocioAvatar'
import { StatusBadge } from './StatusBadge'

function formatVencimiento(vencimiento: string | null): string {
  if (!vencimiento) return '—'
  const [year, month] = vencimiento.split('-')
  return `${month}/${year}`
}

export function CarnetCard({ socio }: { socio: Socio }) {
  const { active, toggle, supported } = useWakeLock()
  const enMora = socio.estado_cuota !== 'AL_DIA'

  return (
    <div className="w-full overflow-hidden rounded-lg border border-surface-border bg-white shadow-card">
      <div className="h-1.5 w-full bg-ivy-500" />

      <div className="flex flex-col p-5">
        <div className={`flex items-start gap-3.5 border-b border-gray-100 pb-4 ${enMora ? 'justify-between' : ''}`}>
          <div className="flex min-w-0 items-center gap-3.5">
            <SocioAvatar socio={socio} />
            <div className="flex min-w-0 flex-col">
              <h2 className="truncate font-serif text-xl font-bold leading-tight text-ivy-700">
                {socio.nombre} {socio.apellido}
              </h2>
              {!enMora && (
                <p className="mt-0.5 text-[13px] font-normal text-gray-500">
                  Socio activo{socio.categoria ? ` · ${socio.categoria}` : ''}
                </p>
              )}
            </div>
          </div>
          {enMora && (
            <span className="shrink-0 self-start rounded-full border border-gray-200 bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-600">
              Acceso limitado
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 border-b border-gray-100 py-4">
          <div className="flex flex-col items-center justify-center border-r border-gray-200 pr-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">N° de socio</span>
            <span className="mt-0.5 font-mono text-xl font-bold text-ivy-800">{socio.numero_socio}</span>
          </div>
          <div className="flex flex-col items-center justify-center pl-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Vence</span>
            <span className="mt-0.5 text-xl font-bold text-ivy-800">{formatVencimiento(socio.vencimiento)}</span>
          </div>
        </div>

        <div className="mb-2 mt-4 flex flex-col items-center">
          <StatusBadge estado={socio.estado_cuota} />

          {enMora && (
            <div className="mt-3.5 flex w-full flex-col gap-2 rounded-lg border border-ochre-border bg-ochre-bg p-3">
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined mt-0.5 shrink-0 text-[20px] text-ochre">warning</span>
                <p className="text-[12px] font-medium leading-tight text-ochre">
                  {socio.estado_cuota === 'INACTIVO'
                    ? 'Tu membresía figura inactiva. Acercate a secretaría para regularizar tu situación.'
                    : 'Regularizá tu cuota para recuperar el acceso completo al club.'}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-2 flex flex-col items-center justify-center bg-white p-2">
          <div className="flex items-center justify-center rounded-lg border border-gray-100 bg-white p-3 shadow-sm">
            <QRCodeSVG
              value={socio.numero_socio}
              size={176}
              level="H"
              imageSettings={{ src: '/brand/crest-color.png', height: 34, width: 34, excavate: true }}
            />
          </div>
          <p className="mt-3 px-4 text-center text-[12px] leading-normal text-gray-500">
            Mostrá este código en el ingreso al club y al estacionamiento
          </p>
        </div>

        {supported && (
          <button
            onClick={toggle}
            type="button"
            className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-ivy-500 bg-transparent text-[13px] font-semibold text-ivy-700 shadow-sm transition-colors active:bg-ivy-50"
          >
            <span className="material-symbols-outlined text-[18px]">brightness_6</span>
            {active ? 'Pantalla en alto brillo' : 'Subir brillo de pantalla'}
          </button>
        )}
      </div>
    </div>
  )
}
