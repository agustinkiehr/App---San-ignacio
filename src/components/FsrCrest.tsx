interface FsrCrestProps {
  className?: string
  variant?: 'solid' | 'outline'
  color?: string
}

/**
 * Recreación aproximada del isologo FSR (monograma F-S-R entrelazado dentro de
 * un óvalo tipo balón de rugby). Reemplazar por el archivo oficial de marca
 * (SVG/PNG del brand book) en cuanto esté disponible en el repo.
 */
export function FsrCrest({ className, variant = 'solid', color = '#2D5233' }: FsrCrestProps) {
  const fill = variant === 'solid' ? color : 'none'
  const stroke = variant === 'outline' ? color : 'none'

  return (
    <svg viewBox="0 0 120 160" className={className} role="img" aria-label="Escudo San Ignacio Rugby">
      <ellipse
        cx="60"
        cy="80"
        rx="46"
        ry="76"
        fill="none"
        stroke={variant === 'outline' ? color : color}
        strokeWidth="2.5"
      />
      <text
        x="60"
        y="98"
        textAnchor="middle"
        fontFamily="'Libre Baskerville', Georgia, serif"
        fontWeight="700"
        fontSize="72"
        fill={fill}
        stroke={stroke}
        strokeWidth={variant === 'outline' ? 2 : 0}
      >
        FSR
      </text>
    </svg>
  )
}
