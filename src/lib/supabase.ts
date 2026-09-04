import { createClient } from '@supabase/supabase-js'

// Vacío/whitespace también cuenta como "no configurado": createClient() de
// supabase-js lanza una excepción sin capturar ante un string vacío (no sólo
// undefined), lo que tira abajo toda la app en el primer render. Pasó en
// producción cuando una env var quedó cargada con nombre pero sin valor.
function envVar(raw: string | undefined): string | undefined {
  const trimmed = raw?.trim()
  return trimmed ? trimmed : undefined
}

const supabaseUrl = envVar(import.meta.env.VITE_SUPABASE_URL)
const supabaseAnonKey = envVar(import.meta.env.VITE_SUPABASE_ANON_KEY)

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

if (!isSupabaseConfigured) {
  // eslint-disable-next-line no-console
  console.warn(
    '[Supabase] Faltan VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. Copiá .env.example a .env y completá las credenciales del proyecto.',
  )
}

export const supabase = createClient(supabaseUrl ?? 'https://placeholder.supabase.co', supabaseAnonKey ?? 'placeholder')
