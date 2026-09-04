import type { Socio } from '../lib/types'

export function SocioAvatar({ socio, className = 'h-16 w-16' }: { socio: Socio; className?: string }) {
  if (socio.foto_url) {
    return (
      <img
        src={socio.foto_url}
        alt={`${socio.nombre} ${socio.apellido}`}
        className={`${className} shrink-0 rounded-full border-2 border-ivy-500 object-cover shadow-sm`}
      />
    )
  }

  const iniciales = `${socio.nombre[0] ?? ''}${socio.apellido[0] ?? ''}`.toUpperCase()

  return (
    <div
      className={`${className} flex shrink-0 items-center justify-center rounded-full border-2 border-ivy-500 bg-ivy-50 font-serif font-bold text-ivy-700 shadow-sm`}
      aria-hidden
    >
      <span className="text-lg">{iniciales}</span>
    </div>
  )
}
