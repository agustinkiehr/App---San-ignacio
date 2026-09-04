import { Suspense, lazy } from 'react'
import { Route, Routes } from 'react-router-dom'
import CarnetPage from './pages/CarnetPage'
import HomePage from './pages/HomePage'

// html5-qrcode es pesado y sólo lo necesita portería: se separa en su propio chunk.
const PorteriaPage = lazy(() => import('./pages/PorteriaPage'))

// Login + Solicitar Acceso quedaron en pausa (ver README): las páginas y el
// backend (Supabase Auth, tabla solicitudes_acceso, RPC dni_to_email) siguen
// listos en src/pages/LoginPage.tsx, SolicitarAccesoPage.tsx, lib/AuthContext.tsx
// y lib/solicitudes.ts, sólo no están enrutados todavía.

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/carnet" element={<CarnetPage />} />
      <Route
        path="/porteria"
        element={
          <Suspense fallback={<div className="min-h-screen bg-ivy-700" />}>
            <PorteriaPage />
          </Suspense>
        }
      />
    </Routes>
  )
}
