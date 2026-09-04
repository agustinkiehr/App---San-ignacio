import { QRCodeSVG } from 'qrcode.react'
import type { Socio } from '../lib/types'
import { FsrCrest } from './FsrCrest'

export function CarnetCard({ socio }: { socio: Socio }) {
  const apellidoNombre = `${socio.apellido.toUpperCase()},${socio.nombre.toUpperCase()}`

  return (
    <div className="mx-auto w-full max-w-sm overflow-hidden rounded-2xl bg-ivy-500 text-cream shadow-card">
      <div className="flex flex-col items-center px-6 pt-8">
        <FsrCrest className="h-24 w-auto" color="#F5F1E8" />
        <h1 className="mt-3 text-center text-2xl font-bold leading-tight">San Ignacio Rugby</h1>
        <div className="mt-3 h-px w-full bg-cream/60" />
      </div>

      <div className="space-y-1.5 px-6 pb-6 pt-5 font-sans">
        <p className="font-mono text-lg font-bold tracking-wide">N° {socio.numero_socio}</p>
        <p className="text-lg font-bold tracking-wide">{apellidoNombre}</p>
        <p className="text-sm font-bold uppercase tracking-widest text-cream/90">
          {socio.categoria?.trim() || 'SOCIO'}
        </p>
      </div>

      <div className="bg-cream p-4">
        <div className="mx-auto flex aspect-square w-full max-w-[280px] items-center justify-center rounded-lg bg-white p-3">
          <QRCodeSVG value={socio.numero_socio} size={256} level="M" className="h-full w-full" />
        </div>
      </div>
    </div>
  )
}
