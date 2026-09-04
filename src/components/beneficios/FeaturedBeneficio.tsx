import { Link } from 'react-router-dom'
import { RUBRO_ICON, RUBRO_LABEL, type Beneficio } from '../../lib/types'

interface FeaturedBeneficioProps {
  beneficio: Beneficio
  esFavorito: boolean
  onToggleFavorito: () => void
  distanciaTexto?: string
}

export function FeaturedBeneficio({ beneficio, esFavorito, onToggleFavorito, distanciaTexto }: FeaturedBeneficioProps) {
  return (
    <Link
      to={`/beneficios/${beneficio.id}`}
      className="block overflow-hidden rounded-xl bg-white shadow-card transition hover:shadow-lg"
    >
      <div className="relative flex h-32 items-center justify-center bg-ivy-500">
        {beneficio.logo_url ? (
          <img src={beneficio.logo_url} alt="" className="h-16 w-16 object-contain opacity-90" />
        ) : (
          <span className="material-symbols-outlined text-[64px] text-white/25">
            {RUBRO_ICON[beneficio.rubro]}
          </span>
        )}
        <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-cardinal-500 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-sm">
          <span className="material-symbols-outlined text-[14px]">local_fire_department</span>
          {beneficio.descuento}
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            onToggleFavorito()
          }}
          aria-label={esFavorito ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          aria-pressed={esFavorito}
          className={`absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 shadow-sm transition-colors ${
            esFavorito ? 'text-cardinal-500' : 'text-gray-400 hover:text-gray-500'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">{esFavorito ? 'favorite' : 'favorite_border'}</span>
        </button>
        {(distanciaTexto || beneficio.direccion) && (
          <span className="absolute bottom-[3.75rem] right-3 max-w-[65%] truncate rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-medium text-ivy-700">
            {distanciaTexto ?? beneficio.direccion}
          </span>
        )}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-4 pb-2.5 pt-6">
          <span className="block text-[10px] font-bold uppercase tracking-widest text-cream/80">
            {RUBRO_LABEL[beneficio.rubro]}
          </span>
          <h2 className="font-serif text-lg font-bold leading-tight text-white">{beneficio.nombre_comercio}</h2>
        </div>
      </div>
      <p className="px-4 py-3 text-sm text-gray-600">{beneficio.descripcion}</p>
    </Link>
  )
}
