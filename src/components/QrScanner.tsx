import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode'
import { useEffect, useRef, useState } from 'react'

const ELEMENT_ID = 'qr-reader'

interface QrScannerProps {
  onScan: (decodedText: string) => void
  /** Mientras esté en true, el escáner ignora nuevas lecturas (por ej. mientras se muestra un resultado). */
  paused: boolean
}

export function QrScanner({ onScan, paused }: QrScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const onScanRef = useRef(onScan)
  const pausedRef = useRef(paused)
  const [cameraError, setCameraError] = useState(false)

  onScanRef.current = onScan
  pausedRef.current = paused

  useEffect(() => {
    const scanner = new Html5Qrcode(ELEMENT_ID, {
      formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
      verbose: false,
    })
    scannerRef.current = scanner
    let unmounted = false
    let started = false

    scanner
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          if (!pausedRef.current) onScanRef.current(decodedText)
        },
        () => {
          // ignorar frames sin QR detectado
        },
      )
      .then(() => {
        started = true
        // El componente se desmontó mientras la cámara arrancaba: frenarla ahora.
        if (unmounted) {
          scanner.stop().then(() => scanner.clear()).catch(() => undefined)
        }
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error('No se pudo iniciar la cámara', err)
        if (!unmounted) setCameraError(true)
      })

    return () => {
      unmounted = true
      if (started) {
        scanner
          .stop()
          .then(() => scanner.clear())
          .catch(() => {
            /* ya detenido */
          })
      }
    }
  }, [])

  return (
    <div className="mx-auto w-full max-w-sm">
      <div id={ELEMENT_ID} className="overflow-hidden rounded-2xl" />
      {cameraError && (
        <p className="mt-3 rounded-lg bg-cardinal-500/20 px-4 py-3 text-center text-sm">
          No pudimos acceder a la cámara. Revisá los permisos del navegador y recargá la página.
        </p>
      )}
    </div>
  )
}
