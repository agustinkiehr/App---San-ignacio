import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * La Web Platform no expone control real de brillo de pantalla; el Wake Lock
 * (mantener la pantalla encendida y a su brillo actual sin que se atenúe) es
 * el equivalente práctico más cercano para que el QR del carnet se vea bien
 * al mostrarlo en portería.
 */
export function useWakeLock() {
  const [active, setActive] = useState(false)
  const sentinelRef = useRef<WakeLockSentinel | null>(null)

  const release = useCallback(async () => {
    await sentinelRef.current?.release().catch(() => undefined)
    sentinelRef.current = null
    setActive(false)
  }, [])

  const toggle = useCallback(async () => {
    if (!('wakeLock' in navigator)) return

    if (sentinelRef.current) {
      await release()
      return
    }

    try {
      const sentinel = await navigator.wakeLock.request('screen')
      sentinelRef.current = sentinel
      setActive(true)
      sentinel.addEventListener('release', () => setActive(false))
    } catch {
      setActive(false)
    }
  }, [release])

  useEffect(() => () => void release(), [release])

  return { active, toggle, supported: typeof navigator !== 'undefined' && 'wakeLock' in navigator }
}
