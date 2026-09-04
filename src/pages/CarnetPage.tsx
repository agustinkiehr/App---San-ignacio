import { useEffect, useState } from 'react'
import { BottomNav } from '../components/BottomNav'
import { CarnetCard } from '../components/CarnetCard'
import { useAuth } from '../lib/AuthContext'
import { cacheMiSocio, fetchSocioByUserId, getCachedMiSocio } from '../lib/socios'
import { fetchMiSolicitud } from '../lib/solicitudes'
import type { EstadoSolicitud, Socio } from '../lib/types'

type Estado =
  | { status: 'loading' }
  | { status: 'listo'; socio: Socio; offline: boolean }
  | { status: 'sin-vincular'; solicitudEstado: EstadoSolicitud | null }
  | { status: 'error' }

export default function CarnetPage() {
  const { session, signOut } = useAuth()
  const userId = session!.user.id
  const [estado, setEstado] = useState<Estado>({ status: 'loading' })

  useEffect(() => {
    let cancelado = false

    async function cargar() {
      try {
        const socio = await fetchSocioByUserId(userId)
        if (cancelado) return
        if (socio) {
          cacheMiSocio(userId, socio)
          setEstado({ status: 'listo', socio, offline: false })
          return
        }
        const solicitud = await fetchMiSolicitud(userId)
        if (cancelado) return
        setEstado({ status: 'sin-vincular', solicitudEstado: solicitud?.estado ?? null })
      } catch {
        if (cancelado) return
        const cacheado = getCachedMiSocio(userId)
        if (cacheado) {
          setEstado({ status: 'listo', socio: cacheado, offline: true })
        } else {
          setEstado({ status: 'error' })
        }
      }
    }

    void cargar()
    return () => {
      cancelado = true
    }
  }, [userId])

  return (
    <div className="flex min-h-screen flex-col bg-surface-chalk">
      <header className="fixed inset-x-0 top-0 z-50 bg-ivy-500 pt-safe shadow-md">
        <div className="flex h-16 items-center justify-between px-4">
          <img src="/brand/crest-white.png" alt="San Ignacio Rugby" className="h-9 w-9 object-contain" />
          <h1 className="mx-2 flex-1 truncate text-center font-serif text-[17px] font-bold uppercase tracking-[0.15em] text-white">
            Carnet de Socio
          </h1>
          <button
            onClick={() => void signOut()}
            aria-label="Cerrar sesión"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white transition-colors active:bg-white/10"
          >
            <span className="material-symbols-outlined text-[22px]">logout</span>
          </button>
        </div>
      </header>

      <main className="flex-1 pb-24 pt-20">
        <div className="mx-auto flex max-w-[420px] flex-col gap-4 px-4">
          {estado.status === 'loading' && (
            <div className="rounded-lg border border-surface-border bg-white p-6 text-center text-sm text-gray-500 shadow-card">
              Cargando tu carnet…
            </div>
          )}

          {estado.status === 'error' && (
            <div className="rounded-lg border border-surface-border bg-white p-6 text-center shadow-card">
              <p className="text-sm font-medium text-wine">No pudimos cargar tu carnet. Probá de nuevo en unos minutos.</p>
            </div>
          )}

          {estado.status === 'sin-vincular' && <SinVincular solicitudEstado={estado.solicitudEstado} />}

          {estado.status === 'listo' && (
            <div className="flex flex-col items-center gap-4">
              {estado.offline && (
                <div className="flex w-full items-center gap-2 rounded-lg border border-surface-border bg-white px-4 py-2.5 text-[13px] font-medium text-gray-600 shadow-sm">
                  <span className="material-symbols-outlined shrink-0 text-[18px] text-ivy-500">wifi_off</span>
                  Mostrando la última información guardada en este dispositivo.
                </div>
              )}
              <CarnetCard socio={estado.socio} />
              <div className="flex w-full items-center gap-3 rounded-lg border border-surface-border bg-white px-4 py-3 shadow-sm">
                <span className="material-symbols-outlined shrink-0 text-[20px] text-ivy-500">wifi_off</span>
                <span className="text-[13px] font-medium text-gray-600">Tu carnet funciona sin internet</span>
              </div>
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  )
}

function SinVincular({ solicitudEstado }: { solicitudEstado: EstadoSolicitud | null }) {
  if (solicitudEstado === 'PENDIENTE') {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-surface-border bg-white p-6 text-center shadow-card">
        <span className="material-symbols-outlined text-[36px] text-ochre">hourglass_top</span>
        <h2 className="font-serif text-lg font-bold text-ivy-700">Tu solicitud está en revisión</h2>
        <p className="text-sm text-gray-500">
          Secretaría revisa las altas en 24 a 48 horas. Volvé a entrar más tarde para ver tu carnet.
        </p>
      </div>
    )
  }

  if (solicitudEstado === 'RECHAZADA') {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-wine-border bg-wine-bg p-6 text-center shadow-card">
        <span className="material-symbols-outlined text-[36px] text-wine">error</span>
        <h2 className="font-serif text-lg font-bold text-wine">No pudimos validar tu alta</h2>
        <p className="text-sm text-gray-600">Acercate a secretaría del club para resolverlo.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-surface-border bg-white p-6 text-center shadow-card">
      <span className="material-symbols-outlined text-[36px] text-gray-400">person_off</span>
      <h2 className="font-serif text-lg font-bold text-ivy-700">Tu cuenta no está vinculada a un socio</h2>
      <p className="text-sm text-gray-500">Acercate a secretaría del club para resolverlo.</p>
    </div>
  )
}
