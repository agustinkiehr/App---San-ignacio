import { supabase } from './supabase'
import type { EstadoCuota, RegistroAccesoConSocio, ResultadoAcceso, Socio } from './types'

/** El QR del club guarda el número de socio en texto plano, 5 dígitos con ceros a la izquierda (ej: "01850"). */
export function normalizeNumeroSocio(raw: string): string {
  const digits = raw.trim().replace(/\D/g, '')
  if (!digits) return ''
  return digits.padStart(5, '0').slice(-5)
}

export async function fetchSocioByNumero(numeroSocio: string): Promise<Socio | null> {
  const { data, error } = await supabase
    .from('socios')
    .select('*')
    .eq('numero_socio', numeroSocio)
    .maybeSingle()

  if (error) throw error
  return data
}

/** Ingreso manual en portería cuando el QR falla: acepta DNI o número de socio. */
export async function fetchSocioByDniOrNumero(raw: string): Promise<Socio | null> {
  const digits = raw.trim().replace(/\D/g, '')
  if (!digits) return null

  const { data, error } = await supabase
    .from('socios')
    .select('*')
    .or(`dni.eq.${digits},numero_socio.eq.${normalizeNumeroSocio(digits)}`)
    .limit(1)
    .maybeSingle()

  if (error) throw error
  return data
}

export function resultadoParaEstado(estado: EstadoCuota): ResultadoAcceso {
  return estado === 'AL_DIA' ? 'PERMITIDO' : 'DENEGADO'
}

export async function registrarAcceso(
  socioId: string,
  resultado: ResultadoAcceso,
  excepcion = false,
): Promise<void> {
  const { error } = await supabase.from('registros_acceso').insert({ socio_id: socioId, resultado, excepcion })
  if (error) throw error
}

/** Cantidad de ingresos permitidos registrados hoy (para el contador de portería). */
export async function fetchIngresosHoy(): Promise<number> {
  const inicioDelDia = new Date()
  inicioDelDia.setHours(0, 0, 0, 0)

  const { count, error } = await supabase
    .from('registros_acceso')
    .select('id', { count: 'exact', head: true })
    .eq('resultado', 'PERMITIDO')
    .gte('fecha_hora', inicioDelDia.toISOString())

  if (error) throw error
  return count ?? 0
}

export async function fetchUltimosAccesos(limit = 3): Promise<RegistroAccesoConSocio[]> {
  const { data, error } = await supabase
    .from('registros_acceso')
    .select('id, socio_id, fecha_hora, resultado, excepcion, socio:socios(nombre, apellido, categoria, numero_socio)')
    .order('fecha_hora', { ascending: false })
    .limit(limit)

  if (error) throw error
  return (data ?? []) as unknown as RegistroAccesoConSocio[]
}

// --- Caché offline del carnet (para que siga funcionando sin señal, PRD §6.2) ---

const CARNET_CACHE_PREFIX = 'sir.carnetCache.'

export function cacheSocio(socio: Socio): void {
  try {
    localStorage.setItem(`${CARNET_CACHE_PREFIX}${socio.numero_socio}`, JSON.stringify(socio))
  } catch {
    // localStorage no disponible (modo privado, etc.): sin caché offline, sin romper el flujo.
  }
}

export function getCachedSocio(numeroSocio: string): Socio | null {
  try {
    const raw = localStorage.getItem(`${CARNET_CACHE_PREFIX}${numeroSocio}`)
    return raw ? (JSON.parse(raw) as Socio) : null
  } catch {
    return null
  }
}
