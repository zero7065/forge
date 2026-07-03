/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./client/index.html",
    "./client/src/**/*.{js,ts,jsx,tsx}",
    "./server/**/*.{js,ts}"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        void: {
          black: '#0a0a0a',
          dark: '#0f0f0f',
          DEFAULT: '#0a0a0a'
        },
        ancient: {
          gold: '#C9A84C',
          goldLight: '#E8C84A',
          goldDark: '#8B6914',
          bronze: '#B8860B'
        },
        ghost: {
          white: '#F0EDE8',
          light: '#FAF8F5',
          muted: '#C9C5BF'
        },
        ember: {
          50: '#FFF8F0',
          100: '#FFEFD6',
          200: '#FFDFAD',
          300: '#FFC870',
          400: '#FFAC33',
          500: '#FF8C00',
          600: '#E67300',
          700: '#B35700',
          800: '#803D00',
          900: '#4D1F00'
        }
      },
      fontFamily: {
        cinzel: ['Cinzel', 'serif'],
        inter: ['Inter', 'sans-serif'],
        jetbrains: ['JetBrains Mono', 'monospace']
      },
      animation: {
        'breathe': 'breathe 4s ease-in-out infinite',
        'pulse-slow': 'pulse-slow 6s ease-in-out infinite',
        'pulse-slower': 'pulse-slower 12s ease-in-out infinite',
        'rotate-geometry': 'rotate-geometry 120s linear infinite',
        'rotate-geometry-slow': 'rotate-geometry 240s linear infinite',
        'draw-path': 'draw-path 3s ease-in-out forwards',
        'shimmer': 'shimmer 4s ease-in-out infinite',
        'fade-in': 'fade-in 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
        'slide-up': 'slide-up 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        'slide-in-right': 'slide-in-right 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        'scale-in': 'scale-in 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      },
      keyframes: {
        breathe: {
          '0%, 100%': { opacity: '0.3', transform: 'scale(1)' },
          '50%': { opacity: '0.6', transform: 'scale(1.02)' }
        },
        'pulse-slow': {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' }
        },
        'pulse-slower': {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' }
        },
        'rotate-geometry': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' }
        },
        'draw-path': {
          'from': { strokeDashoffset: '1000' },
          'to': { strokeDashoffset: '0' }
        },
        shimmer: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' }
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        'slide-in-right': {
          '0%': { opacity: '0', transform: 'translateX(100%)' },
          '100%': { opacity: '1', transform: 'translateX(0)' }
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' }
        }
      },
      backgroundImage: {
        'gradient-gold': 'linear-gradient(135deg, #C9A84C, #F0D86C, #C9A84C)',
        'gradient-void': 'radial-gradient(ellipse at center, #0f0f0f 0%, #0a0a0a 100%)',
        'gradient-ember': 'radial-gradient(ellipse at 50% 50%, rgba(255, 140, 0, 0.08) 0%, transparent 70%)'
      },
      boxShadow: {
        'glow-gold': '0 0 40px rgba(201, 168, 76, 0.05), 0 0 80px rgba(201, 168, 76, 0.02)',
        'glow-gold-hover': '0 0 60px rgba(201, 168, 76, 0.1), 0 0 120px rgba(201, 168, 76, 0.05)',
        'glow-ember': '0 0 30px rgba(255, 140, 0, 0.15)'
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem'
      }
    }
  },
  plugins: []
};