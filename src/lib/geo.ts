import { useCallback, useState } from 'react'

export interface Coords {
  lat: number
  lng: number
}

/** Distancia en metros entre dos coordenadas (fórmula de Haversine). */
export function distanciaMetros(a: Coords, b: Coords): number {
  const R = 6371000
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

export function formatDistancia(metros: number): string {
  if (metros < 950) return `${Math.round(metros / 10) * 10} m`
  return `${(metros / 1000).toFixed(1)} km`
}

/** Pide la ubicación del navegador sólo cuando el usuario lo pide explícitamente (botón "Cerca mío"). */
export function useUbicacion() {
  const [ubicacion, setUbicacion] = useState<Coords | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const solicitar = useCallback(() => {
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      setError('Tu navegador no soporta geolocalización.')
      return
    }
    setLoading(true)
    setError(null)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUbicacion({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setLoading(false)
      },
      () => {
        setError('No pudimos acceder a tu ubicación. Revisá los permisos del navegador.')
        setLoading(false)
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 5 * 60 * 1000 },
    )
  }, [])

  return { ubicacion, loading, error, solicitar }
}
