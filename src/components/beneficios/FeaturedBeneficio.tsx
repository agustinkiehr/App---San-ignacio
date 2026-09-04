import { Link } from 'react-router-dom'
import { RUBRO_ICON, RUBRO_LABEL, type Beneficio } from '../../lib/types'

export function FeaturedBeneficio({ beneficio }: { beneficio: Beneficio }) {
  return (
    <Link
      to={`/beneficios/${beneficio.id}`}
      className="block overflow-hidden rounded-xl bg-white shadow-card transition hover:shadow-lg"
    >
      <div className="relative flex h-32 items-center justify-center bg-ivy-500">
        <span className="material-symbols-outlined text-[64px] text-white/25">
          {RUBRO_ICON[beneficio.rubro]}
        </span>
        <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-cardinal-500 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-sm">
          <span className="material-symbols-outlined text-[14px]">local_fire_department</span>
          {beneficio.descuento}
        </span>
        {beneficio.direccion && (
          <span className="absolute right-3 top-3 max-w-[55%] truncate rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-medium text-ivy-700">
            {beneficio.direccion}
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
