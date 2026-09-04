import { supabase } from './supabase'
import type { EstadoCuota, ResultadoAcceso, Socio } from './types'

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

export function resultadoParaEstado(estado: EstadoCuota): ResultadoAcceso {
  return estado === 'AL_DIA' ? 'PERMITIDO' : 'DENEGADO'
}

export async function registrarAcceso(socioId: string, resultado: ResultadoAcceso): Promise<void> {
  const { error } = await supabase.from('registros_acceso').insert({ socio_id: socioId, resultado })
  if (error) throw error
}
