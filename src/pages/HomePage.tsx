import { Link } from 'react-router-dom'
import { FsrCrest } from '../components/FsrCrest'

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-10 bg-ivy-500 px-6 py-12 text-cream">
      <div className="flex flex-col items-center gap-4">
        <FsrCrest className="h-28 w-auto" color="#F5F1E8" />
        <h1 className="text-center text-3xl font-bold">San Ignacio Rugby</h1>
        <p className="text-center text-cream/80">Carnet digital de socios</p>
      </div>

      <div className="flex w-full max-w-sm flex-col gap-4">
        <Link
          to="/carnet"
          className="rounded-xl bg-cream px-6 py-4 text-center text-lg font-semibold text-ivy-700 shadow-card transition hover:bg-white"
        >
          Mi Carnet
        </Link>
        <Link
          to="/porteria"
          className="rounded-xl border-2 border-cream/70 px-6 py-4 text-center text-lg font-semibold text-cream transition hover:bg-cream/10"
        >
          Panel de Portería
        </Link>
      </div>
    </div>
  )
}
