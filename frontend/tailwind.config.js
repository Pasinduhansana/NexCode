/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff8ff',
          100: '#dbeffe',
          200: '#bfe3fd',
          300: '#92d1fc',
          400: '#5eb6f8',
          500: '#3699f3',
          600: '#1a7de8',
          700: '#1566d0',
          800: '#1753aa',
          900: '#0d2d6b',
          950: '#071b47',
        },
        cyan: {
          400: '#22d3ee',
          500: '#06b6d4',
        },
        dark: {
          900: '#0a0f1e',
          800: '#0d1730',
          700: '#111f42',
        }
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'gradient': 'gradient 8s ease infinite',
        'slide-up': 'slideUp 0.6s ease forwards',
        'fade-in': 'fadeIn 0.8s ease forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(30px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        }
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #0d1730 0%, #0a0f1e 50%, #071b47 100%)',
        'card-gradient': 'linear-gradient(135deg, rgba(26,125,232,0.1) 0%, rgba(6,182,212,0.05) 100%)',
        'btn-gradient': 'linear-gradient(135deg, #1a7de8 0%, #06b6d4 100%)',
      }
    },
  },
  plugins: [],
}
