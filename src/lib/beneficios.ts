import { supabase } from './supabase'
import type { Beneficio } from './types'

export async function fetchBeneficios(): Promise<Beneficio[]> {
  const { data, error } = await supabase
    .from('beneficios')
    .select('*')
    .eq('activo', true)
    .order('destacado', { ascending: false })
    .order('orden', { ascending: true })

  if (error) throw error
  return data ?? []
}

export async function fetchBeneficioById(id: string): Promise<Beneficio | null> {
  const { data, error } = await supabase.from('beneficios').select('*').eq('id', id).maybeSingle()
  if (error) throw error
  return data
}

/** Link de Google Maps a partir de la dirección, si el comercio no cargó uno propio. */
export function mapaUrl(beneficio: Beneficio): string | null {
  if (beneficio.mapa_url) return beneficio.mapa_url
  if (!beneficio.direccion) return null
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(beneficio.direccion)}`
}

export function whatsappUrl(beneficio: Beneficio): string | null {
  if (!beneficio.whatsapp) return null
  const digits = beneficio.whatsapp.replace(/\D/g, '')
  const texto = `Hola! Soy socio de San Ignacio Rugby y quiero consultar por el beneficio "${beneficio.nombre_comercio}".`
  return `https://wa.me/${digits}?text=${encodeURIComponent(texto)}`
}
