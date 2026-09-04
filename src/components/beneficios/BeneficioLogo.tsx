import { RUBRO_ICON, type Beneficio } from '../../lib/types'

export function BeneficioLogo({
  beneficio,
  className = 'h-10 w-10',
  iconSize = 'text-[22px]',
}: {
  beneficio: Beneficio
  className?: string
  iconSize?: string
}) {
  if (beneficio.logo_url) {
    return (
      <div className={`${className} flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white p-1 shadow-sm`}>
        <img src={beneficio.logo_url} alt="" className="h-full w-full object-contain" />
      </div>
    )
  }

  return (
    <div className={`${className} flex shrink-0 items-center justify-center rounded-xl bg-ivy-50 text-ivy-700`}>
      <span className={`material-symbols-outlined ${iconSize}`}>{RUBRO_ICON[beneficio.rubro]}</span>
    </div>
  )
}
