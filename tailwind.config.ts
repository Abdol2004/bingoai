import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './contexts/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-baloo)', 'sans-serif'],
        body: ['var(--font-nunito)', 'sans-serif'],
      },
      colors: {
        bingo: {
          50:  '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        bark: {
          50:  '#fef6e4',
          100: '#f0d9b0',
          200: '#c4956a',
          300: '#9d6b3a',
          400: '#6b4423',
          500: '#3d2810',
          600: '#2a1a09',
          700: '#1c1209',
          800: '#130c05',
          900: '#0d0804',
        },
      },
      animation: {
        'paw-bounce': 'pawBounce 0.6s ease-in-out infinite',
        'wag':        'wag 0.5s ease-in-out infinite',
        'fade-up':    'fadeUp 0.5s ease-out forwards',
        'shimmer':    'shimmer 1.8s linear infinite',
        'paw-walk':   'pawWalk 1.2s ease-in-out infinite',
        'float':      'float 3s ease-in-out infinite',
        'pulse-warm': 'pulseWarm 2s ease-in-out infinite',
      },
      keyframes: {
        pawBounce: {
          '0%,100%': { transform: 'translateY(0) rotate(-5deg)' },
          '50%':     { transform: 'translateY(-10px) rotate(5deg)' },
        },
        wag: {
          '0%,100%': { transform: 'rotate(-20deg) translateX(0)' },
          '50%':     { transform: 'rotate(20deg) translateX(4px)' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition:  '200% 0' },
        },
        pawWalk: {
          '0%':   { opacity: '0', transform: 'scale(0.6) translateY(8px)' },
          '40%':  { opacity: '1', transform: 'scale(1) translateY(0)' },
          '70%':  { opacity: '1', transform: 'scale(1) translateY(0)' },
          '100%': { opacity: '0', transform: 'scale(0.6) translateY(-8px)' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%':     { transform: 'translateY(-8px)' },
        },
        pulseWarm: {
          '0%,100%': { boxShadow: '0 0 0 0 rgba(245,158,11,0.4)' },
          '50%':     { boxShadow: '0 0 0 12px rgba(245,158,11,0)' },
        },
      },
      backgroundImage: {
        'warm-gradient': 'linear-gradient(135deg, #0d0804 0%, #1c1209 100%)',
        'amber-gradient': 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        'card-gradient':  'linear-gradient(145deg, #1c1209 0%, #130c05 100%)',
      },
    },
  },
  plugins: [],
}

export default config
