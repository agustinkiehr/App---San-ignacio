import { Suspense, lazy } from 'react'
import { Route, Routes } from 'react-router-dom'
import CarnetPage from './pages/CarnetPage'
import HomePage from './pages/HomePage'

// html5-qrcode es pesado y sólo lo necesita portería: se separa en su propio chunk.
const PorteriaPage = lazy(() => import('./pages/PorteriaPage'))

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
