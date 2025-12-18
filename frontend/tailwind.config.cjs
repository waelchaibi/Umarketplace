/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Montserrat', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'serif']
      },
      colors: {
        midnight: '#0F172A', // Midnight Blue
        rinato: {
          copper: '#EA580C',
          copperLight: '#FDBA74',
          deepRust: '#9A3412'
        },
        slateLight: '#F1F5F9'
      },
      backdropBlur: {
        xs: '2px'
      },
      boxShadow: {
        glass: '0 10px 30px rgba(0,0,0,0.35)',
        card: '0 8px 24px rgba(0,0,0,0.12)'
      },
      backgroundImage: {
        'rinato-metal': 'linear-gradient(135deg, #FDBA74 0%, #EA580C 50%, #9A3412 100%)'
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: 0, transform: 'translateY(8px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' }
        }
      },
      animation: {
        fadeInUp: 'fadeInUp .4s ease-out both'
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/aspect-ratio')
  ],
}
