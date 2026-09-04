import { Link } from 'react-router-dom'
import type { Beneficio } from '../../lib/types'
import { BeneficioLogo } from './BeneficioLogo'

interface BeneficioCardProps {
  beneficio: Beneficio
  esFavorito: boolean
  onToggleFavorito: () => void
  distanciaTexto?: string
}

export function BeneficioCard({ beneficio, esFavorito, onToggleFavorito, distanciaTexto }: BeneficioCardProps) {
  return (
    <article className="flex flex-col gap-2 rounded-xl bg-white p-4 shadow-card">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-3">
          <BeneficioLogo beneficio={beneficio} />
          <div className="flex min-w-0 flex-col">
            <h3 className="truncate font-serif text-base font-bold text-ivy-700">{beneficio.nombre_comercio}</h3>
            {beneficio.subtitulo && <span className="text-xs text-gray-500">{beneficio.subtitulo}</span>}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              onToggleFavorito()
            }}
            aria-label={esFavorito ? 'Quitar de favoritos' : 'Agregar a favoritos'}
            aria-pressed={esFavorito}
            className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors ${
              esFavorito ? 'text-cardinal-500' : 'text-gray-300 hover:text-gray-400'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">{esFavorito ? 'favorite' : 'favorite_border'}</span>
          </button>
          <span className="rounded-full bg-cardinal-500 px-2.5 py-0.5 text-xs font-bold tracking-wide text-white shadow-sm">
            {beneficio.descuento}
          </span>
        </div>
      </div>

      <p className="text-sm text-gray-600">{beneficio.descripcion}</p>

      <div className="flex items-center justify-between pt-1">
        <span className="flex min-w-0 items-center gap-1 truncate text-xs text-gray-400">
          {distanciaTexto && (
            <span className="mr-1 shrink-0 rounded-full bg-ivy-50 px-1.5 py-0.5 font-semibold text-ivy-700">
              {distanciaTexto}
            </span>
          )}
          {beneficio.direccion && (
            <>
              <span className="material-symbols-outlined shrink-0 text-[15px]">pin_drop</span>
              <span className="truncate">{beneficio.direccion}</span>
            </>
          )}
        </span>
        <Link
          to={`/beneficios/${beneficio.id}`}
          className="flex shrink-0 items-center gap-0.5 text-sm font-semibold text-ivy-700 hover:underline"
        >
          Ver más
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        </Link>
      </div>
    </article>
  )
}
