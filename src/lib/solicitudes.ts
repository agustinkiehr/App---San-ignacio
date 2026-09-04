import { supabase } from './supabase'
import type { SolicitudAcceso } from './types'

/** Resuelve un DNI a su email de login vía RPC segura (no expone auth.users). */
export async function resolveDniToEmail(dni: string): Promise<string | null> {
  const { data, error } = await supabase.rpc('dni_to_email', { p_dni: dni.trim() })
  if (error) throw error
  return data ?? null
}

/** Traduce errores conocidos de Supabase Auth; para el resto (fallas de red, etc.) da un mensaje genérico en vez del texto técnico crudo. */
function mensajeAmigable(rawMessage: string): string {
  const msg = rawMessage.toLowerCase()
  if (msg.includes('already registered') || msg.includes('already exists')) {
    return 'Ese email ya tiene una cuenta. Probá iniciar sesión o recuperar tu contraseña.'
  }
  if (msg.includes('password') && (msg.includes('short') || msg.includes('weak') || msg.includes('least'))) {
    return 'La contraseña es muy débil. Probá con una más larga.'
  }
  if (msg.includes('invalid') && msg.includes('email')) {
    return 'El email no es válido.'
  }
  return 'No pudimos enviar la solicitud. Revisá tu conexión y probá de nuevo en unos minutos.'
}

export interface NuevaSolicitud {
  numeroSocio: string
  dni: string
  email: string
  telefono: string
  password: string
}

/**
 * Crea la cuenta de Supabase Auth y registra la solicitud de alta.
 * Devuelve 'ok', o un motivo legible si falla (ej. email ya registrado).
 */
export async function enviarSolicitudAcceso(
  input: NuevaSolicitud,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
  })

  if (signUpError) {
    return { ok: false, message: mensajeAmigable(signUpError.message) }
  }

  const userId = signUpData.user?.id
  if (!userId) {
    return { ok: false, message: 'No pudimos crear la cuenta. Probá de nuevo en unos minutos.' }
  }

  const { error: insertError } = await supabase.from('solicitudes_acceso').insert({
    user_id: userId,
    numero_socio: input.numeroSocio || null,
    dni: input.dni,
    email: input.email,
    telefono: input.telefono,
  })

  if (insertError) {
    return { ok: false, message: 'La cuenta se creó, pero no pudimos registrar la solicitud. Contactá a secretaría.' }
  }

  return { ok: true }
}

export async function fetchMiSolicitud(userId: string): Promise<SolicitudAcceso | null> {
  const { data, error } = await supabase.from('solicitudes_acceso').select('*').eq('user_id', userId).maybeSingle()
  if (error) throw error
  return data
}
