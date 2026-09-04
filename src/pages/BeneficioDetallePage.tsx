import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { BeneficioLogo } from '../components/beneficios/BeneficioLogo'
import { fetchBeneficioById, mapaUrl, whatsappUrl } from '../lib/beneficios'
import { useFavoritos } from '../lib/favoritos'
import { RUBRO_ICON, RUBRO_LABEL, type Beneficio } from '../lib/types'

function compartirBeneficio(beneficio: Beneficio) {
  const texto = `${beneficio.nombre_comercio} — ${beneficio.descuento}\nBeneficio para socios de San Ignacio Rugby Club.\n${window.location.href}`
  if (navigator.share) {
    navigator.share({ title: beneficio.nombre_comercio, text: texto, url: window.location.href }).catch(() => {})
  } else {
    window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, '_blank', 'noreferrer')
  }
}

export default function BeneficioDetallePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [beneficio, setBeneficio] = useState<Beneficio | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const { esFavorito, toggle } = useFavoritos()

  useEffect(() => {
    if (!id) return
    let cancelado = false
    setLoading(true)
    fetchBeneficioById(id)
      .then((data) => {
        if (!cancelado) setBeneficio(data)
      })
      .catch(() => {
        if (!cancelado) setError(true)
      })
      .finally(() => {
        if (!cancelado) setLoading(false)
      })
    return () => {
      cancelado = true
    }
  }, [id])

  if (loading) {
    return <div className="min-h-screen bg-surface-chalk" />
  }

  if (error || !beneficio) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-surface-chalk px-6 text-center">
        <p className="text-sm font-medium text-wine">No pudimos encontrar este beneficio.</p>
        <Link to="/beneficios" className="text-sm font-semibold text-ivy-700 hover:underline">
          ← Volver a Beneficios
        </Link>
      </div>
    )
  }

  const vigente = !beneficio.vigencia_hasta || new Date(beneficio.vigencia_hasta) >= new Date()
  const tel = whatsappUrl(beneficio)
  const maps = mapaUrl(beneficio)
  const favorito = esFavorito(beneficio.id)

  return (
    <div className="min-h-screen bg-surface-chalk pb-28">
      <div className="relative flex h-56 items-center justify-center overflow-hidden bg-ivy-500">
        <span className="material-symbols-outlined text-[120px] text-white/15">{RUBRO_ICON[beneficio.rubro]}</span>
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Volver al listado de beneficios"
          className="absolute left-4 top-[max(1rem,env(safe-area-inset-top))] flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-md transition-all hover:bg-black/60"
        >
          <span className="material-symbols-outlined text-2xl">arrow_back</span>
        </button>
        <div className="absolute right-4 top-[max(1rem,env(safe-area-inset-top))] flex items-center gap-2">
          <button
            type="button"
            onClick={() => compartirBeneficio(beneficio)}
            aria-label="Compartir este beneficio"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-md transition-all hover:bg-black/60"
          >
            <span className="material-symbols-outlined text-xl">share</span>
          </button>
          <button
            type="button"
            onClick={() => toggle(beneficio.id)}
            aria-label={favorito ? 'Quitar de favoritos' : 'Agregar a favoritos'}
            aria-pressed={favorito}
            className={`flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/40 backdrop-blur-md transition-all hover:bg-black/60 ${
              favorito ? 'text-cardinal-400' : 'text-white'
            }`}
          >
            <span className="material-symbols-outlined text-xl">{favorito ? 'favorite' : 'favorite_border'}</span>
          </button>
        </div>
        <span className="absolute bottom-4 left-5 flex items-center gap-1.5 rounded-full bg-ivy-900/70 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-white shadow-md backdrop-blur-sm">
          <span className="material-symbols-outlined text-xs">{RUBRO_ICON[beneficio.rubro]}</span>
          {RUBRO_LABEL[beneficio.rubro]}
        </span>
      </div>

      <div className="mx-auto flex max-w-[480px] flex-col gap-6 px-5 pt-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-1 items-start gap-3.5">
            <BeneficioLogo beneficio={beneficio} className="h-14 w-14 rounded-2xl border border-ivy-500/20 shadow-sm" iconSize="text-3xl" />
            <div className="min-w-0 flex-1 pt-0.5">
              <h1 className="font-serif text-[22px] font-bold leading-tight tracking-tight text-ivy-700">
                {beneficio.nombre_comercio}
              </h1>
              {beneficio.direccion && (
                <div className="mt-1.5 flex items-center gap-1.5 text-xs text-gray-600">
                  <span className="material-symbols-outlined shrink-0 text-[17px] text-cardinal-500">location_on</span>
                  <span className="truncate font-medium">{beneficio.direccion}</span>
                </div>
              )}
            </div>
          </div>
          <span className="shrink-0 rounded-lg bg-cardinal-500 px-3 py-1.5 text-xs font-bold tracking-wide text-white shadow-sm">
            {beneficio.descuento}
          </span>
        </div>

        <hr className="border-t border-gray-100" />

        <Section icon="touch_app" title="Cómo lo uso">
          <div className="flex flex-col gap-3.5 rounded-2xl border border-gray-100 bg-white p-4">
            <Paso n={1} texto="Mostrá tu carnet digital en el local desde la aplicación." />
            <div className="ml-3 w-[calc(100%-1.5rem)] border-t border-dashed border-gray-200" />
            <Paso n={2} texto="Pedí el descuento antes de pedir la cuenta o pagar." />
          </div>
        </Section>

        {beneficio.condiciones.length > 0 && (
          <>
            <hr className="border-t border-gray-100" />
            <Section icon="verified" title="Condiciones">
              <ul className="flex flex-col gap-2.5 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                {beneficio.condiciones.map((c, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-[13.5px] leading-snug text-gray-700">
                    <span className="material-symbols-outlined mt-0.5 shrink-0 text-base text-ivy-700">check_circle</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </Section>
          </>
        )}

        {beneficio.vigencia_hasta && (
          <>
            <hr className="border-t border-gray-100" />
            <Section icon="calendar_today" title="Vigencia">
              <div className="flex items-center justify-between rounded-xl border border-ivy-500/15 bg-ivy-50/60 p-3.5">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-xl text-ivy-700">event_available</span>
                  <span className="text-sm font-semibold text-gray-800">
                    Hasta el {new Date(beneficio.vigencia_hasta).toLocaleDateString('es-AR')}
                  </span>
                </div>
                <span
                  className={`rounded-md border px-2 py-1 text-[11px] font-bold uppercase tracking-wider ${
                    vigente ? 'border-ivy-500/20 bg-white text-ivy-700' : 'border-wine-border bg-wine-bg text-wine'
                  }`}
                >
                  {vigente ? 'Convenio activo' : 'Vencido'}
                </span>
              </div>
            </Section>
          </>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-gray-200 bg-white/95 px-5 pb-safe pt-3 shadow-[0_-8px_20px_rgba(0,0,0,0.06)] backdrop-blur-md">
        <div className="mx-auto flex max-w-[480px] items-center gap-3 pb-4">
          <Link
            to="/carnet"
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-ivy-500 text-sm font-semibold text-white shadow-md transition-all hover:bg-ivy-600 active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-xl">badge</span>
            Mostrar mi carnet
          </Link>
          <div className="flex shrink-0 items-center gap-2">
            {beneficio.telefono && (
              <a
                href={`tel:${beneficio.telefono}`}
                aria-label="Llamar al comercio"
                className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-300 bg-white text-ivy-700 shadow-sm transition-all hover:bg-gray-50 active:scale-95"
              >
                <span className="material-symbols-outlined text-[20px]">call</span>
              </a>
            )}
            {tel && (
              <a
                href={tel}
                target="_blank"
                rel="noreferrer"
                aria-label="Escribir por WhatsApp"
                className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-300 bg-white text-ivy-700 shadow-sm transition-all hover:bg-gray-50 active:scale-95"
              >
                <span className="material-symbols-outlined text-[20px]">chat</span>
              </a>
            )}
            {maps && (
              <a
                href={maps}
                target="_blank"
                rel="noreferrer"
                aria-label="Ver ubicación en el mapa"
                className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-300 bg-white text-ivy-700 shadow-sm transition-all hover:bg-gray-50 active:scale-95"
              >
                <span className="material-symbols-outlined text-[20px]">pin_drop</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function Section({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-lg text-ivy-700">{icon}</span>
        <h2 className="text-[12px] font-bold uppercase tracking-widest text-ivy-700">{title}</h2>
      </div>
      {children}
    </section>
  )
}

function Paso({ n, texto }: { n: number; texto: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ivy-500 text-xs font-bold text-white shadow-sm">
        {n}
      </div>
      <p className="text-sm font-medium leading-relaxed text-gray-700">{texto}</p>
    </div>
  )
}
