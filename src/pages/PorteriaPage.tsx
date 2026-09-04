import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { QrScanner } from '../components/QrScanner'
import { ManualEntryForm } from '../components/porteria/ManualEntryForm'
import { RecentAccessList } from '../components/porteria/RecentAccessList'
import { nuevoEstadoResuelto, ScanResultCard, type ScanState } from '../components/porteria/ScanResultCard'
import {
  fetchIngresosHoy,
  fetchSocioByDniOrNumero,
  fetchSocioByNumero,
  fetchUltimosAccesos,
  normalizeNumeroSocio,
  registrarAcceso,
  resultadoParaEstado,
} from '../lib/socios'
import { isSupabaseConfigured } from '../lib/supabase'
import type { RegistroAccesoConSocio, Socio } from '../lib/types'

const RESCAN_COOLDOWN_MS = 4000
const FECHA_HOY = new Date().toLocaleDateString('es-AR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

export default function PorteriaPage() {
  const [scanState, setScanState] = useState<ScanState>({ status: 'idle' })
  const [scannerKey, setScannerKey] = useState(0)
  const [ingresosHoy, setIngresosHoy] = useState<number | null>(null)
  const [ultimosAccesos, setUltimosAccesos] = useState<RegistroAccesoConSocio[]>([])
  const [overriding, setOverriding] = useState(false)
  const [online, setOnline] = useState(typeof navigator === 'undefined' ? true : navigator.onLine)
  const lastQueryRef = useRef<{ query: string; at: number } | null>(null)

  const isBusy = scanState.status === 'checking'

  const refreshCounters = useCallback(async () => {
    try {
      const [count, recientes] = await Promise.all([fetchIngresosHoy(), fetchUltimosAccesos(3)])
      setIngresosHoy(count)
      setUltimosAccesos(recientes)
    } catch {
      // no crítico: el panel sigue funcionando sin los contadores
    }
  }, [])

  useEffect(() => {
    void refreshCounters()
    const onOnline = () => setOnline(true)
    const onOffline = () => setOnline(false)
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    return () => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }, [refreshCounters])

  const resolverSocio = useCallback(
    async (query: string, buscar: (q: string) => Promise<Socio | null>) => {
      setScanState({ status: 'checking', query })
      try {
        const socio = await buscar(query)
        if (!socio) {
          setScanState({ status: 'not-found', query })
          return
        }
        const resultado = resultadoParaEstado(socio.estado_cuota)
        await registrarAcceso(socio.id, resultado, false)
        setScanState(nuevoEstadoResuelto(socio, false))
        void refreshCounters()
      } catch {
        setScanState({ status: 'error', message: 'Error al consultar el estado del socio.' })
      }
    },
    [refreshCounters],
  )

  const handleScan = useCallback(
    (decodedText: string) => {
      const numeroSocio = normalizeNumeroSocio(decodedText)
      if (!numeroSocio) return

      const last = lastQueryRef.current
      const now = Date.now()
      if (last && last.query === numeroSocio && now - last.at < RESCAN_COOLDOWN_MS) return
      lastQueryRef.current = { query: numeroSocio, at: now }

      void resolverSocio(numeroSocio, fetchSocioByNumero)
    },
    [resolverSocio],
  )

  const handleManual = useCallback(
    (query: string) => {
      lastQueryRef.current = { query, at: Date.now() }
      void resolverSocio(query, fetchSocioByDniOrNumero)
    },
    [resolverSocio],
  )

  const handleOverride = useCallback(
    async (socio: Socio) => {
      setOverriding(true)
      try {
        await registrarAcceso(socio.id, 'PERMITIDO', true)
        setScanState(nuevoEstadoResuelto(socio, true))
        void refreshCounters()
      } catch {
        setScanState({ status: 'error', message: 'No pudimos registrar la excepción. Reintentá.' })
      } finally {
        setOverriding(false)
      }
    },
    [refreshCounters],
  )

  return (
    <div className="min-h-screen bg-night text-white">
      <header className="border-b border-white/10 bg-night-panel px-4 py-3">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src="/brand/crest-white.png" alt="" className="h-8 w-8 object-contain" />
            <span className="text-sm font-semibold tracking-wide text-white/90">San Ignacio Rugby · Portería</span>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${
                online && isSupabaseConfigured ? 'bg-ivy-500/20 text-ivy-200' : 'bg-wine-bg/20 text-wine-border'
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              {online && isSupabaseConfigured ? 'Online' : 'Offline'}
            </span>
            <Link to="/" className="text-sm font-semibold text-white/60 hover:text-white">
              Salir
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-2xl flex-col gap-4 px-4 py-5">
        {!isSupabaseConfigured && (
          <div className="rounded-lg border border-cardinal-500/40 bg-cardinal-900/30 px-4 py-3 text-sm">
            Supabase no está configurado. Completá <code>VITE_SUPABASE_URL</code> y{' '}
            <code>VITE_SUPABASE_ANON_KEY</code> en <code>.env</code>.
          </div>
        )}

        <div className="flex items-end justify-between">
          <div>
            <h1 className="font-serif text-2xl font-bold text-white">Control de Acceso</h1>
            <p className="text-sm capitalize text-white/50">{FECHA_HOY}</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-bold uppercase tracking-wider text-white/50">Ingresos hoy</p>
            <p className="font-serif text-3xl font-bold text-ivy-300">{ingresosHoy ?? '—'}</p>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-white/10 bg-black">
          <QrScanner key={scannerKey} onScan={handleScan} paused={isBusy} hint="Apuntá al QR del socio" />
        </div>

        <ScanResultCard state={scanState} onOverride={handleOverride} overriding={overriding} />

        <div className="flex gap-3">
          <ManualEntryForm onSubmit={handleManual} disabled={isBusy} />
          <button
            type="button"
            onClick={() => setScannerKey((k) => k + 1)}
            className="flex h-11 items-center justify-center gap-2 rounded-lg border border-white/20 px-4 text-sm font-semibold text-white/80 transition-colors hover:bg-white/5"
          >
            <span className="material-symbols-outlined text-[18px]">refresh</span>
            Reiniciar lector
          </button>
        </div>

        <RecentAccessList registros={ultimosAccesos} />

        <p className="pb-4 pt-2 text-center text-[11px] text-white/30">
          Portal Operativo · Predio Valle Hermoso · SIR 1979
        </p>
      </main>
    </div>
  )
}
