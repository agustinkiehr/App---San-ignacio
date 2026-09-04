import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { resolveDniToEmail } from '../lib/solicitudes'
import { supabase } from '../lib/supabase'

export default function LoginPage() {
  const navigate = useNavigate()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resetSent, setResetSent] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setResetSent(false)
    setLoading(true)

    try {
      const raw = identifier.trim()
      let email = raw

      if (!raw.includes('@')) {
        const resolved = await resolveDniToEmail(raw)
        if (!resolved) {
          setError('No encontramos una cuenta con ese DNI.')
          return
        }
        email = resolved
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (signInError) {
        setError('Email/DNI o contraseña incorrectos.')
        return
      }
      navigate('/carnet')
    } catch {
      setError('No pudimos iniciar sesión. Probá de nuevo en unos minutos.')
    } finally {
      setLoading(false)
    }
  }

  async function handleForgotPassword() {
    setError(null)
    setResetSent(false)
    if (!identifier.includes('@')) {
      setError('Escribí tu email arriba (no el DNI) para recuperar la contraseña.')
      return
    }
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(identifier.trim())
    if (resetError) {
      setError('No pudimos enviar el email de recuperación.')
      return
    }
    setResetSent(true)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ivy-500 p-6 text-white">
      <div className="flex w-full max-w-[390px] flex-col">
        <div className="mt-2 flex flex-col items-center text-center">
          <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-white p-2.5 shadow-card">
            <img src="/brand/crest-color.png" alt="" className="h-full w-full object-contain" />
          </div>
          <h1 className="font-serif text-[22px] font-bold uppercase leading-tight tracking-[0.14em]">
            San Ignacio Rugby
          </h1>
          <p className="mt-1.5 text-xs uppercase tracking-[0.18em] text-white/80">Portal de socios · Desde 1979</p>
        </div>

        <div className="my-6 w-full rounded-lg border border-white/60 bg-white p-6 text-ink shadow-card">
          <div className="mb-5 border-b border-gray-100 pb-3">
            <h2 className="font-serif text-[17px] font-bold tracking-wide text-ivy-700">Ingreso de Socios</h2>
            <p className="mt-0.5 text-[12px] text-gray-500">Ingresá con tus credenciales registradas</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="identifier" className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-gray-600">
                Correo electrónico o DNI
              </label>
              <div className="relative">
                <input
                  id="identifier"
                  name="identifier"
                  type="text"
                  required
                  autoComplete="username"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="ejemplo@correo.com"
                  className="h-11 w-full rounded-md border border-gray-200 bg-surface-chalk px-3.5 pr-11 text-sm text-gray-800 outline-none transition-colors focus:border-ivy-500 focus:bg-white focus:ring-1 focus:ring-ivy-500"
                />
                <span className="material-symbols-outlined pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-[18px] text-gray-400">
                  mail
                </span>
              </div>
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-gray-600">
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingresá tu clave"
                  className="h-11 w-full rounded-md border border-gray-200 bg-surface-chalk px-3.5 pr-11 text-sm text-gray-800 outline-none transition-colors focus:border-ivy-500 focus:bg-white focus:ring-1 focus:ring-ivy-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label="Mostrar u ocultar contraseña"
                  className="absolute inset-y-0 right-0 flex items-center px-3.5 text-gray-400 hover:text-gray-700"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-0.5">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-xs font-medium text-ivy-700 hover:underline"
              >
                Olvidé mi contraseña
              </button>
            </div>

            {resetSent && (
              <p className="text-xs font-medium text-ivy-700">Te enviamos un email para restablecer tu contraseña.</p>
            )}
            {error && <p className="text-xs font-medium text-wine">{error}</p>}

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-md bg-ivy-500 text-sm font-semibold uppercase tracking-wide text-white shadow-md transition-colors hover:bg-ivy-600 disabled:opacity-60"
              >
                {loading ? 'Ingresando…' : 'Ingresar'}
              </button>
            </div>
          </form>
        </div>

        <div className="px-4 text-center">
          <p className="text-xs leading-relaxed text-white/90">
            ¿No tenés cuenta? Solicitá el alta a la secretaría
            <br />
            <Link to="/solicitar-acceso" className="mt-1 inline-block font-semibold text-white underline decoration-white/70 underline-offset-4 hover:decoration-white">
              Solicitar acceso
            </Link>
          </p>
        </div>

        <div className="mt-3 flex flex-col items-center pt-3 text-center">
          <div className="mb-3 h-[3px] w-12 rounded-full bg-cardinal-500" />
          <p className="max-w-[260px] text-[10.5px] leading-tight tracking-wide text-white/70">
            Solo para socios registrados en el padrón del club
          </p>
          <p className="mt-2 font-mono text-[9.5px] uppercase tracking-widest text-white/40">
            Valle Hermoso · Mar del Plata
          </p>
        </div>
      </div>
    </div>
  )
}
