import { Link } from 'react-router-dom'

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-10 bg-ivy-500 px-6 py-12 text-cream">
      <div className="flex flex-col items-center gap-4">
        <img src="/brand/lockup-white.png" alt="San Ignacio Rugby" className="h-40 w-auto" />
        <p className="text-center text-cream/80">Portal de socios · Desde 1979</p>
      </div>

      <div className="flex w-full max-w-sm flex-col gap-4">
        <Link
          to="/carnet"
          className="rounded-lg bg-cream px-6 py-4 text-center text-lg font-semibold text-ivy-700 shadow-card transition hover:bg-white"
        >
          Mi Carnet
        </Link>
        <Link
          to="/porteria"
          className="rounded-lg border-2 border-cream/70 px-6 py-4 text-center text-lg font-semibold text-cream transition hover:bg-cream/10"
        >
          Panel de Portería
        </Link>
      </div>
    </div>
  )
}
