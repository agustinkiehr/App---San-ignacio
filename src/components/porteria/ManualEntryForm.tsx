import { FormEvent, useState } from 'react'

export function ManualEntryForm({ onSubmit, disabled }: { onSubmit: (query: string) => void; disabled: boolean }) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState('')

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!value.trim()) return
    onSubmit(value.trim())
    setValue('')
    setOpen(false)
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-11 flex-1 items-center justify-center gap-2 rounded-lg border border-white/20 text-sm font-semibold text-white/80 transition-colors hover:bg-white/5"
      >
        <span className="material-symbols-outlined text-[18px]">badge</span>
        Ingreso manual
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-1 items-center gap-2">
      <input
        autoFocus
        inputMode="numeric"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="DNI o N° de socio"
        className="h-11 flex-1 rounded-lg border border-white/20 bg-transparent px-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-ivy-300"
      />
      <button
        type="submit"
        disabled={disabled}
        className="h-11 shrink-0 rounded-lg bg-ivy-500 px-4 text-sm font-semibold text-white disabled:opacity-50"
      >
        Validar
      </button>
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="h-11 shrink-0 rounded-lg px-2 text-sm text-white/60"
        aria-label="Cancelar"
      >
        <span className="material-symbols-outlined text-[18px]">close</span>
      </button>
    </form>
  )
}
