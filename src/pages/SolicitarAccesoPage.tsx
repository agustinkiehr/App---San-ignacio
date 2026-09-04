import { FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import { enviarSolicitudAcceso } from '../lib/solicitudes'
import { normalizeNumeroSocio } from '../lib/socios'

export default function SolicitarAccesoPage() {
  const [numeroSocio, setNumeroSocio] = useState('')
  const [dni, setDni] = useState('')
  const [email, setEmail] = useState('')
  const [telefono, setTelefono] = useState('')
  const [password, setPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [aceptaTerminos, setAceptaTerminos] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [enviado, setEnviado] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError('La contraseña tiene que tener al menos 8 caracteres.')
      return
    }
    if (password !== repeatPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }
    if (!aceptaTerminos) {
      setError('Tenés que aceptar los términos y la política de privacidad.')
      return
    }

    setLoading(true)
    try {
      const result = await enviarSolicitudAcceso({
        numeroSocio: numeroSocio.trim() ? normalizeNumeroSocio(numeroSocio) : '',
        dni: dni.trim(),
        email: email.trim(),
        telefono: telefono.trim(),
        password,
      })
      if (!result.ok) {
        setError(result.message)
        return
      }
      setEnviado(true)
    } catch {
      setError('No pudimos enviar la solicitud. Probá de nuevo en unos minutos.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#e8f0e6]">
      <header className="sticky top-0 z-30 flex items-center justify-between bg-ivy-500 px-4 py-3.5 text-white shadow-md">
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            aria-label="Volver"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition-all hover:bg-white/20"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          </Link>
          <div className="flex items-center gap-2">
            <img src="/brand/crest-white.png" alt="" className="h-7 w-7 object-contain" />
            <span className="font-serif text-sm font-medium tracking-wide">San Ignacio Rugby</span>
          </div>
        </div>
        <span className="text-[11px] font-medium uppercase tracking-widest text-white/70">Portal</span>
      </header>

      <main className="mx-auto flex max-w-[420px] flex-col px-5 pb-10 pt-6">
        {enviado ? (
          <div className="mt-10 flex flex-col items-center gap-4 rounded-2xl border border-[#d2ddd0] bg-white p-6 text-center shadow-card">
            <span className="material-symbols-outlined text-[40px] text-ivy-500">mark_email_read</span>
            <h1 className="font-serif text-xl font-bold text-ivy-700">Solicitud enviada</h1>
            <p className="text-sm leading-relaxed text-gray-600">
              Revisá tu email para confirmar la cuenta. La secretaría revisa y aprueba el alta en 24 a 48 horas.
            </p>
            <Link
              to="/login"
              className="mt-2 flex h-11 w-full items-center justify-center rounded-xl bg-ivy-500 text-sm font-semibold text-white shadow-md hover:bg-ivy-600"
            >
              Volver al inicio de sesión
            </Link>
          </div>
        ) : (
          <>
            <section className="mb-6">
              <div className="mb-2.5 inline-flex items-center gap-1.5 rounded-full bg-ivy-500/10 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-ivy-700">
                <span className="material-symbols-outlined text-[14px]">person_add</span> Alta de socio
              </div>
              <h1 className="mb-2 font-serif text-2xl font-bold leading-snug tracking-tight text-ivy-700 sm:text-[26px]">
                Activá tu cuenta
              </h1>
              <p className="text-[13.5px] leading-relaxed text-gray-500">
                Verificamos tus datos contra el padrón del club. La secretaría aprueba el alta en 24 a 48 horas.
              </p>
            </section>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label htmlFor="nro-socio" className="block text-[11px] font-bold uppercase tracking-wider text-gray-500">
                    Número de socio
                  </label>
                  <span className="text-[11px] italic text-gray-400">Opcional si no lo sabés</span>
                </div>
                <FieldInput icon="badge" id="nro-socio" placeholder="Ej: 01850" value={numeroSocio} onChange={setNumeroSocio} inputMode="numeric" />
              </div>

              <Field label="DNI" required>
                <FieldInput icon="credit_card" id="dni" placeholder="Sin puntos, ej: 38450123" value={dni} onChange={setDni} inputMode="numeric" required />
              </Field>

              <Field label="Email" required>
                <FieldInput icon="mail" id="email" type="email" placeholder="tu.email@ejemplo.com" value={email} onChange={setEmail} required />
              </Field>

              <Field label="Teléfono" required>
                <FieldInput icon="call" id="telefono" type="tel" placeholder="Ej: +54 9 223 555-1234" value={telefono} onChange={setTelefono} required />
              </Field>

              <Field label="Contraseña" required>
                <FieldInput
                  icon="lock"
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mínimo 8 caracteres"
                  value={password}
                  onChange={setPassword}
                  required
                  trailing={
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label="Mostrar u ocultar contraseña"
                      className="text-gray-400 hover:text-ivy-700"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  }
                />
              </Field>

              <Field label="Repetir contraseña" required>
                <FieldInput
                  icon="gpp_good"
                  id="repeat-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Repetí la contraseña ingresada"
                  value={repeatPassword}
                  onChange={setRepeatPassword}
                  required
                />
              </Field>

              <div className="pt-1.5">
                <label className="flex cursor-pointer select-none items-start gap-2.5">
                  <input
                    type="checkbox"
                    checked={aceptaTerminos}
                    onChange={(e) => setAceptaTerminos(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-ivy-500 focus:ring-ivy-500"
                  />
                  <span className="text-[12.5px] leading-tight text-gray-500">
                    Acepto los <span className="font-medium text-ivy-700 underline">términos</span> y la{' '}
                    <span className="font-medium text-ivy-700 underline">política de privacidad</span>.
                  </span>
                </label>
              </div>

              {error && <p className="text-sm font-medium text-wine">{error}</p>}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-ivy-500 px-4 py-3.5 text-[15px] font-semibold text-white shadow-md transition-all hover:bg-ivy-600 hover:shadow-lg active:scale-[0.99] disabled:opacity-60"
                >
                  <span>{loading ? 'Enviando…' : 'Enviar solicitud'}</span>
                  {!loading && <span className="material-symbols-outlined text-[16px]">send</span>}
                </button>
              </div>
            </form>

            <div className="mt-6 flex items-start gap-3.5 rounded-2xl border border-[#d2ddd0] bg-[#eaf1e8] p-4">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ivy-500/10 text-ivy-700">
                <span className="material-symbols-outlined text-[18px]">help</span>
              </div>
              <div className="flex-1 text-[13px]">
                <p className="font-semibold text-ink">¿No sabés tu número de socio?</p>
                <p className="mt-0.5 text-[12.5px] leading-relaxed text-gray-500">
                  Si no recordás tu número o tenés dudas sobre tu empadronamiento, consultá directamente en
                  secretaría del club.
                </p>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-gray-500">
        {label} {required && <span className="text-cardinal-500">*</span>}
      </label>
      {children}
    </div>
  )
}

interface FieldInputProps {
  icon: string
  id: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: string
  inputMode?: 'text' | 'numeric' | 'tel' | 'email'
  required?: boolean
  trailing?: React.ReactNode
}

function FieldInput({ icon, id, value, onChange, placeholder, type = 'text', inputMode, required, trailing }: FieldInputProps) {
  return (
    <div className="relative">
      <span className="material-symbols-outlined pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-[16px] text-gray-400">
        {icon}
      </span>
      <input
        id={id}
        name={id}
        type={type}
        inputMode={inputMode}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`h-11 w-full rounded-xl border border-surface-border bg-white pl-10 text-sm text-ink shadow-sm outline-none transition-all placeholder:text-gray-400 focus:border-ivy-500 focus:ring-2 focus:ring-ivy-500/30 ${trailing ? 'pr-10' : 'pr-3.5'}`}
      />
      {trailing && <span className="absolute inset-y-0 right-3 flex items-center">{trailing}</span>}
    </div>
  )
}
