import { FormEvent, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BottomNav } from '../components/BottomNav'
import { CarnetCard } from '../components/CarnetCard'
import { cacheSocio, fetchSocioByNumero, getCachedSocio, normalizeNumeroSocio } from '../lib/socios'
import { isSupabaseConfigured } from '../lib/supabase'
import type { Socio } from '../lib/types'

const STORAGE_KEY = 'sir.ultimoNumeroSocio'

export default function CarnetPage() {
  const [input, setInput] = useState(() => localStorage.getItem(STORAGE_KEY) ?? '')
  const [socio, setSocio] = useState<Socio | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [offline, setOffline] = useState(false)

  async function buscarSocio(numeroSocio: string) {
    setLoading(true)
    setError(null)
    setOffline(false)
    try {
      const encontrado = await fetchSocioByNumero(numeroSocio)
      if (!encontrado) {
        setSocio(null)
        setError(`No encontramos un socio con el número ${numeroSocio}.`)
        return
      }
      setSocio(encontrado)
      cacheSocio(encontrado)
      localStorage.setItem(STORAGE_KEY, numeroSocio)
    } catch {
      const cacheado = getCachedSocio(numeroSocio)
      if (cacheado) {
        setSocio(cacheado)
        setOffline(true)
        localStorage.setItem(STORAGE_KEY, numeroSocio)
      } else {
        setError('No pudimos consultar el estado del socio. Probá de nuevo en unos minutos.')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) void buscarSocio(saved)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const numeroSocio = normalizeNumeroSocio(input)
    if (!numeroSocio) {
      setError('Ingresá un número de socio válido.')
      return
    }
    setInput(numeroSocio)
    void buscarSocio(numeroSocio)
  }

  return (
    <div className="flex min-h-screen flex-col bg-surface-chalk">
      <header className="fixed inset-x-0 top-0 z-50 bg-ivy-500 pt-safe shadow-md">
        <div className="flex h-16 items-center justify-between px-4">
          <img src="/brand/crest-white.png" alt="San Ignacio Rugby" className="h-9 w-9 object-contain" />
          <h1 className="mx-2 flex-1 truncate text-center font-serif text-[17px] font-bold uppercase tracking-[0.15em] text-white">
            Carnet de Socio
          </h1>
          <span className="h-9 w-9 shrink-0" />
        </div>
      </header>

      <main className="flex-1 pb-24 pt-20">
        <div className="mx-auto flex max-w-[420px] flex-col gap-4 px-4">
          {!isSupabaseConfigured && (
            <div className="rounded-lg border border-cardinal-300 bg-cardinal-50 px-4 py-3 text-sm text-cardinal-700">
              Supabase no está configurado. Completá <code>VITE_SUPABASE_URL</code> y{' '}
              <code>VITE_SUPABASE_ANON_KEY</code> en <code>.env</code>.
            </div>
          )}

          {socio ? (
            <div className="flex flex-col items-center gap-4">
              {offline && (
                <div className="flex w-full items-center gap-2 rounded-lg border border-surface-border bg-white px-4 py-2.5 text-[13px] font-medium text-gray-600 shadow-sm">
                  <span className="material-symbols-outlined shrink-0 text-[18px] text-ivy-500">wifi_off</span>
                  Mostrando la última información guardada en este dispositivo.
                </div>
              )}
              <CarnetCard socio={socio} />
              <div className="flex w-full items-center gap-3 rounded-lg border border-surface-border bg-white px-4 py-3 shadow-sm">
                <span className="material-symbols-outlined shrink-0 text-[20px] text-ivy-500">wifi_off</span>
                <span className="text-[13px] font-medium text-gray-600">Tu carnet funciona sin internet</span>
              </div>
              <button
                onClick={() => {
                  setSocio(null)
                  localStorage.removeItem(STORAGE_KEY)
                }}
                className="text-sm font-semibold text-ivy-600 hover:underline"
              >
                Buscar otro socio
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-lg border border-surface-border bg-white p-6 shadow-card">
              <div>
                <h2 className="font-serif text-xl font-bold text-ivy-700">Mi Carnet</h2>
                <p className="mt-1 text-sm text-gray-500">Ingresá tu número de socio para generar tu carnet digital.</p>
              </div>
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-semibold text-ivy-700">Número de socio</span>
                <input
                  inputMode="numeric"
                  autoFocus
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="01850"
                  maxLength={5}
                  className="h-12 rounded-lg border border-surface-border px-4 font-mono text-lg tracking-widest text-ivy-800 outline-none focus:border-ivy-500 focus:ring-2 focus:ring-ivy-200"
                />
              </label>
              {error && <p className="text-sm font-medium text-wine">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="h-12 rounded-lg bg-ivy-500 font-semibold text-white transition hover:bg-ivy-600 disabled:opacity-60"
              >
                {loading ? 'Buscando…' : 'Ver mi carnet'}
              </button>
              <Link to="/" className="text-center text-sm font-semibold text-ivy-600 hover:underline">
                ← Volver al inicio
              </Link>
            </form>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
