const ITEMS = [
  { path: 'carnet', label: 'Carnet', icon: 'badge', enabled: true },
  { path: 'beneficios', label: 'Beneficios', icon: 'local_offer', enabled: false },
  { path: 'parrillas', label: 'Parrillas', icon: 'outdoor_grill', enabled: false },
  { path: 'club', label: 'Club', icon: 'shield', enabled: false },
  { path: 'perfil', label: 'Perfil', icon: 'account_circle', enabled: false },
] as const

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-surface-border bg-white/95 pb-safe backdrop-blur-xl">
      <div className="flex h-16 items-center justify-around px-1">
        {ITEMS.map((item) =>
          item.enabled ? (
            <span
              key={item.path}
              className="relative flex min-h-[44px] min-w-[56px] flex-col items-center justify-center gap-0.5 font-bold text-ivy-700 after:absolute after:top-0 after:left-1/2 after:h-0.5 after:w-8 after:-translate-x-1/2 after:rounded-full after:bg-cardinal-500 after:content-['']"
            >
              <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
              <span className="text-[11px] tracking-wide">{item.label}</span>
            </span>
          ) : (
            <span
              key={item.path}
              title="Próximamente"
              className="flex min-h-[44px] min-w-[56px] cursor-not-allowed flex-col items-center justify-center gap-0.5 text-gray-300"
            >
              <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
              <span className="text-[11px] tracking-wide">{item.label}</span>
            </span>
          ),
        )}
      </div>
    </nav>
  )
}
