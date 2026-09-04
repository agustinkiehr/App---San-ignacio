import { Suspense, lazy } from 'react'
import { Route, Routes } from 'react-router-dom'
import { RequireAuth } from './components/RequireAuth'
import { AuthProvider } from './lib/AuthContext'
import CarnetPage from './pages/CarnetPage'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import SolicitarAccesoPage from './pages/SolicitarAccesoPage'

// html5-qrcode es pesado y sólo lo necesita portería: se separa en su propio chunk.
const PorteriaPage = lazy(() => import('./pages/PorteriaPage'))

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/solicitar-acceso" element={<SolicitarAccesoPage />} />
        <Route
          path="/carnet"
          element={
            <RequireAuth>
              <CarnetPage />
            </RequireAuth>
          }
        />
        <Route
          path="/porteria"
          element={
            <Suspense fallback={<div className="min-h-screen bg-ivy-700" />}>
              <PorteriaPage />
            </Suspense>
          }
        />
      </Routes>
    </AuthProvider>
  )
}
