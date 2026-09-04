/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
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
        // Rojo Cardinal — color de acento (alertas, estado pendiente/denegado)
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
        // Estados de cuota
        status: {
          alDia: '#2D5233',
          pendiente: '#C88A1E',
          inactivo: '#D12D2E',
        },
        cream: '#F5F1E8',
      },
      fontFamily: {
        serif: ['"Libre Baskerville"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 10px 30px -10px rgba(15, 30, 18, 0.45)',
      },
    },
  },
  plugins: [],
}
