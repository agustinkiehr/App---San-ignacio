import { FormEvent, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CarnetCard } from '../components/CarnetCard'
import { fetchSocioByNumero, normalizeNumeroSocio } from '../lib/socios'
import { isSupabaseConfigured } from '../lib/supabase'
import type { Socio } from '../lib/types'

const STORAGE_KEY = 'sir.ultimoNumeroSocio'

export default function CarnetPage() {
  const [input, setInput] = useState(() => localStorage.getItem(STORAGE_KEY) ?? '')
  const [socio, setSocio] = useState<Socio | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function buscarSocio(numeroSocio: string) {
    setLoading(true)
    setError(null)
    try {
      const encontrado = await fetchSocioByNumero(numeroSocio)
      if (!encontrado) {
        setSocio(null)
        setError(`No encontramos un socio con el número ${numeroSocio}.`)
        return
      }
      setSocio(encontrado)
      localStorage.setItem(STORAGE_KEY, numeroSocio)
    } catch {
      setError('No pudimos consultar el estado del socio. Probá de nuevo en unos minutos.')
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
    <div className="min-h-screen bg-cream px-4 py-8">
      <div className="mx-auto flex max-w-sm flex-col gap-6">
        <Link to="/" className="text-sm font-semibold text-ivy-600 hover:underline">
          ← Volver
        </Link>

        {!isSupabaseConfigured && (
          <div className="rounded-lg border border-cardinal-300 bg-cardinal-50 px-4 py-3 text-sm text-cardinal-700">
            Supabase no está configurado. Completá <code>VITE_SUPABASE_URL</code> y{' '}
            <code>VITE_SUPABASE_ANON_KEY</code> en <code>.env</code>.
          </div>
        )}

        {socio ? (
          <div className="flex flex-col items-center gap-4">
            <CarnetCard socio={socio} />
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
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-card">
            <div>
              <h2 className="text-xl font-bold text-ivy-700">Mi Carnet</h2>
              <p className="mt-1 text-sm text-ivy-700/70">
                Ingresá tu número de socio para generar tu carnet digital.
              </p>
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
                className="rounded-lg border border-ivy-200 px-4 py-3 font-mono text-lg tracking-widest text-ivy-800 outline-none focus:border-ivy-500 focus:ring-2 focus:ring-ivy-200"
              />
            </label>
            {error && <p className="text-sm font-medium text-cardinal-600">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-ivy-500 px-4 py-3 font-semibold text-white transition hover:bg-ivy-600 disabled:opacity-60"
            >
              {loading ? 'Buscando…' : 'Ver mi carnet'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
