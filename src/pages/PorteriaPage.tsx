import { useCallback, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { QrScanner } from '../components/QrScanner'
import { StatusBadge } from '../components/StatusBadge'
import { fetchSocioByNumero, normalizeNumeroSocio, registrarAcceso, resultadoParaEstado } from '../lib/socios'
import { isSupabaseConfigured } from '../lib/supabase'
import type { Socio } from '../lib/types'

type ScanState =
  | { status: 'idle' }
  | { status: 'checking'; numeroSocio: string }
  | { status: 'found'; socio: Socio }
  | { status: 'not-found'; numeroSocio: string }
  | { status: 'error'; message: string }

const RESUME_DELAY_MS = 3500
const RESCAN_COOLDOWN_MS = 4000

export default function PorteriaPage() {
  const [state, setState] = useState<ScanState>({ status: 'idle' })
  const lastScanRef = useRef<{ code: string; at: number } | null>(null)
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const isPaused = state.status !== 'idle'

  const handleScan = useCallback(async (decodedText: string) => {
    const numeroSocio = normalizeNumeroSocio(decodedText)
    if (!numeroSocio) return

    const last = lastScanRef.current
    const now = Date.now()
    if (last && last.code === numeroSocio && now - last.at < RESCAN_COOLDOWN_MS) return
    lastScanRef.current = { code: numeroSocio, at: now }

    setState({ status: 'checking', numeroSocio })

    try {
      const socio = await fetchSocioByNumero(numeroSocio)
      if (!socio) {
        setState({ status: 'not-found', numeroSocio })
      } else {
        setState({ status: 'found', socio })
        await registrarAcceso(socio.id, resultadoParaEstado(socio.estado_cuota))
      }
    } catch {
      setState({ status: 'error', message: 'Error al consultar el estado del socio.' })
    } finally {
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current)
      resumeTimerRef.current = setTimeout(() => setState({ status: 'idle' }), RESUME_DELAY_MS)
    }
  }, [])

  return (
    <div className="min-h-screen bg-ivy-700 px-4 py-8 text-cream">
      <div className="mx-auto flex max-w-sm flex-col gap-6">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-sm font-semibold text-cream/80 hover:underline">
            ← Volver
          </Link>
          <h1 className="text-lg font-bold">Panel de Portería</h1>
          <span className="w-12" />
        </div>

        {!isSupabaseConfigured && (
          <div className="rounded-lg border border-cardinal-300 bg-cardinal-900/40 px-4 py-3 text-sm">
            Supabase no está configurado. Completá <code>VITE_SUPABASE_URL</code> y{' '}
            <code>VITE_SUPABASE_ANON_KEY</code> en <code>.env</code>.
          </div>
        )}

        <QrScanner onScan={handleScan} paused={isPaused} />

        <ResultPanel state={state} />
      </div>
    </div>
  )
}

function ResultPanel({ state }: { state: ScanState }) {
  if (state.status === 'idle') {
    return (
      <p className="text-center text-sm text-cream/70">Escaneá el carnet del socio para validar el acceso.</p>
    )
  }

  if (state.status === 'checking') {
    return (
      <div className="rounded-2xl bg-cream/10 px-6 py-5 text-center">
        <p className="font-semibold">Consultando socio N° {state.numeroSocio}…</p>
      </div>
    )
  }

  if (state.status === 'not-found') {
    return (
      <div className="rounded-2xl border-2 border-cardinal-400 bg-cardinal-500/20 px-6 py-5 text-center">
        <p className="text-lg font-bold">Socio no encontrado</p>
        <p className="mt-1 text-sm text-cream/80">N° {state.numeroSocio} no está registrado.</p>
      </div>
    )
  }

  if (state.status === 'error') {
    return (
      <div className="rounded-2xl border-2 border-cardinal-400 bg-cardinal-500/20 px-6 py-5 text-center">
        <p className="font-semibold">{state.message}</p>
      </div>
    )
  }

  const { socio } = state
  const permitido = socio.estado_cuota === 'AL_DIA'

  return (
    <div
      className={`rounded-2xl border-2 px-6 py-5 text-center ${
        permitido ? 'border-ivy-300 bg-ivy-500/30' : 'border-cardinal-400 bg-cardinal-500/20'
      }`}
    >
      <p className="text-2xl font-bold">{permitido ? 'ACCESO PERMITIDO' : 'ACCESO DENEGADO'}</p>
      <p className="mt-2 text-lg font-semibold">
        {socio.apellido.toUpperCase()}, {socio.nombre.toUpperCase()}
      </p>
      <p className="text-sm text-cream/80">N° {socio.numero_socio}</p>
      <div className="mt-3 flex justify-center">
        <StatusBadge estado={socio.estado_cuota} />
      </div>
    </div>
  )
}
