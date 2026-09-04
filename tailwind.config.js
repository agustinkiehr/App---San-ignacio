/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Paleta oficial "San Ignacio Heritage" (brand book + Stitch UI kit).
        // Verde Ivy — color primario institucional (headers, botones, carnet)
        ivy: {
          DEFAULT: '#2D5233',
          50: '#EAF0EB',
          100: '#CBDACD',
          200: '#A4BFA8',
          300: '#7CA383',
          400: '#568A5F',
          500: '#2D5233',
          600: '#274A2D',
          700: '#1F3B24',
          800: '#172C1B',
          900: '#0F1E12',
        },
        // Rojo Cardinal — acento (activo, descuentos), sólo micro-detalles
        cardinal: {
          DEFAULT: '#D12D2E',
          50: '#FCE9E9',
          100: '#F7C6C6',
          200: '#EF9C9C',
          300: '#E56F6F',
          400: '#DB4A4B',
          500: '#D12D2E',
          600: '#B02223',
          700: '#8A1B1C',
          800: '#651414',
          900: '#400D0D',
        },
        // Ocre cálido — cuota por vencer / estados transicionales
        ochre: {
          DEFAULT: '#B8791F',
          bg: '#FAF3E8',
          border: '#EBD7B8',
        },
        // Mulberry / vino profundo — cuota vencida, alertas críticas
        wine: {
          DEFAULT: '#9B1C1D',
          bg: '#FDE8E8',
          border: '#F8B4B4',
        },
        // Jerarquía de superficies (modo claro, socio)
        surface: {
          DEFAULT: '#FFFFFF',
          chalk: '#F4F5F3',
          border: '#E2E5E0',
        },
        ink: '#1F2620',
        // Modo nocturno de portería
        night: {
          DEFAULT: '#070c09',
          panel: '#0f1911',
          border: '#1c2b20',
        },
        // Estados de cuota (para badges/semántica rápida en código)
        status: {
          alDia: '#2D5233',
          pendiente: '#B8791F',
          inactivo: '#9B1C1D',
        },
        cream: '#F5F1E8',
      },
      fontFamily: {
        serif: ['"Libre Caslon Text"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(31, 38, 32, 0.04), 0 2px 8px rgba(31, 38, 32, 0.06)',
      },
      borderRadius: {
        DEFAULT: '0.5rem',
      },
    },
  },
  plugins: [],
}
