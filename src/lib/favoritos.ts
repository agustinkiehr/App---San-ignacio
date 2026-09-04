import { useCallback, useState } from 'react'

const STORAGE_KEY = 'sir.beneficiosFavoritos'

function leer(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return new Set(raw ? (JSON.parse(raw) as string[]) : [])
  } catch {
    return new Set()
  }
}

function guardar(ids: Set<string>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]))
  } catch {
    // localStorage no disponible (modo privado, etc.): no persiste, no rompe el flujo.
  }
}

/** Favoritos guardados en este dispositivo (localStorage), sin necesidad de login. */
export function useFavoritos() {
  const [favoritos, setFavoritos] = useState<Set<string>>(() => leer())

  const toggle = useCallback((id: string) => {
    setFavoritos((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      guardar(next)
      return next
    })
  }, [])

  return { favoritos, esFavorito: (id: string) => favoritos.has(id), toggle }
}
