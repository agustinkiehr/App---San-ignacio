import { useEffect, useMemo, useState } from 'react'
import { BottomNav } from '../components/BottomNav'
import { BeneficioCard } from '../components/beneficios/BeneficioCard'
import { FeaturedBeneficio } from '../components/beneficios/FeaturedBeneficio'
import { fetchBeneficios } from '../lib/beneficios'
import { useFavoritos } from '../lib/favoritos'
import { distanciaMetros, formatDistancia, useUbicacion } from '../lib/geo'
import type { Beneficio, Rubro } from '../lib/types'
import { RUBRO_LABEL } from '../lib/types'

const RUBROS: Rubro[] = ['GASTRONOMIA', 'DEPORTES', 'SALUD', 'INDUMENTARIA', 'OTROS']

export default function BeneficiosPage() {
  const [beneficios, setBeneficios] = useState<Beneficio[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [busqueda, setBusqueda] = useState('')
  const [rubroActivo, setRubroActivo] = useState<Rubro | 'TODOS'>('TODOS')
  const [soloFavoritos, setSoloFavoritos] = useState(false)
  const [ordenarPorCercania, setOrdenarPorCercania] = useState(false)

  const { esFavorito, toggle } = useFavoritos()
  const { ubicacion, loading: ubicando, error: errorUbicacion, solicitar } = useUbicacion()

  useEffect(() => {
    let cancelado = false
    fetchBeneficios()
      .then((data) => {
        if (!cancelado) setBeneficios(data)
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
  }, [])

  function distanciaTexto(b: Beneficio): string | undefined {
    if (!ubicacion || b.lat == null || b.lng == null) return undefined
    return formatDistancia(distanciaMetros(ubicacion, { lat: b.lat, lng: b.lng }))
  }

  function handleCercaMio() {
    setOrdenarPorCercania(true)
    if (!ubicacion) solicitar()
  }

  const destacado = useMemo(() => beneficios.find((b) => b.destacado), [beneficios])

  const destacadoEnListado = soloFavoritos || rubroActivo !== 'TODOS' || !!busqueda.trim()

  const filtrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase()
    let lista = beneficios.filter((b) => {
      if (b === destacado && !destacadoEnListado) return false
      if (rubroActivo !== 'TODOS' && b.rubro !== rubroActivo) return false
      if (soloFavoritos && !esFavorito(b.id)) return false
      if (!texto) return true
      return (
        b.nombre_comercio.toLowerCase().includes(texto) ||
        b.descripcion.toLowerCase().includes(texto) ||
        (b.subtitulo?.toLowerCase().includes(texto) ?? false)
      )
    })
    if (ordenarPorCercania && ubicacion) {
      lista = [...lista].sort((a, b) => {
        const da = a.lat != null && a.lng != null ? distanciaMetros(ubicacion, { lat: a.lat, lng: a.lng }) : Infinity
        const db = b.lat != null && b.lng != null ? distanciaMetros(ubicacion, { lat: b.lat, lng: b.lng }) : Infinity
        return da - db
      })
    }
    return lista
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [beneficios, busqueda, rubroActivo, destacado, destacadoEnListado, soloFavoritos, esFavorito, ordenarPorCercania, ubicacion])

  return (
    <div className="flex min-h-screen flex-col bg-surface-chalk">
      <header className="fixed inset-x-0 top-0 z-50 bg-ivy-500 pt-safe shadow-md">
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white p-1 shadow-sm">
            <img src="/brand/crest-color.png" alt="San Ignacio Rugby" className="h-full w-full object-contain" />
          </div>
          <h1 className="mx-2 flex-1 truncate text-center font-serif text-[17px] font-bold uppercase tracking-[0.15em] text-white">
            Beneficios
          </h1>
          <span className="h-9 w-9 shrink-0" />
        </div>
      </header>

      <main className="flex-1 pb-24 pt-20">
        <div className="mx-auto flex max-w-[480px] flex-col gap-4 px-4">
          <section className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-ivy-700">
              <span className="material-symbols-outlined text-[18px]">verified</span>
              <span className="text-[11px] font-bold uppercase tracking-widest">Comunidad San Ignacio Rugby</span>
            </div>
            <h2 className="font-serif text-2xl font-bold leading-tight text-ivy-700">Beneficios exclusivos</h2>
            <p className="text-sm text-gray-500">
              Descuentos y acuerdos comerciales presentando tu carnet digital con cuota al día.
            </p>
          </section>

          <div className="relative">
            <span className="material-symbols-outlined pointer-events-none absolute inset-y-0 left-3 flex items-center text-[20px] text-gray-400">
              search
            </span>
            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar comercio o rubro…"
              className="h-12 w-full rounded-xl border border-surface-border bg-white pl-10 pr-3.5 text-sm text-ink shadow-sm outline-none focus:border-ivy-500 focus:ring-2 focus:ring-ivy-500/20"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <CategoryChip label={`Todos (${beneficios.length})`} active={rubroActivo === 'TODOS'} onClick={() => setRubroActivo('TODOS')} />
            {RUBROS.map((r) => (
              <CategoryChip key={r} label={RUBRO_LABEL[r]} active={rubroActivo === r} onClick={() => setRubroActivo(r)} />
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleCercaMio}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                ordenarPorCercania && ubicacion ? 'bg-ivy-500 text-white shadow-sm' : 'bg-white text-ivy-700 hover:bg-ivy-50'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">
                {ubicando ? 'progress_activity' : 'my_location'}
              </span>
              {ubicando ? 'Ubicándote…' : 'Cerca mío'}
            </button>
            <button
              type="button"
              onClick={() => setSoloFavoritos((v) => !v)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                soloFavoritos ? 'bg-cardinal-500 text-white shadow-sm' : 'bg-white text-gray-500 hover:bg-ivy-50'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">{soloFavoritos ? 'favorite' : 'favorite_border'}</span>
              Favoritos
            </button>
          </div>
          {errorUbicacion && <p className="-mt-2 text-xs text-wine">{errorUbicacion}</p>}

          {loading && <p className="py-8 text-center text-sm text-gray-400">Cargando beneficios…</p>}
          {error && <p className="py-8 text-center text-sm font-medium text-wine">No pudimos cargar los beneficios. Probá de nuevo en unos minutos.</p>}

          {!loading && !error && (
            <>
              {destacado && rubroActivo === 'TODOS' && !busqueda.trim() && !soloFavoritos && (
                <section className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Destacado de la semana</span>
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-ivy-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-cardinal-500" />
                      Club Partner
                    </span>
                  </div>
                  <FeaturedBeneficio
                    beneficio={destacado}
                    esFavorito={esFavorito(destacado.id)}
                    onToggleFavorito={() => toggle(destacado.id)}
                    distanciaTexto={distanciaTexto(destacado)}
                  />
                </section>
              )}

              <section className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Comercios adheridos</span>
                  <span className="text-[11px] font-semibold text-ivy-700">{filtrados.length} comercios</span>
                </div>
                {filtrados.length === 0 ? (
                  <p className="py-6 text-center text-sm text-gray-400">No encontramos beneficios con ese filtro.</p>
                ) : (
                  filtrados.map((b) => (
                    <BeneficioCard
                      key={b.id}
                      beneficio={b}
                      esFavorito={esFavorito(b.id)}
                      onToggleFavorito={() => toggle(b.id)}
                      distanciaTexto={distanciaTexto(b)}
                    />
                  ))
                )}
              </section>
            </>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  )
}

function CategoryChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
        active ? 'bg-ivy-500 text-white shadow-sm' : 'bg-white text-gray-500 hover:bg-ivy-50'
      }`}
    >
      {label}
    </button>
  )
}
