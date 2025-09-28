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
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'serif']
      },
      colors: {
        night: {
          900: '#0F0F23',
          800: '#1A1A2E'
        },
        accent: {
          blue: '#00D4FF',
          purple: '#9D4EDD',
          gold: '#FFD700'
        }
      },
      backdropBlur: {
        xs: '2px'
      },
      boxShadow: {
        glass: '0 10px 30px rgba(0,0,0,0.25)',
        card: '0 8px 24px rgba(0,0,0,0.12)'
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
