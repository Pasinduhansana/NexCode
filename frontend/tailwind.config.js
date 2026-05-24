/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Semantic color tokens mapped to CSS variables (RGB triplet + alpha support)
        background: 'rgb(var(--background) / <alpha-value>)',
        foreground: 'rgb(var(--foreground) / <alpha-value>)',
        primary: 'rgb(var(--primary) / <alpha-value>)',
        secondary: 'rgb(var(--secondary) / <alpha-value>)',
        card: 'rgb(var(--card) / <alpha-value>)',
        border: 'rgb(var(--border) / <alpha-value>)',
        border_hard: 'rgb(var(--border-hard) / <alpha-value>)',
        muted: 'rgb(var(--muted) / <alpha-value>)',
        accent: 'rgb(var(--accent) / <alpha-value>)',
        text_primary: 'rgb(var(--text-primary) / <alpha-value>)',
        text_secondary: 'rgb(var(--text-secondary) / <alpha-value>)',
        text_muted: 'rgb(var(--text-muted) / <alpha-value>)',
        hero : 'rgb(var(--page-hero) / <alpha-value>)',

        // Preserve legacy color palette for safe incremental migration
        legacyPrimary: {
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
        'hero-gradient': 'linear-gradient(180deg, rgb(var(--page-hero) / 1) 0%, rgb(var(--page-hero-secondary) / 0.9) 50%, rgb(var(--page-hero) / 1) 100%)',
        'card-gradient': 'linear-gradient(135deg, rgba(var(--primary),0.08) 0%, rgba(var(--accent),0.04) 100%)',
        'btn-gradient': 'linear-gradient(135deg, rgb(var(--primary) / 1) 0%, rgb(var(--accent) / 1) 100%)',
      }
    },
  },
  plugins: [],
}
